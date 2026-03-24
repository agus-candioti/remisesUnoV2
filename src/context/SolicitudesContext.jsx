import { createContext, useContext } from 'react'
import { useSolicitudes } from '../hooks/useSolicitudes.js'

const SolicitudesContext = createContext(null)

/**
 * Wraps the real-time Firestore subscription once at the AdminLayout level.
 * Both the sidebar (for pending count) and SolicitudesPage share the same listener.
 */
export function SolicitudesProvider({ children }) {
  const value = useSolicitudes()
  return (
    <SolicitudesContext.Provider value={value}>
      {children}
    </SolicitudesContext.Provider>
  )
}

export function useSolicitudesCtx() {
  return useContext(SolicitudesContext)
}
