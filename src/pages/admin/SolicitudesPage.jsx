import { useState, useMemo } from 'react'
import { useSolicitudesCtx } from '../../context/SolicitudesContext.jsx'
import { useChoferes } from '../../hooks/useChoferes.js'
import { useZonas } from '../../hooks/useZonas.js'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Select from '../../components/common/Select.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import SolicitudDetailModal from '../../components/admin/SolicitudDetailModal.jsx'
import NuevaSolicitudModal from '../../components/admin/NuevaSolicitudModal.jsx'
import { notifyDriverLink } from '../../services/whatsapp.js'
import { formatPrice } from '../../services/priceCalculator.js'
import styles from './SolicitudesPage.module.css'

const ESTADOS = ['todos', 'pending', 'approved', 'dispatched', 'finished', 'cancelled']
const ESTADO_LABELS = {
  todos: 'Todos',
  pending: 'Pendiente',
  approved: 'Aprobada',
  dispatched: 'Despachada',
  finished: 'Finalizada',
  cancelled: 'Cancelada',
}

function formatTs(ts, tipo) {
  if (tipo === 'ahora') return '⚡ Ahora'
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return `Hoy — ${time}`
  if (d.toDateString() === tomorrow.toDateString()) return `Mañana — ${time}`
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' — ' + time
}

export default function SolicitudesPage() {
  const { solicitudes, loading, updateEstado, finalizarViaje, assignDriver, assignZona, createSolicitud } = useSolicitudesCtx()
  const { choferes } = useChoferes()
  const { zonas } = useZonas()

  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterFecha, setFilterFecha] = useState('')

  // Nueva solicitud modal
  const [nuevaModal, setNuevaModal] = useState(false)

  // Detail modal
  const [selected, setSelected] = useState(null)

  // Dispatch modal
  const [dispatchModal, setDispatchModal] = useState(null)
  const [dispatchChoferId, setDispatchChoferId] = useState('')

  // Zone assignment modal
  const [zonaModal, setZonaModal] = useState(null)
  const [selectedZonaId, setSelectedZonaId] = useState('')

  const [actionLoading, setActionLoading] = useState(false)

  // Map of choferId → active trips (approved/dispatched) for conflict detection
  const activeByChofer = useMemo(() => {
    const map = {}
    solicitudes.forEach(s => {
      if (['approved', 'dispatched'].includes(s.estado) && s.choferAsignado) {
        if (!map[s.choferAsignado]) map[s.choferAsignado] = []
        map[s.choferAsignado].push(s)
      }
    })
    return map
  }, [solicitudes])

  const filtered = solicitudes.filter(s => {
    if (filterEstado !== 'todos' && s.estado !== filterEstado) return false
    if (filterFecha) {
      const d = s.fecha?.toDate ? s.fecha.toDate() : new Date(s.fecha)
      if (d.toISOString().split('T')[0] !== filterFecha) return false
    }
    return true
  })

  async function handleEstado(id, newEstado) {
    setActionLoading(true)
    try { await updateEstado(id, newEstado) }
    finally { setActionLoading(false) }
  }

  async function handleFinalizarViaje(s) {
    if (!s.precioEstimado) {
      const ok = window.confirm(
        'Este viaje no tiene precio asignado.\nSi finalizás ahora, no se acreditará ningún monto al saldo del chofer.\n\n¿Querés asignar un precio primero, o finalizar sin registrar ingresos?'
      )
      if (!ok) return
    }
    setActionLoading(true)
    try { await finalizarViaje(s) }
    finally { setActionLoading(false) }
  }

  async function handleDispatch() {
    if (!dispatchChoferId) return
    setActionLoading(true)
    try {
      const chofer = choferes.find(c => c.id === dispatchChoferId)
      await assignDriver(dispatchModal.id, dispatchChoferId, chofer?.nombre ?? '')
      setDispatchModal(null)
      setDispatchChoferId('')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleZona() {
    if (!selectedZonaId) return
    setActionLoading(true)
    try {
      const zona = zonas.find(z => z.id === selectedZonaId)
      await assignZona(zonaModal.id, selectedZonaId, zona?.precio ?? null)
      setZonaModal(null)
      setSelectedZonaId('')
    } finally {
      setActionLoading(false)
    }
  }

  function openDispatch(s) {
    setDispatchModal(s)
    setDispatchChoferId(s.choferAsignado ?? '')
  }

  if (loading) {
    return <div className={styles.centered}><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Solicitudes</h1>
          <span className={styles.count}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <Button onClick={() => setNuevaModal(true)}>Nueva Solicitud</Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.estadoTabs}>
          {ESTADOS.map(e => (
            <button
              key={e}
              className={`${styles.tab} ${filterEstado === e ? styles.tabActive : ''}`}
              onClick={() => setFilterEstado(e)}
            >
              {ESTADO_LABELS[e]}
            </button>
          ))}
        </div>
        <input
          type="date"
          className={styles.dateFilter}
          value={filterFecha}
          onChange={ev => setFilterFecha(ev.target.value)}
          title="Filtrar por fecha"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>No hay solicitudes con estos filtros.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pasajero</th>
                <th>Teléfono</th>
                <th>Origen → Destino</th>
                <th>Fecha</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className={styles.trow} onClick={() => setSelected(s)}>
                  <td className={styles.pasajeroCell}>{s.pasajero}</td>
                  <td>{s.telefono}</td>
                  <td className={styles.route}>{s.origen} → {s.destino}</td>
                  <td className={styles.date}>{formatTs(s.fecha, s.tipo)}</td>
                  <td>
                    {s.precioEstimado
                      ? formatPrice(s.precioEstimado)
                      : (
                        <button
                          className={styles.assignZona}
                          onClick={e => { e.stopPropagation(); setZonaModal(s); setSelectedZonaId(s.zonaId ?? '') }}
                        >
                          + Zona
                        </button>
                      )
                    }
                  </td>
                  <td><StatusBadge estado={s.estado} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className={styles.actions}>
                      {s.estado === 'pending' && (
                        <Button size="sm" onClick={() => openDispatch(s)}>
                          Aprobar
                        </Button>
                      )}
                      {s.estado === 'approved' && (
                        <Button size="sm" variant="secondary" onClick={() => handleEstado(s.id, 'dispatched')}>
                          Despachar
                        </Button>
                      )}
                      {s.estado === 'dispatched' && (
                        <Button size="sm" variant="secondary" onClick={() => handleFinalizarViaje(s)}>
                          Finalizar
                        </Button>
                      )}
                      {!['finished', 'cancelled'].includes(s.estado) && (
                        <Button size="sm" variant="danger" onClick={() => handleEstado(s.id, 'cancelled')}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rich detail modal */}
      {selected && (
        <SolicitudDetailModal
          solicitud={selected}
          choferes={choferes}
          onClose={() => setSelected(null)}
          onEstado={(id, estado) => { handleEstado(id, estado); setSelected(null) }}
          onOpenDispatch={s => { setSelected(null); openDispatch(s) }}
          onFinalizarViaje={s => { handleFinalizarViaje(s); setSelected(null) }}
        />
      )}

      {/* Dispatch / assign driver modal */}
      {dispatchModal && (
        <Modal title="Asignar chofer y aprobar" onClose={() => setDispatchModal(null)} size="sm">
          <div className={styles.modalForm}>
            <p className={styles.modalHint}>
              Seleccioná el chofer para <strong>{dispatchModal.pasajero}</strong>.
            </p>
            <Select
              label="Chofer"
              value={dispatchChoferId}
              onChange={e => setDispatchChoferId(e.target.value)}
            >
              <option value="">— Sin asignar —</option>
              {choferes.filter(c => c.activo).map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.vehiculo} ({c.patente})</option>
              ))}
            </Select>
            {dispatchChoferId && activeByChofer[dispatchChoferId] && (
              <div className={styles.conflictWarning}>
                <strong>Atención:</strong> Este chofer ya tiene{' '}
                {activeByChofer[dispatchChoferId].length === 1
                  ? 'un viaje activo'
                  : `${activeByChofer[dispatchChoferId].length} viajes activos`}.
                {' '}Podés asignarlo igualmente si las rutas son compatibles.
              </div>
            )}
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setDispatchModal(null)}>Cancelar</Button>
              <Button onClick={handleDispatch} loading={actionLoading}>Confirmar</Button>
            </div>
            {dispatchChoferId && (() => {
              const c = choferes.find(ch => ch.id === dispatchChoferId)
              if (!c) return null
              const waLink = notifyDriverLink(c.telefono, {
                pasajero: dispatchModal.pasajero,
                telefono: dispatchModal.telefono,
                origen: dispatchModal.origen,
                destino: dispatchModal.destino,
                tipo: dispatchModal.tipo,
                fecha: dispatchModal.fecha?.toDate ? dispatchModal.fecha.toDate().toLocaleDateString('es-AR') : '',
                hora: dispatchModal.fecha?.toDate ? dispatchModal.fecha.toDate().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '',
              })
              return (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.waLink}>
                  Notificar chofer por WhatsApp →
                </a>
              )
            })()}
          </div>
        </Modal>
      )}

      {/* Nueva solicitud modal */}
      {nuevaModal && (
        <NuevaSolicitudModal
          zonas={zonas}
          onClose={() => setNuevaModal(false)}
          onCreate={createSolicitud}
        />
      )}

      {/* Zone assignment modal */}
      {zonaModal && (
        <Modal title="Asignar zona y precio" onClose={() => setZonaModal(null)} size="sm">
          <div className={styles.modalForm}>
            <Select
              label="Zona"
              value={selectedZonaId}
              onChange={e => setSelectedZonaId(e.target.value)}
            >
              <option value="">— Seleccionar zona —</option>
              {zonas.filter(z => z.activa).map(z => (
                <option key={z.id} value={z.id}>{z.nombre} — {formatPrice(z.precio)}</option>
              ))}
            </Select>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setZonaModal(null)}>Cancelar</Button>
              <Button onClick={handleZona} loading={actionLoading}>Asignar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
