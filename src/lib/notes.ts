import fs from 'node:fs';
import path from 'node:path';
export { NOTES_GLOB_PATTERN } from './note-config';

const DOCS_DIR = path.resolve('docs');

export interface NoteRef {
  id: string;
  name: string;
  folder: string;
  url: string;
}

export interface FolderNode {
  path: string;
  name: string;
  label: string;
  url: string;
  folders: FolderNode[];
  notes: NoteRef[];
}

export interface NoteIndex {
  byId: Map<string, NoteRef>;
  byName: Map<string, NoteRef[]>;
  byPath: Map<string, NoteRef>;
  root: FolderNode;
}

/** URL パス用：`?` `#` `%` を削除、空白を `-`（詳細設計 §3.2） */
function sanitizeSegment(segment: string): string {
  return segment.replace(/[?#%]/g, '').replace(/[\s\u3000]+/g, '-');
}

/** id → URL パス（`/notes/` なし・末尾 `/` なし）。衝突時は呼び出し側で `-2` を付ける */
export function sanitizeIdPath(id: string): string {
  return id
    .replace(/\\/g, '/')
    .split('/')
    .map(sanitizeSegment)
    .filter(Boolean)
    .join('/');
}

/** NoteRef.url（`/notes/.../`）から Astro の `params.path` 用文字列を取り出す */
export function urlPathOf(url: string): string | undefined {
  const stripped = url.replace(/^\/notes\/?/, '').replace(/\/$/, '');
  return stripped || undefined;
}

export function idToUrl(id: string): string {
  const p = sanitizeIdPath(id);
  return p ? `/notes/${p}/` : '/notes/';
}

export function folderOf(id: string): string {
  const i = id.lastIndexOf('/');
  return i === -1 ? '' : id.slice(0, i);
}

export function compareName(a: string, b: string): number {
  return a.localeCompare(b, 'ja', { numeric: true });
}

/** 先頭の番号プレフィックス（`10_` / `01-` など）を除いた表示名 */
export function folderLabel(name: string): string {
  return name.replace(/^\d+[_\-]/, '') || name;
}

function isExcludedDir(name: string, depth: number): boolean {
  if (name.startsWith('.')) return true;
  if (depth === 0 && name.startsWith('_')) return true;
  return false;
}

function walkMarkdownFiles(dir: string, rel: string, depth: number, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (isExcludedDir(ent.name, depth)) continue;
      walkMarkdownFiles(path.join(dir, ent.name), rel ? `${rel}/${ent.name}` : ent.name, depth + 1, out);
    } else if (ent.isFile() && /\.md$/i.test(ent.name)) {
      out.push(rel ? `${rel}/${ent.name}` : ent.name);
    }
  }
}

function ensureFolder(root: FolderNode, folderPath: string, urlOf: (id: string) => string): FolderNode {
  if (!folderPath) return root;
  let node = root;
  const parts = folderPath.split('/');
  let acc = '';
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    let child = node.folders.find((f) => f.name === part);
    if (!child) {
      child = {
        path: acc,
        name: part,
        label: folderLabel(part),
        url: urlOf(acc),
        folders: [],
        notes: [],
      };
      node.folders.push(child);
    }
    node = child;
  }
  return node;
}

function sortTree(node: FolderNode): void {
  node.folders.sort((a, b) => compareName(a.name, b.name));
  node.notes.sort((a, b) => compareName(a.name, b.name));
  for (const f of node.folders) sortTree(f);
}

let cached: { mtimeMs: number; index: NoteIndex } | null = null;

function docsMtimeMs(): number {
  try {
    return fs.statSync(DOCS_DIR).mtimeMs;
  } catch {
    return 0;
  }
}

/** docs/ を走査してノート索引を作る（初回＋docs 更新時のみ再構築） */
export function getNoteIndex(): NoteIndex {
  const mtimeMs = docsMtimeMs();
  if (cached && cached.mtimeMs === mtimeMs) return cached.index;

  const files: string[] = [];
  walkMarkdownFiles(DOCS_DIR, '', 0, files);
  files.sort((a, b) => compareName(a, b));

  // 衝突回避用：sanitize 後のパス → 出現回数
  const usedCounts = new Map<string, number>();
  const idToFinalPath = new Map<string, string>();

  for (const file of files) {
    const id = file.replace(/\.md$/i, '').replace(/\\/g, '/');
    const base = sanitizeIdPath(id);
    const n = (usedCounts.get(base) ?? 0) + 1;
    usedCounts.set(base, n);
    const finalPath = n === 1 ? base : `${base}-${n}`;
    if (n > 1) {
      console.warn(`[notes] URL 衝突: "${id}" → /notes/${finalPath}/`);
    }
    idToFinalPath.set(id, finalPath);
  }

  const urlOf = (id: string) => {
    const p = idToFinalPath.get(id) ?? sanitizeIdPath(id);
    return p ? `/notes/${p}/` : '/notes/';
  };

  const byId = new Map<string, NoteRef>();
  const byName = new Map<string, NoteRef[]>();
  const byPath = new Map<string, NoteRef>();
  const root: FolderNode = {
    path: '',
    name: '',
    label: '',
    url: '/notes/',
    folders: [],
    notes: [],
  };

  for (const file of files) {
    const id = file.replace(/\.md$/i, '').replace(/\\/g, '/');
    const name = id.includes('/') ? id.slice(id.lastIndexOf('/') + 1) : id;
    const folder = folderOf(id);
    const ref: NoteRef = { id, name, folder, url: urlOf(id) };
    byId.set(id, ref);
    byPath.set(id.toLowerCase(), ref);
    const key = name.toLowerCase();
    const list = byName.get(key) ?? [];
    list.push(ref);
    byName.set(key, list);

    const parent = ensureFolder(root, folder, (fp) => {
      const p = sanitizeIdPath(fp);
      return p ? `/notes/${p}/` : '/notes/';
    });
    parent.notes.push(ref);
  }

  sortTree(root);

  const index: NoteIndex = { byId, byName, byPath, root };
  cached = { mtimeMs, index };

  const folderCount = countFolders(root);
  const collisionCount = [...usedCounts.values()].filter((n) => n > 1).length;
  console.log(
    `[notes] indexed: notes=${byId.size} folders=${folderCount} url-collisions=${collisionCount}`,
  );

  return index;
}

function countFolders(node: FolderNode): number {
  return node.folders.reduce((n, f) => n + 1 + countFolders(f), 0);
}

export function breadcrumb(id: string): { label: string; url: string }[] {
  const index = getNoteIndex();
  const parts = id.split('/');
  const crumbs: { label: string; url: string }[] = [{ label: 'docs', url: '/' }];
  let acc = '';
  for (let i = 0; i < parts.length; i++) {
    acc = acc ? `${acc}/${parts[i]}` : parts[i];
    const isLast = i === parts.length - 1;
    const ref = isLast ? index.byId.get(id) : null;
    const folderPath = isLast ? folderOf(id) : acc;
    const label = isLast ? (ref?.name ?? parts[i]) : folderLabel(parts[i]);
    const url = isLast
      ? (ref?.url ?? idToUrl(id))
      : `/notes/${sanitizeIdPath(folderPath)}/`;
    crumbs.push({ label, url });
  }
  return crumbs;
}
