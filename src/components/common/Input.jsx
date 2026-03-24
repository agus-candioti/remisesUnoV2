import styles from './Input.module.css'

export default function Input({
  label,
  error,
  hint,
  as: Tag = 'input',
  className = '',
  ...props
}) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
        </label>
      )}
      <Tag
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
