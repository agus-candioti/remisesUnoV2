import styles from './StatCard.module.css'

export default function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`${styles.card} ${accent ? styles[accent] : ''}`}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
