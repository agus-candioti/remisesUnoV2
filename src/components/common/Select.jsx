import styles from './Select.module.css'

export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
        </label>
      )}
      <select
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
