interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por título, URL o etiqueta"
        aria-label="Buscar enlaces"
      />
    </label>
  )
}

export default SearchBar
