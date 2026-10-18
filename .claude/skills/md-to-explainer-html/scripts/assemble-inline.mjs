// 本文の断片に 41章と同じ外枠（埋め込みCSS・topbar・ページ内目次・pager・JS）を付けて public/<章>/ に書き出す。
//   node .claude/skills/md-to-explainer-html/scripts/assemble-inline.mjs <断片フォルダ> <章フォルダ名> <サイト名>
//   例：node …/assemble-inline.mjs <scratchpad>/fragments 42_ソフトウェア設計 ソフトウェア設計解説
// CSS と JS は public/41_アーキテクチャ/00-1_アーキテクチャ全体像.html から取る（41章が正）。テーマはあとで apply-explainer-theme.mjs が当てる。
// 断片の書き方は references/inline-fragment.md。ファイル名の数字順に pager をつなぐ。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const [fragDir, chapter, SITE] = process.argv.slice(2);
if (!fragDir || !chapter || !SITE) {
  console.error('使い方: node assemble-inline.mjs <断片フォルダ> <章フォルダ名> <サイト名>');
  process.exit(2);
}

const source = fs
  .readFileSync(path.join(root, 'public', '41_アーキテクチャ', '00-1_アーキテクチャ全体像.html'), 'utf8')
  .replace(/\r\n/g, '\n')
  .replace(/<!-- workbench-theme:start -->[\s\S]*?<!-- workbench-theme:end -->\n?/, '');
const style = source.match(/<style>[\s\S]*?<\/style>/)[0];
const script = source.match(/<script>[\s\S]*?<\/script>/)[0];
const today = new Date().toISOString().slice(0, 10);

const pages = fs
  .readdirSync(fragDir)
  .filter((f) => /^\d\d-\d+_.+\.html$/.test(f))
  .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }))
  .map((file) => {
    const raw = fs.readFileSync(path.join(fragDir, file), 'utf8').replace(/\r\n/g, '\n');
    const m = raw.match(/^\s*<!--meta\n([\s\S]*?)\n-->\n/);
    if (!m) throw new Error(`meta がありません: ${file}`);
    const meta = Object.fromEntries(
      m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
    );
    for (const k of ['title', 'short', 'crumb']) if (!meta[k]) throw new Error(`${k} がありません: ${file}`);
    // 断片の先頭にある <style> はページ固有のCSSとして <head> に移す（目次ページの idx-card など）
    let body = raw.slice(m[0].length).trim();
    const own = body.match(/^<style>[\s\S]*?<\/style>/)?.[0] ?? '';
    body = body.slice(own.length).trim();
    return { file, ...meta, own, body };
  });

const outDir = path.join(root, 'public', chapter);
fs.mkdirSync(outDir, { recursive: true });

pages.forEach((p, i) => {
  const prev = pages[i - 1];
  const next = pages[i + 1];
  const isToc = p.file === '00-0_目次.html';
  const crumb = isToc ? p.crumb : `<a href="00-0_目次.html">目次</a> › ${p.crumb}`;
  const pager = [
    prev ? `<a class="prev" href="${prev.file}"><span class="lbl">← 前のページ</span>${prev.short}</a>` : '<span class="empty"></span>',
    isToc ? '<span class="idx">目次</span>' : '<a class="idx" href="00-0_目次.html">目次</a>',
    next ? `<a class="next" href="${next.file}"><span class="lbl">次のページ →</span>${next.short}</a>` : '<span class="empty"></span>',
  ];
  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}｜${SITE}</title>
${style}${p.own ? `\n${p.own}` : ''}
</head>
<body>
<header class="topbar">
  <div class="topbar-inner">
    <a class="site" href="00-0_目次.html">${SITE}</a>
    <span class="crumb">${crumb}</span>
    <button class="toc-btn" type="button" aria-controls="toc">目次</button>
    <button class="theme-btn" type="button" aria-label="表示テーマ切替">テーマ</button>
  </div>
</header>

<div class="layout">
  <nav class="toc" id="toc" aria-label="このページの目次">
    <p class="toc-title">このページの目次</p>
    <ol id="toc-list"></ol>
  </nav>

  <main>
    ${p.body}

    <nav class="pager" aria-label="ページ移動">
      ${pager.join('\n      ')}
    </nav>
    <footer class="page-foot">${chapter} ノートをもとに作成（${today}）</footer>
  </main>
</div>

${script}
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, p.file), html);
});
console.log(`${pages.length} ページを書き出しました → ${outDir}`);
