import type { Bookmark } from '../types/Bookmark'

interface BookmarkCardProps {
  bookmark: Bookmark
  onEdit?: (bookmark: Bookmark) => void
  onDelete: (id: number) => Promise<void>
  onToggleFavorite: (id: number, favorite: boolean) => Promise<void>
}

function BookmarkCard({ bookmark, onEdit, onDelete, onToggleFavorite }: BookmarkCardProps) {
  const id = bookmark.id
  const hostname = new URL(bookmark.url).hostname.replace(/^www\./, '')

  return (
    <article className="bookmark-card">
      <div className="bookmark-card__top">
        <a href={bookmark.url} target="_blank" rel="noreferrer">
          <strong>{bookmark.title}</strong>
          <span>{hostname}</span>
        </a>
        <button
          className={`icon-button ${bookmark.favorite ? 'is-favorite' : ''}`}
          type="button"
          aria-label={bookmark.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          title={bookmark.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          disabled={!id}
          onClick={() => id && onToggleFavorite(id, !bookmark.favorite)}
        >
          {bookmark.favorite ? '★' : '☆'}
        </button>
      </div>
      {!!bookmark.tags.length && (
        <div className="card-tags">
          {bookmark.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
      <div className="bookmark-card__footer">
        <time dateTime={bookmark.createdAt}>
          {new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(bookmark.createdAt))}
        </time>
        <div>
          {onEdit && <button className="text-button" type="button" onClick={() => onEdit(bookmark)}>Editar</button>}
          <button className="text-button danger" type="button" disabled={!id} onClick={() => id && onDelete(id)}>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

export default BookmarkCard
