import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ size = 'md' }) {
  return (
    <span className={`${styles.spinner} ${styles[size]}`} aria-label="Cargando" role="status" />
  )
}
