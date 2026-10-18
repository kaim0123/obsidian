/**
 * Build-time Git history extractor for /history pages.
 * Writes src/data/git-history.json (no author email).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Keep outside src/ so writing this file does not retrigger Astro/Vite reload.
const OUT_PATH = join(ROOT, '.astro', 'git-history.json');
const PATHSPECS = ['src', 'design'];
const MAX_DIFF_BYTES = 200 * 1024;

const DENY_RE =
  /(^|\/)\.env(\.|$)|(^|\/|-)credentials|(^|\/|-)secret/i;

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isAllowedPath(path) {
  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized.startsWith('src/') && !normalized.startsWith('design/')) {
    return false;
  }
  if (DENY_RE.test(normalized)) return false;
  return true;
}

/**
 * @param {string[]} args
 * @returns {string}
 */
function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
}

/**
 * @returns {boolean}
 */
function isGitRepo() {
  try {
    git(['rev-parse', '--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Keep only allowed-path file sections from a unified diff.
 * @param {string} raw
 * @returns {string}
 */
function filterDiff(raw) {
  const lines = raw.split('\n');
  const out = [];
  let keep = false;

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      const match = line.match(/diff --git a\/(.+?) b\/(.+)$/);
      const pathB = match?.[2] ?? '';
      keep = isAllowedPath(pathB);
      if (keep) out.push(line);
      continue;
    }
    if (keep) out.push(line);
  }

  return out.join('\n').trimEnd();
}

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function extractGitHistory(options = {}) {
  const enabled =
    options.enabled ?? process.env.INCLUDE_GIT_HISTORY === '1';

  mkdirSync(dirname(OUT_PATH), { recursive: true });

  if (!enabled) {
    writeFileSync(
      OUT_PATH,
      JSON.stringify(
        { enabled: false, generatedAt: null, commits: [] },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    console.log('[git-history] skipped (set INCLUDE_GIT_HISTORY=1 to enable)');
    return;
  }

  if (!isGitRepo()) {
    writeFileSync(
      OUT_PATH,
      JSON.stringify(
        {
          enabled: false,
          generatedAt: null,
          commits: [],
          error: 'not a git repository',
        },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    console.warn('[git-history] not a git repository; wrote empty stub');
    return;
  }

  /** @type {Array<{ hash: string, shortHash: string, date: string, subject: string }>} */
  const meta = [];
  try {
    const log = git([
      'log',
      '--pretty=format:%H%x00%h%x00%ad%x00%s',
      '--date=short',
      '--',
      ...PATHSPECS,
    ]);
    for (const line of log.split('\n')) {
      if (!line.trim()) continue;
      const [hash, shortHash, date, subject] = line.split('\0');
      if (!hash || !shortHash) continue;
      meta.push({
        hash,
        shortHash,
        date: date ?? '',
        subject: subject ?? '',
      });
    }
  } catch (err) {
    console.warn(
      '[git-history] git log failed:',
      err instanceof Error ? err.message : err,
    );
    writeFileSync(
      OUT_PATH,
      JSON.stringify(
        {
          enabled: false,
          generatedAt: null,
          commits: [],
          error: 'git log failed',
        },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    return;
  }

  /** @type {Array<Record<string, unknown>>} */
  const commits = [];

  for (const entry of meta) {
    let nameStatus = '';
    try {
      nameStatus = git([
        'show',
        '--name-status',
        '--format=',
        entry.hash,
        '--',
        ...PATHSPECS,
      ]);
    } catch {
      nameStatus = '';
    }

    /** @type {Array<{ status: string, path: string }>} */
    const files = [];
    let srcCount = 0;
    let designCount = 0;

    for (const row of nameStatus.split('\n')) {
      if (!row.trim()) continue;
      const parts = row.split('\t');
      const status = parts[0] ?? '';
      const path = (parts.length >= 3 ? parts[2] : parts[1]) ?? '';
      if (!path || !isAllowedPath(path)) continue;
      const normalized = path.replace(/\\/g, '/');
      files.push({ status: status.charAt(0) || 'M', path: normalized });
      if (normalized.startsWith('src/')) srcCount += 1;
      if (normalized.startsWith('design/')) designCount += 1;
    }

    if (files.length === 0) continue;

    let diff = '';
    let truncated = false;
    try {
      const raw = git(['show', '--format=', entry.hash, '--', ...PATHSPECS]);
      diff = filterDiff(raw);
      if (Buffer.byteLength(diff, 'utf8') > MAX_DIFF_BYTES) {
        // Truncate on a line boundary when possible
        let cut = diff.slice(0, MAX_DIFF_BYTES);
        const lastNl = cut.lastIndexOf('\n');
        if (lastNl > 0) cut = cut.slice(0, lastNl);
        diff = cut;
        truncated = true;
      }
    } catch {
      diff = '';
    }

    commits.push({
      hash: entry.hash,
      shortHash: entry.shortHash,
      date: entry.date,
      subject: entry.subject,
      srcCount,
      designCount,
      files,
      diff,
      truncated,
    });
  }

  const payload = {
    enabled: true,
    generatedAt: new Date().toISOString(),
    commits,
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(
    `[git-history] wrote ${commits.length} commits → .astro/git-history.json`,
  );
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  extractGitHistory();
}
