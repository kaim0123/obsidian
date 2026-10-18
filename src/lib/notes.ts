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

/** ノート本文から出ているウィキリンク（url が null なら未作成） */
export interface OutLink {
  label: string;
  url: string | null;
}

export interface FolderNode {
  path: string;
  name: string;
  label: string;
  url: string;
  folders: FolderNode[];
  notes: NoteRef[];
  /** 配下すべてのノート数 */
  noteCount: number;
  /** フォルダと同名のノート（`foo.md` と `foo/`）。フォルダページの上部に本文を出す */
  folderNote?: NoteRef;
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
    } else if (ent.isFile() && !ent.name.startsWith('.') && /\.md$/i.test(ent.name)) {
      // glob loader と同じく . で始まるファイルは対象外（ツリーから 404 へのリンクを出さない）
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
        noteCount: 0,
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

/** 同名ノートをフォルダノートとして親の一覧から外し、URL をフォルダに合わせる（詳細設計 §3.1） */
function attachFolderNotes(node: FolderNode): number {
  let count = 0;
  for (const f of node.folders) {
    const i = node.notes.findIndex((n) => n.name === f.name);
    if (i !== -1) {
      const [ref] = node.notes.splice(i, 1);
      ref.url = f.url;
      f.folderNote = ref;
      count++;
    }
    count += attachFolderNotes(f);
  }
  return count;
}

function fillNoteCounts(node: FolderNode): number {
  node.noteCount =
    node.notes.length +
    (node.folderNote ? 1 : 0) +
    node.folders.reduce((n, f) => n + fillNoteCounts(f), 0);
  return node.noteCount;
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
    noteCount: 0,
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
  const folderNoteCount = attachFolderNotes(root);
  fillNoteCounts(root);

  const index: NoteIndex = { byId, byName, byPath, root };
  cached = { mtimeMs, index };

  const folderCount = countFolders(root);
  const collisionCount = [...usedCounts.values()].filter((n) => n > 1).length;
  console.log(
    `[notes] indexed: notes=${byId.size} folders=${folderCount} url-collisions=${collisionCount} folder-notes=${folderNoteCount}`,
  );

  return index;
}

export function countFolders(node: FolderNode): number {
  return node.folders.reduce((n, f) => n + 1 + countFolders(f), 0);
}

/** ルートを除くすべてのフォルダ（深さ優先・名前順） */
export function allFolders(node: FolderNode): FolderNode[] {
  return node.folders.flatMap((f) => [f, ...allFolders(f)]);
}

/** フォルダのパス（`''` はルート）から FolderNode を探す */
export function findFolder(folderPath: string): FolderNode | undefined {
  let node: FolderNode | undefined = getNoteIndex().root;
  if (!folderPath) return node;
  for (const part of folderPath.split('/')) {
    node = node.folders.find((f) => f.name === part);
    if (!node) return undefined;
  }
  return node;
}

/** ステータスバー用：`10_基礎概念 › 5 / 6`（フォルダ内のノートの位置） */
export function positionInFolder(id: string): string {
  const folderPath = folderOf(id);
  const folder = findFolder(folderPath);
  const label = folderPath ? folderPath.slice(folderPath.lastIndexOf('/') + 1) : 'docs';
  if (!folder) return label;
  const i = folder.notes.findIndex((n) => n.id === id);
  return i === -1 ? label : `${label} › ${i + 1} / ${folder.notes.length}`;
}

/** 同じフォルダ内で前後のノート（名前順。端では片方が undefined） */
export function neighborsInFolder(id: string): { prev?: NoteRef; next?: NoteRef } {
  const folder = findFolder(folderOf(id));
  if (!folder) return {};
  const i = folder.notes.findIndex((n) => n.id === id);
  if (i === -1) return {};
  return { prev: folder.notes[i - 1], next: folder.notes[i + 1] };
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

function commonDepth(a: string, b: string): number {
  if (!a || !b) return 0;
  const pa = a.split('/');
  const pb = b.split('/');
  let n = 0;
  while (n < pa.length && n < pb.length && pa[n] === pb[n]) n++;
  return n;
}

/** ウィキリンクのリンク先を解決する（Obsidian の「最短パス」に近い規則。詳細設計 §4.2） */
export function resolveWikilink(target: string, fromId: string): NoteRef | undefined {
  const index = getNoteIndex();
  const key = target
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.?\/+/, '')
    .replace(/\.md$/i, '')
    .toLowerCase();
  if (!key) return undefined;

  if (key.includes('/')) {
    const exact = index.byPath.get(key);
    if (exact) return exact;
    const suffix = `/${key}`;
    const matches = [...index.byPath.entries()].filter(([p]) => p.endsWith(suffix));
    if (matches.length === 1) return matches[0][1];
  }

  const candidates = index.byName.get(key);
  if (!candidates || candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  const fromFolder = folderOf(fromId);
  const score = (ref: NoteRef) => ({
    same: ref.folder === fromFolder ? 1 : 0,
    depth: commonDepth(ref.folder, fromFolder),
  });
  return [...candidates].sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    return (
      sb.same - sa.same ||
      sb.depth - sa.depth ||
      a.id.length - b.id.length ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );
  })[0];
}
