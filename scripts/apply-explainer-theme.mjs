// 解説HTML（public/<章>/*.html）に「A ワークベンチ」テーマを書き込む。
//   node scripts/apply-explainer-theme.mjs
// - 共通 style.css を読むページ：public/_解説HTML/style.css の先頭にフォント、末尾にテーマを書き込む
// - CSS を自前で持つページ（41章など）：各ページの </head> 直前に書き込む（単体で使えるよう外部参照しない）
// 目印コメントの間を毎回置き換えるので、何度実行しても同じ結果になる。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const sharedCss = path.join(publicDir, '_解説HTML', 'style.css');
const theme = fs.readFileSync(path.join(root, 'scripts', 'explainer-theme', 'workbench.css'), 'utf8').trim();

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap';
const START = 'workbench-theme:start';
const END = 'workbench-theme:end';

/** 目印の間を置き換える。目印が無ければ insert() で新しく入れる */
function upsert(text, open, close, body, insert) {
  const re = new RegExp(`${escape(open)}[\\s\\S]*?${escape(close)}`);
  const block = `${open}\n${body}\n${close}`;
  return re.test(text) ? text.replace(re, () => block) : insert(text, block);
}
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1) 共通 style.css
let css = fs.readFileSync(sharedCss, 'utf8');
css = upsert(css, `/* ${START}:fonts */`, `/* ${END}:fonts */`, `@import url("${FONTS_URL}");`, (t, b) => `${b}\n${t}`);
css = upsert(css, `/* ${START} */`, `/* ${END} */`, theme, (t, b) => `${t.trimEnd()}\n\n${b}\n`);
fs.writeFileSync(sharedCss, css);

// 2) CSS を自前で持つページ
const headBlock = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  `<link href="${FONTS_URL.replace(/&/g, '&amp;')}" rel="stylesheet">`,
  `<style>\n${theme}\n</style>`,
].join('\n');

let inline = 0;
let shared = 0;
for (const dir of fs.readdirSync(publicDir, { withFileTypes: true })) {
  if (!dir.isDirectory() || /^[_.]/.test(dir.name)) continue;
  for (const name of fs.readdirSync(path.join(publicDir, dir.name))) {
    if (!name.endsWith('.html')) continue;
    const file = path.join(publicDir, dir.name, name);
    const html = fs.readFileSync(file, 'utf8');
    if (html.includes('_解説HTML/style.css')) {
      shared++;
      continue;
    }
    const next = upsert(html, `<!-- ${START} -->`, `<!-- ${END} -->`, headBlock, (t, b) =>
      t.replace('</head>', `${b}\n</head>`),
    );
    if (next !== html) fs.writeFileSync(file, next);
    inline++;
  }
}
console.log(`style.css を更新（${shared} ページが参照）／自前CSSのページ ${inline} 件に書き込み`);
