import { db } from './db'
import type { Bookmark, BookmarkInput } from '../types/Bookmark'

function normalizeInput(input: BookmarkInput): BookmarkInput {
  const title = input.title.trim()
  const rawUrl = input.url.trim()
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  const parsedUrl = new URL(url)

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('La URL debe usar http o https.')
  }
  if (!title) {
    throw new Error('Agrega un título.')
  }

  return {
    title,
    url: parsedUrl.toString(),
    tags: [...new Set(input.tags.map((tag) => tag.trim().toLocaleLowerCase()).filter(Boolean))],
  }
}

export function listBookmarks(): Promise<Bookmark[]> {
  return db.bookmarks.orderBy('createdAt').reverse().toArray()
}

export async function createBookmark(input: BookmarkInput): Promise<number> {
  const normalized = normalizeInput(input)
  const existing = await db.bookmarks.where('url').equals(normalized.url).first()

  if (existing) {
    throw new Error('Este enlace ya está guardado.')
  }

  return db.bookmarks.add({
    ...normalized,
    favorite: false,
    createdAt: new Date().toISOString(),
  })
}

export async function updateBookmark(id: number, input: BookmarkInput): Promise<void> {
  const normalized = normalizeInput(input)
  const duplicate = await db.bookmarks.where('url').equals(normalized.url).first()

  if (duplicate?.id && duplicate.id !== id) {
    throw new Error('Este enlace ya está guardado.')
  }

  await db.bookmarks.update(id, {
    title: normalized.title,
    url: normalized.url,
    tags: normalized.tags,
  })
}

export async function toggleFavorite(id: number, favorite: boolean): Promise<void> {
  await db.bookmarks.update(id, { favorite })
}

export async function deleteBookmark(id: number): Promise<void> {
  await db.bookmarks.delete(id)
}
