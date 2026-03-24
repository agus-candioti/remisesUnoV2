import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/admin/dashboard',   icon: '📊', label: 'Dashboard'    },
  { to: '/admin/solicitudes', icon: '🚗', label: 'Solicitudes', badge: true },
  { to: '/admin/choferes',    icon: '👤', label: 'Choferes'     },
  { to: '/admin/zonas',       icon: '📍', label: 'Zonas'        },
  { to: '/admin/bloqueadas',  icon: '🚫', label: 'Bloqueadas'   },
]

export default function Sidebar({ onClose, pendingCount = 0 }) {
  const prevCountRef = useRef(pendingCount)
  const [pulse, setPulse] = useState(false)

  // Pulse the badge whenever a new pending solicitud arrives
  useEffect(() => {
    if (pendingCount > prevCountRef.current) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 2200)
      prevCountRef.current = pendingCount
      return () => clearTimeout(t)
    }
    prevCountRef.current = pendingCount
  }, [pendingCount])

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logoMark}>U</span>
        <span className={styles.logoText}>UNO Remises</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.linkLabel}>{item.label}</span>
            {item.badge && pendingCount > 0 && (
              <span className={`${styles.badge} ${pulse ? styles.badgePulse : ''}`}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.version}>v0.1.0</div>
    </aside>
  )
}
