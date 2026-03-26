import { useEffect, useRef, useState } from 'react'
import { searchAddress, getPlaceCoords } from '../../services/addressAutocomplete.js'
import styles from './AddressInput.module.css'

export default function AddressInput({ label, value, onChange, onSelect, error, id, placeholder }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loadingCoords, setLoadingCoords] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    onChange(val)
    // Clear coords when user types manually (no suggestion selected)
    onSelect?.(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddress(val)
      setSuggestions(results)
      setOpen(results.length > 0)
    }, 350)
  }

  async function handleSelect(suggestion) {
    onChange(suggestion.value)
    setOpen(false)
    setSuggestions([])

    // Google Places returns placeId without coords — resolve them now
    if (suggestion.placeId && (suggestion.lat == null || suggestion.lng == null)) {
      setLoadingCoords(true)
      try {
        const coords = await getPlaceCoords(suggestion.placeId)
        onSelect?.({ ...suggestion, lat: coords?.lat ?? null, lng: coords?.lng ?? null })
      } finally {
        setLoadingCoords(false)
      }
    } else {
      onSelect?.(suggestion)
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          id={id}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loadingCoords && <span className={styles.coordsSpinner} aria-label="Cargando..." />}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {open && (
        <ul className={styles.dropdown}>
          {suggestions.map(s => (
            <li
              key={s.placeId ?? s.value}
              className={styles.option}
              onMouseDown={() => handleSelect(s)}
            >
              <span className={styles.pin}>📍</span> {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
