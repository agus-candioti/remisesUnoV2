/**
 * Price calculation utilities.
 * Includes geographic zone matching via point-in-polygon (ray casting).
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

/**
 * Ray casting point-in-polygon test.
 * @param {number} lat
 * @param {number} lng
 * @param {Array<[number, number]>} polygon  — array of [lat, lng] pairs
 * @returns {boolean}
 */
export function pointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { lat: yi, lng: xi } = polygon[i]
    const { lat: yj, lng: xj } = polygon[j]
    const intersects =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

/**
 * Find the first active zona whose polygon contains the given coordinates.
 * @param {number} lat
 * @param {number} lng
 * @param {import('../repositories/interfaces/IZonasRepository').Zona[]} zonas
 * @returns {import('../repositories/interfaces/IZonasRepository').Zona|null}
 */
export function findZoneForCoords(lat, lng, zonas) {
  if (lat == null || lng == null) return null
  return zonas.find(z => z.activa && z.polygon && pointInPolygon(lat, lng, z.polygon)) ?? null
}

/**
 * Calculate the trip price from origin and destination coordinates.
 * If both endpoints fall in zones, returns the higher price.
 * origenLat/origenLng are optional for backwards compatibility.
 * @param {number|null} destinoLat
 * @param {number|null} destinoLng
 * @param {import('../repositories/interfaces/IZonasRepository').Zona[]} zonas
 * @param {number|null} [origenLat]
 * @param {number|null} [origenLng]
 * @returns {number|null}
 */
export function calculateTripPrice(destinoLat, destinoLng, zonas, origenLat = null, origenLng = null) {
  const zonaDestino = findZoneForCoords(destinoLat, destinoLng, zonas)
  const zonaOrigen  = findZoneForCoords(origenLat,  origenLng,  zonas)
  const prices = [zonaDestino?.precio, zonaOrigen?.precio].filter(p => p != null)
  return prices.length > 0 ? Math.max(...prices) : null
}
