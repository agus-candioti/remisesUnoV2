import styles from './StatusBadge.module.css'

const LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  dispatched: 'Despachada',
  finished: 'Finalizada',
  cancelled: 'Cancelada',
}

export default function StatusBadge({ estado }) {
  return (
    <span className={`${styles.badge} ${styles[estado]}`}>
      {LABELS[estado] ?? estado}
    </span>
  )
}
