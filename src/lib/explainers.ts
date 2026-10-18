import fs from 'node:fs';
import path from 'node:path';

export interface ExplainerPage {
  name: string; // '00-0_目次'
  url: string;  // '/41_アーキテクチャ/00-0_目次.html'
}

export interface ExplainerFolder {
  folder: string; // '41_アーキテクチャ'
  pages: ExplainerPage[];
}

const PUBLIC_DIR = path.resolve('public');

// public/ の解説HTMLをフォルダごとに列挙する（_ で始まるフォルダは共通CSS/JS置き場なので除外）
export function getExplainers(): ExplainerFolder[] {
  return fs
    .readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map((d) => ({
      folder: d.name,
      pages: fs
        .readdirSync(path.join(PUBLIC_DIR, d.name))
        .filter((f) => f.endsWith('.html'))
        .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }))
        .map((f) => ({
          name: f.replace(/\.html$/, ''),
          url: `/${encodeURIComponent(d.name)}/${encodeURIComponent(f)}`,
        })),
    }))
    .filter((f) => f.pages.length > 0)
    .sort((a, b) => a.folder.localeCompare(b.folder, 'ja', { numeric: true }));
}
