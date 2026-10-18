import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type GitHistoryFile = {
  status: string;
  path: string;
};

export type GitHistoryCommit = {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
  srcCount: number;
  designCount: number;
  files: GitHistoryFile[];
  diff: string;
  truncated: boolean;
};

export type GitHistoryData = {
  enabled: boolean;
  generatedAt: string | null;
  commits: GitHistoryCommit[];
  error?: string;
};

const EMPTY: GitHistoryData = {
  enabled: false,
  generatedAt: null,
  commits: [],
};

const DENY_RE =
  /(^|\/)\.env(\.|$)|(^|\/|-)credentials|(^|\/|-)secret/i;

/** Same allow/deny rules as scripts/extract-git-history.mjs */
export function isAllowedPath(path: string): boolean {
  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized.startsWith('src/') && !normalized.startsWith('design/')) {
    return false;
  }
  if (DENY_RE.test(normalized)) return false;
  return true;
}

export function isGitHistoryEnabled(): boolean {
  return process.env.INCLUDE_GIT_HISTORY === '1';
}

export function loadGitHistory(): GitHistoryData {
  const filePath = join(process.cwd(), '.astro', 'git-history.json');
  if (!existsSync(filePath)) return EMPTY;
  try {
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as GitHistoryData;
    if (!data || !Array.isArray(data.commits)) return EMPTY;
    return data;
  } catch {
    return EMPTY;
  }
}

export function findCommit(
  data: GitHistoryData,
  shortHash: string,
): GitHistoryCommit | undefined {
  return data.commits.find(
    (c) => c.shortHash === shortHash || c.hash.startsWith(shortHash),
  );
}
