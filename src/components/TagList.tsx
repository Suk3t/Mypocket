interface TagListProps {
  tags: string[]
  selectedTag: string | null
  onSelect: (tag: string | null) => void
}

function TagList({ tags, selectedTag, onSelect }: TagListProps) {
  if (!tags.length) return null

  return (
    <div className="tag-list" aria-label="Filtrar por etiqueta">
      <button className={!selectedTag ? 'active' : ''} type="button" onClick={() => onSelect(null)}>
        Todas
      </button>
      {tags.map((tag) => (
        <button className={selectedTag === tag ? 'active' : ''} type="button" key={tag} onClick={() => onSelect(tag)}>
          {tag}
        </button>
      ))}
    </div>
  )
}

export default TagList
