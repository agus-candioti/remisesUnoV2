import { useEffect, useRef, useState } from 'react'
import { searchAddress } from '../../services/addressAutocomplete.js'
import styles from './AddressInput.module.css'

export default function AddressInput({ label, value, onChange, error, id, placeholder }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
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
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddress(val)
      setSuggestions(results)
      setOpen(results.length > 0)
    }, 200)
  }

  function handleSelect(suggestion) {
    onChange(suggestion.value)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      {error && <span className={styles.error}>{error}</span>}
      {open && (
        <ul className={styles.dropdown}>
          {suggestions.map(s => (
            <li
              key={s.value}
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
