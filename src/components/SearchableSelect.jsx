import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

export default function SearchableSelect({ 
  options = [],       // [{ id, name, group }]
  groups = {},        // { GROUP_KEY: { name: 'Display Name' } }
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  label,
  required = false,
  id
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Find selected item
  const selectedItem = options.find(o => o.id === value)

  // Filter options
  const filtered = useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase().trim()
    return options.filter(o => 
      o.name.toLowerCase().includes(q) ||
      (groups[o.group]?.name || '').toLowerCase().includes(q)
    )
  }, [search, options, groups])

  // Group filtered items
  const groupedFiltered = useMemo(() => {
    const result = []
    const groupKeys = Object.keys(groups)
    
    groupKeys.forEach(gKey => {
      const items = filtered.filter(o => o.group === gKey)
      if (items.length > 0) {
        result.push({ type: 'header', key: gKey, name: groups[gKey].name })
        items.forEach(item => {
          result.push({ type: 'item', ...item })
        })
      }
    })
    
    // Items without groups
    const ungrouped = filtered.filter(o => !groups[o.group])
    ungrouped.forEach(item => {
      result.push({ type: 'item', ...item })
    })
    
    return result
  }, [filtered, groups])

  // Flat list of selectable items for keyboard nav
  const selectableItems = groupedFiltered.filter(i => i.type === 'item')

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.searchable-option')
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIndex])

  const handleOpen = () => {
    setIsOpen(true)
    setSearch('')
    setHighlightIndex(-1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSelect = (item) => {
    onChange({ target: { value: item.id } })
    setIsOpen(false)
    setSearch('')
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        handleOpen()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(prev => Math.min(prev + 1, selectableItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && selectableItems[highlightIndex]) {
          handleSelect(selectableItems[highlightIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearch('')
        break
      default:
        break
    }
  }

  return (
    <div className="searchable-select" ref={containerRef} id={id}>
      {/* Display button */}
      <button 
        type="button"
        className={`searchable-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
      >
        <span className={`searchable-select-value ${!selectedItem ? 'placeholder' : ''}`}>
          {selectedItem ? selectedItem.name : placeholder}
        </span>
        <ChevronDown size={16} className={`searchable-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="searchable-dropdown">
          {/* Search input */}
          <div className="searchable-search-wrapper">
            <Search size={14} className="searchable-search-icon" />
            <input 
              ref={inputRef}
              type="text"
              className="searchable-search-input"
              placeholder="Gõ để tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setHighlightIndex(-1)
              }}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <button 
                type="button" 
                className="searchable-search-clear" 
                onClick={() => { setSearch(''); inputRef.current?.focus() }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="searchable-options" ref={listRef}>
            {groupedFiltered.length === 0 ? (
              <div className="searchable-empty">Không tìm thấy kết quả</div>
            ) : (
              groupedFiltered.map((item, idx) => {
                if (item.type === 'header') {
                  return (
                    <div key={`h-${item.key}`} className="searchable-group-header">
                      {item.name}
                    </div>
                  )
                }
                const selectIdx = selectableItems.findIndex(s => s.id === item.id)
                return (
                  <div
                    key={item.id}
                    className={`searchable-option ${item.id === value ? 'selected' : ''} ${selectIdx === highlightIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightIndex(selectIdx)}
                  >
                    {item.name}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
