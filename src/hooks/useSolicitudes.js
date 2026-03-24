import { useEffect, useState } from 'react'
import { SolicitudesRepository } from '../repositories/index.js'

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    const unsub = SolicitudesRepository.subscribeToAll(data => {
      setSolicitudes(data)
      setLoading(false)
    })
    return unsub
  }, [])

  async function updateEstado(id, estado) {
    await SolicitudesRepository.updateEstado(id, estado)
  }

  async function assignDriver(id, choferId, choferNombre) {
    await SolicitudesRepository.update(id, {
      choferAsignado: choferId,
      choferNombre,
      estado: 'approved',
    })
  }

  async function assignZona(id, zonaId, precioEstimado) {
    await SolicitudesRepository.update(id, { zonaId, precioEstimado })
  }

  async function updateNotas(id, notas) {
    await SolicitudesRepository.update(id, { notas })
  }

  return { solicitudes, loading, error, updateEstado, assignDriver, assignZona, updateNotas }
}
