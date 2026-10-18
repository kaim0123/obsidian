// 解説HTML（public/<章>/*.html）の検査。
//   node .claude/skills/md-to-explainer-html/scripts/check.mjs public/<章> [public/<章> ...]
// リンク切れ・未定義クラス・必須見出し・pager の前後・目次への載せ漏れ・marker id の重複・古いパスを調べる。
// リンクはサイト配信時と同じく public/ をルートとして解決する。エラーがあれば終了コード 1。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const publicDir = path.join(root, 'public');
const sharedCss = fs.readFileSync(path.join(publicDir, '_解説HTML', 'style.css'), 'utf8');
// prev は pager の目印（スタイルは無いが骨組みとして使う）
const knownClasses = new Set(['prev', ...sharedCss.replace(/url\([^)]*\)/g, '').match(/\.[a-zA-Z][\w-]*/g).map((c) => c.slice(1))]);

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error('使い方: node check.mjs public/<章> [...]');
  process.exit(2);
}

let errors = 0;
let warnings = 0;

for (const arg of dirs) {
  const dir = path.resolve(arg);
  const chapter = path.basename(dir);
  const pages = fs
    .readdirSync(dir)
    .filter((f) => /^\d\d-\d+_.+\.html$/.test(f))
    .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
  const toc = '00-0_目次.html';
  const tocHtml = fs.existsSync(path.join(dir, toc)) ? fs.readFileSync(path.join(dir, toc), 'utf8') : null;

  console.log(`\n== ${chapter}（${pages.length} ページ）`);
  if (!tocHtml) report('error', toc, '目次ページがありません');

  pages.forEach((name, i) => {
    const html = fs.readFileSync(path.join(dir, name), 'utf8');
    const out = (level, msg) => report(level, name, msg);
    const isToc = name === toc;

    // 骨組み
    if (!/<title>[^<]+｜[^<]+<\/title>/.test(html)) out('error', '<title> が「ページ名｜章テーマ解説」の形ではありません');
    if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) out('error', 'h1 がちょうど1つではありません');
    for (const part of ['class="topbar"', 'id="toc-list"', 'class="hero"', 'class="pager"', '_解説HTML/style.css', '_解説HTML/script.js']) {
      if (!html.includes(part)) out('error', `${part} がありません`);
    }
    if (/\/_site\//.test(html)) out('error', 'サイト用スクリプト（/_site/）を書き込まないでください');
    if (/<style[\s>]/.test(html.replace(/<!-- workbench-theme:start -->[\s\S]*?<!-- workbench-theme:end -->/, ''))) {
      out('warn', 'ページ内に <style> があります（共通CSSを使ってください）');
    }
    if (/(href|src)="\.\.\/\.\.\//.test(html)) out('warn', '古いパス（../../）があります。public/<章>/ からは ../ で参照します');

    // 必須見出し
    if (!isToc) {
      for (const h of ['まとめ', '理解度チェック', '参考資料']) {
        if (!new RegExp(`<h2[^>]*>(<span class="num">[^<]*</span>)?${h}</h2>`).test(html)) out('error', `h2「${h}」がありません`);
      }
      if (!html.includes('class="meta"')) out('warn', 'hero に「もとにしたノート」（.meta）がありません');
    }

    // クラス・id・リンク（<pre>・<code> 内のコード例は除く）
    const markup = html.replace(/<pre[\s\S]*?<\/pre>|<code>[\s\S]*?<\/code>/g, '');
    const used = new Set([...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)));
    const unknown = [...used].filter((c) => !knownClasses.has(c));
    if (unknown.length) out('error', `style.css に無いクラス: ${unknown.join(', ')}`);

    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dup = [...new Set(ids.filter((id, j) => ids.indexOf(id) !== j))];
    if (dup.length) out('error', `id が重複: ${dup.join(', ')}`);

    // リンク（配信時と同じく public/ をルートに解決）
    const base = new URL(`http://site/${encodeURIComponent(chapter)}/${encodeURIComponent(name)}`);
    const refs = new Set([...markup.matchAll(/<(?:a|link|script|img)\s[^>]*?(?:href|src)="([^"#]+)(#[^"]*)?"/g)].map((m) => m[1]));
    for (const ref of refs) {
      if (/^(https?:|mailto:|data:)/.test(ref)) continue;
      const target = path.join(publicDir, decodeURIComponent(new URL(ref, base).pathname));
      if (!fs.existsSync(target)) out('error', `リンク切れ: ${ref}`);
    }

    // pager
    const pager = html.match(/<nav class="pager"[\s\S]*?<\/nav>/)?.[0] ?? '';
    const prev = pager.match(/class="prev" href="([^"]+)"/)?.[1] ?? null;
    const next = pager.match(/class="next" href="([^"]+)"/)?.[1] ?? null;
    const wantPrev = pages[i - 1] ?? null;
    const wantNext = pages[i + 1] ?? null;
    if (prev !== wantPrev) out('error', `pager の前ページが ${prev ?? 'なし'}（期待: ${wantPrev ?? 'なし'}）`);
    // 最後のページは「次 → 目次」でもよい
    if (next !== wantNext && !(wantNext === null && next === toc)) out('error', `pager の次ページが ${next ?? 'なし'}（期待: ${wantNext ?? 'なし'}）`);

    // 目次への載せ漏れ
    if (tocHtml && !isToc && !tocHtml.includes(`href="${name}"`)) out('error', '目次ページからリンクされていません');
  });
}

function report(level, file, msg) {
  if (level === 'error') errors++;
  else warnings++;
  console.log(`  ${level === 'error' ? '✕' : '△'} ${file}: ${msg}`);
}

console.log(`\nエラー ${errors} 件／警告 ${warnings} 件`);
process.exit(errors ? 1 : 0);
