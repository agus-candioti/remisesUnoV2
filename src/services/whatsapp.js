/**
 * WhatsApp notification service — mock implementation.
 * Currently generates wa.me links that open a pre-filled WhatsApp message.
 * To migrate to Twilio: replace the function bodies while keeping signatures identical.
 */

const ADMIN_NUMBER = import.meta.env.VITE_ADMIN_WA_NUMBER || '5491125941741'

/**
 * Build a wa.me deep link with a pre-filled message.
 * @param {string} phone - Phone number without spaces or symbols (e.g. '5491125941741')
 * @param {string} message - Plain text message to pre-fill
 * @returns {string} WhatsApp URL
 */
export function buildWhatsAppLink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Returns the "when" line for a solicitud, handling ahora vs scheduled.
function whenLine(solicitud) {
  if (solicitud.tipo === 'ahora') return 'Cuando: Ahora mismo'
  const fecha = solicitud.fecha ?? ''
  const hora  = solicitud.hora  ?? ''
  return hora ? `Fecha: ${fecha}\nHora: ${hora}` : `Fecha: ${fecha}`
}

/**
 * Generate a link to notify the admin about a new solicitud.
 * @param {Object} solicitud
 * @param {string} solicitud.pasajero
 * @param {string} solicitud.telefono
 * @param {string} solicitud.origen
 * @param {string} solicitud.destino
 * @param {string} solicitud.tipo - 'ahora' | 'reserva'
 * @param {string} [solicitud.fecha] - formatted date string (reserva only)
 * @param {string} [solicitud.hora]  - formatted time string (reserva only)
 * @returns {string} WhatsApp URL
 */
export function notifyAdminLink(solicitud) {
  const msg =
    `*Nueva solicitud - UNO Remises*\n\n` +
    `Pasajero: ${solicitud.pasajero}\n` +
    `Tel: ${solicitud.telefono}\n` +
    `Origen: ${solicitud.origen}\n` +
    `Destino: ${solicitud.destino}\n` +
    whenLine(solicitud)
  return buildWhatsAppLink(ADMIN_NUMBER, msg)
}

/**
 * Generate a link to notify a driver about their assignment.
 * @param {string} driverPhone
 * @param {Object} solicitud
 * @param {string} solicitud.tipo - 'ahora' | 'reserva'
 * @param {string} [solicitud.fecha]
 * @param {string} [solicitud.hora]
 * @returns {string} WhatsApp URL
 */
export function notifyDriverLink(driverPhone, solicitud) {
  const msg =
    `*UNO Remises - Viaje asignado*\n\n` +
    `Pasajero: ${solicitud.pasajero}\n` +
    `Tel: ${solicitud.telefono}\n` +
    `Origen: ${solicitud.origen}\n` +
    `Destino: ${solicitud.destino}\n` +
    whenLine(solicitud)
  return buildWhatsAppLink(driverPhone, msg)
}
