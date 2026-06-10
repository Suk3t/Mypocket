import Dexie, { type Table } from 'dexie'
import type { Bookmark } from '../types/Bookmark'

export class BookmarkDB extends Dexie {
  bookmarks!: Table<Bookmark, number>

  constructor() {
    super('mypocket')
    this.version(1).stores({
      bookmarks: '++id,&url,title,*tags,favorite,createdAt',
    })
  }
}

export const db = new BookmarkDB()
