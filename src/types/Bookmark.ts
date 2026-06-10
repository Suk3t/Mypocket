export interface BookmarkInput {
  title: string
  url: string
  tags: string[]
}

export interface Bookmark extends BookmarkInput {
  id?: number
  favorite: boolean
  createdAt: string
}
