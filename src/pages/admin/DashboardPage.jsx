import { useState, useMemo } from 'react'
import { useSolicitudesCtx } from '../../context/SolicitudesContext.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import styles from './DashboardPage.module.css'

// ─── Date helpers ────────────────────────────────────────────

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getDate(s) {
  if (!s.fecha) return null
  return s.fecha.toDate ? s.fecha.toDate() : new Date(s.fecha)
}

function isOverdue(s) {
  if (['dispatched', 'finished', 'cancelled'].includes(s.estado)) return false
  if (s.tipo === 'ahora') return false
  const d = getDate(s)
  if (!d) return false
  return Date.now() > d.getTime() + 5 * 60 * 1000
}

function formatTime(date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const STATUS_LABEL = {
  pending:    'Pendiente',
  approved:   'Aprobada',
  dispatched: 'En ruta',
  finished:   'Finalizada',
  cancelled:  'Cancelada',
}

// ─── Event card ──────────────────────────────────────────────

function EventCard({ s }) {
  const date = getDate(s)
  const overdue = isOverdue(s)
  const colorKey = overdue ? 'overdue' : s.estado

  return (
    <div className={`${styles.event} ${styles[`event_${colorKey}`]}`}>
      <div className={styles.eventTime}>
        {s.tipo === 'ahora' ? 'Ahora' : date ? formatTime(date) : '—'}
      </div>
      <div className={styles.eventPassenger}>{s.pasajero}</div>
      <div className={styles.eventRoute}>
        {s.origen} → {s.destino}
      </div>
      <span className={`${styles.eventBadge} ${styles[`badge_${colorKey}`]}`}>
        {overdue ? 'Demorada' : (STATUS_LABEL[s.estado] ?? s.estado)}
      </span>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────

export default function DashboardPage() {
  const { solicitudes, loading } = useSolicitudesCtx()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))

  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const byDay = useMemo(() => {
    const map = {}
    solicitudes.forEach(s => {
      const d = getDate(s)
      if (!d) return
      const key = d.toISOString().split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => {
        const da = getDate(a)?.getTime() ?? 0
        const db = getDate(b)?.getTime() ?? 0
        return da - db
      })
    )
    return map
  }, [solicitudes])

  function goToPrevWeek() { setWeekStart(d => addDays(d, -7)) }
  function goToNextWeek() { setWeekStart(d => addDays(d, 7)) }
  function goToToday()    { setWeekStart(getMonday(new Date())) }

  const isCurrentWeek = isSameDay(weekStart, getMonday(today))

  if (loading) {
    return <div className={styles.centered}><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Calendario</h1>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={goToPrevWeek}>&#8249;</button>
          <button
            className={`${styles.navBtn} ${styles.navBtnToday} ${isCurrentWeek ? styles.navBtnTodayActive : ''}`}
            onClick={goToToday}
          >
            Hoy
          </button>
          <button className={styles.navBtn} onClick={goToNextWeek}>&#8250;</button>
        </div>
        <span className={styles.weekLabel}>
          {days[0].toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
          {' — '}
          {days[6].toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Calendar grid */}
      <div className={styles.grid}>
        {days.map((day, i) => {
          const key = day.toISOString().split('T')[0]
          const events = byDay[key] ?? []
          const isToday = isSameDay(day, today)

          return (
            <div key={key} className={`${styles.col} ${isToday ? styles.colToday : ''}`}>
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>{DAY_NAMES[i]}</span>
                <span className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>
                  {day.getDate()}
                </span>
                {events.length > 0 && (
                  <span className={styles.dayCount}>{events.length}</span>
                )}
              </div>

              <div className={styles.events}>
                {events.length === 0 ? (
                  <p className={styles.empty}>—</p>
                ) : (
                  events.map(s => <EventCard key={s.id} s={s} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={`${styles.legendDot} ${styles.dot_pending}`} />Pendiente
        <span className={`${styles.legendDot} ${styles.dot_approved}`} />Aprobada
        <span className={`${styles.legendDot} ${styles.dot_dispatched}`} />En ruta
        <span className={`${styles.legendDot} ${styles.dot_finished}`} />Finalizada
        <span className={`${styles.legendDot} ${styles.dot_overdue}`} />Demorada (+5 min)
      </div>
    </div>
  )
}
