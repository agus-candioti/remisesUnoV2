import { useSolicitudes } from '../../hooks/useSolicitudes.js'
import StatCard from '../../components/admin/StatCard.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import styles from './DashboardPage.module.css'

function isToday(ts) {
  if (!ts) return false
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
}

function formatTs(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function DashboardPage() {
  const { solicitudes, loading } = useSolicitudes()

  const counts = {
    total: solicitudes.length,
    pending: solicitudes.filter(s => s.estado === 'pending').length,
    approved: solicitudes.filter(s => s.estado === 'approved').length,
    dispatched: solicitudes.filter(s => s.estado === 'dispatched').length,
    finishedToday: solicitudes.filter(s => s.estado === 'finished' && isToday(s.fecha)).length,
  }

  const recent = solicitudes.slice(0, 8)

  if (loading) {
    return (
      <div className={styles.centered}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard label="Total solicitudes" value={counts.total} icon="📋" />
        <StatCard label="Pendientes" value={counts.pending} icon="⏳" accent="pending" />
        <StatCard label="Aprobadas" value={counts.approved} icon="✅" accent="approved" />
        <StatCard label="En ruta" value={counts.dispatched} icon="🚗" accent="dispatched" />
        <StatCard label="Finalizadas hoy" value={counts.finishedToday} icon="🏁" accent="finished" />
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Solicitudes recientes</h2>
        {recent.length === 0 ? (
          <p className={styles.empty}>No hay solicitudes todavía.</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.thead}>
              <span>Pasajero</span>
              <span>Origen → Destino</span>
              <span>Fecha</span>
              <span>Estado</span>
            </div>
            {recent.map(s => (
              <div key={s.id} className={styles.trow}>
                <span className={styles.name}>{s.pasajero}</span>
                <span className={styles.route}>
                  {s.origen} → {s.destino}
                </span>
                <span className={styles.date}>{formatTs(s.fecha)}</span>
                <StatusBadge estado={s.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
