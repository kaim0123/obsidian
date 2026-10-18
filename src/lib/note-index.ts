/** pages/notes/ からの import 用（ディレクトリ名 notes との衝突回避） */
export {
  getNoteIndex,
  urlPathOf,
  idToUrl,
  allFolders,
  findFolder,
  positionInFolder,
  resolveWikilink,
  type NoteRef,
  type OutLink,
  type NoteIndex,
  type FolderNode,
} from './notes';
