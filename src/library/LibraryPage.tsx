import { useEffect, useMemo, useState } from 'react'
import { liveQuery } from 'dexie'
import BookmarkCard from '../components/BookmarkCard'
import SearchBar from '../components/SearchBar'
import TagList from '../components/TagList'
import { deleteBookmark, listBookmarks, toggleFavorite } from '../storage/Bookmarks'
import type { Bookmark } from '../types/Bookmark'

function LibraryPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const subscription = liveQuery(listBookmarks).subscribe({
      next: setBookmarks,
      error: (cause) => setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los enlaces.'),
    })

    return () => subscription.unsubscribe()
  }, [])

  const allTags = useMemo(
    () => [...new Set(bookmarks.flatMap((bookmark) => bookmark.tags))].sort((a, b) => a.localeCompare(b)),
    [bookmarks],
  )

  const filteredBookmarks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return bookmarks.filter((bookmark) => {
      const matchesSearch =
        !normalizedSearch ||
        [bookmark.title, bookmark.url, ...bookmark.tags].some((value) =>
          value.toLocaleLowerCase().includes(normalizedSearch),
        )

      return (
        matchesSearch &&
        (!selectedTag || bookmark.tags.includes(selectedTag)) &&
        (!favoritesOnly || bookmark.favorite)
      )
    })
  }, [bookmarks, favoritesOnly, search, selectedTag])

  return (
    <main className="library-page">
      <header className="library-page__header">
        <div className="brand library-brand">
          <img src="/mypocket-icon.svg" alt="" />
          <div>
            <span className="eyebrow">Biblioteca local</span>
            <h1>Todos tus enlaces</h1>
          </div>
        </div>
        <div className="library-header-actions">
          <button className="drive-button library-drive-button" type="button" disabled title="Google Drive: próximamente">
            <img src="/google-drive.svg" alt="" />
            <span>Google Drive<small>Próximamente</small></span>
          </button>
          <div className="library-stats">
            <div><strong>{bookmarks.length}</strong><span>guardados</span></div>
            <div><strong>{bookmarks.filter((bookmark) => bookmark.favorite).length}</strong><span>favoritos</span></div>
            <div><strong>{allTags.length}</strong><span>etiquetas</span></div>
          </div>
        </div>
      </header>

      <section className="library-toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <label className="favorite-filter">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          Solo favoritos
        </label>
        <TagList tags={allTags} selectedTag={selectedTag} onSelect={setSelectedTag} />
      </section>

      <div className="library-results">
        <div>
          <h2>Enlaces</h2>
          <span>{filteredBookmarks.length} resultados</span>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>

      <section className="bookmark-grid">
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onDelete={deleteBookmark}
            onToggleFavorite={toggleFavorite}
          />
        ))}
        {!filteredBookmarks.length && (
          <div className="empty-state library-empty">
            <strong>No hay enlaces para mostrar</strong>
            <span>Agrega enlaces desde el popup o cambia los filtros.</span>
          </div>
        )}
      </section>
    </main>
  )
}

export default LibraryPage
