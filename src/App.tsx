import { useEffect, useMemo, useState } from 'react'
import { liveQuery } from 'dexie'
import type { FormEvent } from 'react'
import BookmarkCard from './components/BookmarkCard'
import SearchBar from './components/SearchBar'
import TagList from './components/TagList'
import {
  createBookmark,
  deleteBookmark,
  listBookmarks,
  toggleFavorite,
  updateBookmark,
} from './storage/Bookmarks'
import type { Bookmark, BookmarkInput } from './types/Bookmark'
import './App.css'

const emptyForm: BookmarkInput = {
  title: '',
  url: '',
  tags: [],
}

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [form, setForm] = useState<BookmarkInput>(emptyForm)
  const [tagInput, setTagInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [showAllBookmarks, setShowAllBookmarks] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
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
      const matchesTag = !selectedTag || bookmark.tags.includes(selectedTag)
      const matchesFavorite = !favoritesOnly || bookmark.favorite

      return matchesSearch && matchesTag && matchesFavorite
    })
  }, [bookmarks, favoritesOnly, search, selectedTag])

  const visibleBookmarks = showAllBookmarks ? filteredBookmarks : filteredBookmarks.slice(0, 2)

  function resetForm() {
    setForm(emptyForm)
    setTagInput('')
    setEditingId(null)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      const input = {
        ...form,
        tags: tagInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      if (editingId) {
        await updateBookmark(editingId, input)
      } else {
        await createBookmark(input)
      }
      resetForm()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el enlace.')
    }
  }

  function handleEdit(bookmark: Bookmark) {
    if (!bookmark.id) return
    setEditingId(bookmark.id)
    setForm({ title: bookmark.title, url: bookmark.url, tags: bookmark.tags })
    setTagInput(bookmark.tags.join(', '))
    setError('')
  }

  async function loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.url || tab.url.startsWith('chrome://')) {
        throw new Error('Esta pestaña no se puede guardar.')
      }
      setForm({ title: tab.title ?? '', url: tab.url, tags: form.tags })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo leer la pestaña actual.')
    }
  }

  async function openLibrary() {
    const libraryUrl = chrome.runtime.getURL('library.html')
    await chrome.tabs.create({ url: libraryUrl })
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src="/mypocket-icon.svg" alt="" />
          <div>
            <span className="eyebrow">Biblioteca local</span>
            <h1>mypocket</h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button" onClick={openLibrary}>
            Abrir biblioteca
          </button>
          <button className="secondary-button" type="button" onClick={loadCurrentTab}>
            Usar pestaña actual
          </button>
        </div>
      </header>

      <form className="bookmark-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <h2>{editingId ? 'Editar enlace' : 'Guardar un enlace'}</h2>
          {editingId && (
            <button className="text-button" type="button" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
        <label>
          Título
          <input
            required
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Artículo interesante"
          />
        </label>
        <label>
          URL
          <input
            required
            type="url"
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
            placeholder="https://ejemplo.com"
          />
        </label>
        <label>
          Etiquetas
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder="trabajo, lectura, diseño"
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button className="primary-button" type="submit">
          {editingId ? 'Guardar cambios' : 'Agregar a mypocket'}
        </button>
      </form>

      <section className="library">
        <div className="library-heading">
          <div>
            <h2>Enlaces guardados</h2>
            <span>{filteredBookmarks.length} de {bookmarks.length}</span>
          </div>
          <label className="favorite-filter">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) => setFavoritesOnly(event.target.checked)}
            />
            Solo favoritos
          </label>
        </div>

        <SearchBar value={search} onChange={setSearch} />
        <TagList tags={allTags} selectedTag={selectedTag} onSelect={setSelectedTag} />

        <div className="bookmark-list">
          {visibleBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={handleEdit}
              onDelete={deleteBookmark}
              onToggleFavorite={toggleFavorite}
            />
          ))}
          {!filteredBookmarks.length && (
            <div className="empty-state">
              <strong>No hay enlaces para mostrar</strong>
              <span>Guarda uno nuevo o cambia los filtros.</span>
            </div>
          )}
        </div>
        {filteredBookmarks.length > 2 && (
          <button
            className="show-more-button"
            type="button"
            onClick={() => setShowAllBookmarks((current) => !current)}
          >
            {showAllBookmarks ? 'Ver menos' : `Ver más (${filteredBookmarks.length - 2})`}
          </button>
        )}
      </section>
    </main>
  )
}

export default App
