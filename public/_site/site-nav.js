// サイト経由で解説HTMLを開いたときだけ読み込まれる（src/integrations/explainer-nav.ts が差し込む）。
// 解説HTML本体はこのファイルを知らない。単体で使うときは読み込まれないので、何も変わらない。
(function () {
  var HOME = '/';
  var LABEL = 'Knowledge';

  var crumb = document.querySelector('.topbar .crumb');
  if (crumb) {
    // パンくずの先頭に「Knowledge ›」を足す
    var link = document.createElement('a');
    link.href = HOME;
    link.textContent = LABEL;
    crumb.insertBefore(document.createTextNode(' › '), crumb.firstChild);
    crumb.insertBefore(link, crumb.firstChild);
    return;
  }

  // ヘッダーが無いページは、左下に小さなリンクを出す
  var pill = document.createElement('a');
  pill.href = HOME;
  pill.textContent = '← ' + LABEL;
  pill.style.cssText =
    'position:fixed;left:16px;bottom:16px;z-index:50;padding:10px 14px;border-radius:999px;' +
    'background:#1b1e25;color:#e4e6eb;font:500 14px/1 system-ui,sans-serif;text-decoration:none;' +
    'box-shadow:0 2px 8px rgba(0,0,0,.25)';
  document.body.appendChild(pill);
})();
