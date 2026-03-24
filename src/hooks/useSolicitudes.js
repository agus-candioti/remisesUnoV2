import { useEffect, useState } from 'react'
import { SolicitudesRepository, ChoferesRepository, ViajesRepository } from '../repositories/index.js'

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    const unsub = SolicitudesRepository.subscribeToAll(
      data => { setSolicitudes(data); setLoading(false) },
      err  => { setError(err.message); setLoading(false) }
    )
    return unsub
  }, [])

  async function updateEstado(id, estado) {
    await SolicitudesRepository.updateEstado(id, estado)
  }

  /**
   * Mark a trip as finished, credit the driver's balance, and log the daily record.
   * Only credits if a driver and price are set; safe to call without them.
   */
  async function finalizarViaje(solicitud) {
    await SolicitudesRepository.updateEstado(solicitud.id, 'finished')
    if (solicitud.choferAsignado && solicitud.precioEstimado) {
      const dia = new Date().toISOString().split('T')[0]
      await Promise.all([
        ChoferesRepository.incrementBalance(solicitud.choferAsignado, solicitud.precioEstimado),
        ViajesRepository.create({
          choferId: solicitud.choferAsignado,
          choferNombre: solicitud.choferNombre ?? '',
          solicitudId: solicitud.id,
          pasajero: solicitud.pasajero,
          origen: solicitud.origen,
          destino: solicitud.destino,
          fechaViaje: solicitud.fecha ?? null,
          monto: solicitud.precioEstimado,
          dia,
        }),
      ])
    }
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

  return { solicitudes, loading, error, updateEstado, finalizarViaje, assignDriver, assignZona, updateNotas }
}
