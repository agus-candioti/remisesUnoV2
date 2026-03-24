import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import ThemeToggle from '../common/ThemeToggle.jsx'
import Button from '../common/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { SolicitudesProvider, useSolicitudesCtx } from '../../context/SolicitudesContext.jsx'
import styles from './AdminLayout.module.css'

function AdminLayoutInner() {
  const { logout } = useAuth()
  const { solicitudes } = useSolicitudesCtx() ?? { solicitudes: [] }
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pendingCount = solicitudes.filter(s => s.estado === 'pending').length

  async function handleLogout() {
    await logout()
  }

  return (
    <div className={styles.shell}>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.open : ''}`}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          pendingCount={pendingCount}
        />
      </div>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span className={styles.spacer} />
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Salir
          </Button>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <SolicitudesProvider>
      <AdminLayoutInner />
    </SolicitudesProvider>
  )
}
