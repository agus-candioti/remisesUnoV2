import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import { formatPrice } from '../../services/priceCalculator.js'
import { buildWhatsAppLink, notifyDriverLink } from '../../services/whatsapp.js'
import styles from './SolicitudDetailModal.module.css'

function formatTs(ts, tipo) {
  if (tipo === 'ahora') return '⚡ Ahora mismo'
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return `Hoy — ${time}`
  if (d.toDateString() === tomorrow.toDateString()) return `Mañana — ${time}`
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) +
    ' — ' + time
}

function customerWaLink(s) {
  let ref
  if (s.tipo === 'ahora') {
    ref = 'tu solicitud inmediata'
  } else {
    const fecha = s.fecha?.toDate ? s.fecha.toDate().toLocaleDateString('es-AR') : ''
    const hora  = s.fecha?.toDate ? s.fecha.toDate().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''
    ref = `tu reserva del ${fecha} a las ${hora}`
  }
  const msg =
    `Hola ${s.pasajero}, te contactamos desde *UNO Remises* en relación a ${ref}.\n\n` +
    `📍 *Origen:* ${s.origen}\n` +
    `🏁 *Destino:* ${s.destino}`
  return buildWhatsAppLink(s.telefono.replace(/\D/g, ''), msg)
}

/**
 * @param {{
 *   solicitud: object,
 *   choferes: object[],
 *   onClose: function,
 *   onEstado: function(id, estado),
 *   onOpenDispatch: function(solicitud),
 * }} props
 */
export default function SolicitudDetailModal({ solicitud: s, choferes, onClose, onEstado, onOpenDispatch }) {
  const chofer = choferes?.find(c => c.id === s.choferAsignado)
  const shortId = s.id.slice(-6).toUpperCase()

  return (
    <Modal title="" onClose={onClose} size="md">
      <div className={styles.wrapper}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.reservaId}>Reserva #{shortId}</span>
            <h2 className={styles.pasajero}>{s.pasajero}</h2>
          </div>
          <StatusBadge estado={s.estado} />
        </div>

        {/* Trip details */}
        <div className={styles.section}>
          <div className={styles.routeCard}>
            <div className={styles.routePoint}>
              <span className={styles.routeDot} data-type="origin" />
              <div>
                <span className={styles.routeLabel}>Origen</span>
                <span className={styles.routeValue}>{s.origen}</span>
              </div>
            </div>
            <div className={styles.routeLine} />
            <div className={styles.routePoint}>
              <span className={styles.routeDot} data-type="dest" />
              <div>
                <span className={styles.routeLabel}>Destino</span>
                <span className={styles.routeValue}>{s.destino}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Fecha y hora</span>
            <span className={styles.metaValue}>{formatTs(s.fecha, s.tipo)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Precio estimado</span>
            <span className={`${styles.metaValue} ${styles.price}`}>{formatPrice(s.precioEstimado)}</span>
          </div>
          {chofer && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Chofer asignado</span>
              <span className={styles.metaValue}>{chofer.nombre} · {chofer.vehiculo} <span className={styles.patente}>{chofer.patente}</span></span>
            </div>
          )}
          {s.notas && (
            <div className={`${styles.metaItem} ${styles.metaFull}`}>
              <span className={styles.metaLabel}>Notas</span>
              <span className={styles.metaValue}>{s.notas}</span>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className={styles.contactRow}>
          <div className={styles.contactInfo}>
            <span className={styles.metaLabel}>Contacto del pasajero</span>
            <span className={styles.phone}>{s.telefono}</span>
          </div>
          <a
            href={customerWaLink(s)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.107 1.521 5.834L0 24l6.335-1.501A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.376l-.36-.213-3.727.883.898-3.635-.234-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Chatear con el pasajero
          </a>
        </div>

        {/* Action buttons */}
        {!['finished', 'cancelled'].includes(s.estado) && (
          <div className={styles.actions}>
            {s.estado === 'pending' && (
              <Button onClick={() => { onClose(); onOpenDispatch(s) }}>
                ✓ Aprobar y asignar chofer
              </Button>
            )}
            {s.estado === 'approved' && (
              <Button variant="secondary" onClick={() => onEstado(s.id, 'dispatched')}>
                🚗 Marcar como despachada
              </Button>
            )}
            {s.estado === 'dispatched' && (
              <Button variant="secondary" onClick={() => onEstado(s.id, 'finished')}>
                🏁 Finalizar viaje
              </Button>
            )}
            <Button variant="danger" onClick={() => { onEstado(s.id, 'cancelled'); onClose() }}>
              Cancelar reserva
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
