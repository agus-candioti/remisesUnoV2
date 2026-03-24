import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/admin/dashboard',   icon: '📊', label: 'Dashboard'    },
  { to: '/admin/solicitudes', icon: '🚗', label: 'Solicitudes'  },
  { to: '/admin/choferes',    icon: '👤', label: 'Choferes'     },
  { to: '/admin/zonas',       icon: '📍', label: 'Zonas'        },
  { to: '/admin/bloqueadas',  icon: '🚫', label: 'Bloqueadas'   },
]

export default function Sidebar({ onClose }) {
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
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.version}>v0.1.0</div>
    </aside>
  )
}
