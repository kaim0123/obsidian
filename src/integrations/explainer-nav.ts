import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

// 解説HTML（public/<章>/*.html）に、サイト全体へ戻るためのスクリプトを「配信時だけ」差し込む。
// public/ の原本は変更しない（N-06）。HTML を単体で使うときは差し込まれないので疎結合を保てる。

const TAG = '<script src="/_site/site-nav.js" defer></script>';

/** public/ 直下の、_ や . で始まらない章フォルダにある .html か */
function isExplainer(relPath: string): boolean {
  const parts = relPath.split(/[\\/]/);
  return parts.length === 2 && !/^[_.]/.test(parts[0]) && parts[1].endsWith('.html');
}

function inject(html: string): string {
  if (html.includes(TAG)) return html;
  return html.includes('</body>') ? html.replace('</body>', `${TAG}\n</body>`) : html + TAG;
}

function listExplainers(publicDir: string): string[] {
  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => fs.readdirSync(path.join(publicDir, d.name)).map((f) => `${d.name}/${f}`))
    .filter(isExplainer);
}

export default function explainerNav(): AstroIntegration {
  let publicDir = '';
  return {
    name: 'explainer-nav',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        // path.resolve で末尾の区切り文字を落とす（下の startsWith 判定のため）
        publicDir = path.resolve(fileURLToPath(config.publicDir));
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'explainer-nav:dev',
                // dev サーバー：public の静的配信より先に、解説HTMLのリクエストだけ横取りして差し込む
                configureServer(server) {
                  server.middlewares.use((req, res, next) => {
                    let rel: string;
                    try {
                      rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
                    } catch {
                      return next();
                    }
                    if (!isExplainer(rel)) return next();
                    const file = path.resolve(publicDir, rel);
                    if (!file.startsWith(publicDir + path.sep) || !fs.existsSync(file)) return next();
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.end(inject(fs.readFileSync(file, 'utf8')));
                  });
                },
              },
            ],
          },
        });
      },
      // 本番ビルド：dist/ にコピーされた解説HTMLにだけ差し込む
      'astro:build:done': ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const pages = listExplainers(publicDir);
        for (const rel of pages) {
          const file = path.join(outDir, rel);
          if (fs.existsSync(file)) fs.writeFileSync(file, inject(fs.readFileSync(file, 'utf8')));
        }
        logger.info(`解説HTML ${pages.length} ページに全体ナビを差し込みました`);
      },
    },
  };
}
