/**
 * Price calculation utilities.
 * Zone assignment is done by the admin after trip submission.
 * This module provides client-side helpers for display purposes.
 */

/**
 * Get the price from an assigned zona object.
 * @param {import('../repositories/interfaces/IZonasRepository').Zona|null} zona
 * @returns {number|null}
 */
export function getPriceFromZona(zona) {
  return zona?.precio ?? null
}

/**
 * Format a price number as Argentine Pesos.
 * @param {number|null} price
 * @returns {string}
 */
export function formatPrice(price) {
  if (price == null) return 'A confirmar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price)
}
