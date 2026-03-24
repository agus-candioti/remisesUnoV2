/**
 * Nominatim geocoding service (OpenStreetMap).
 * Free, no API key required. Rate-limited — keep debounce >= 300ms on callers.
 * To migrate to Google Places: replace searchNominatim body, keep same return shape.
 */

/**
 * @typedef {{ label: string, value: string, lat: number, lng: number }} GeoSuggestion
 */

/**
 * Search for address suggestions using Nominatim.
 * @param {string} query
 * @returns {Promise<GeoSuggestion[]>}
 */
export async function searchNominatim(query) {
  if (!query || query.trim().length < 3) return []
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ar&addressdetails=0`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'es', 'User-Agent': 'UNO Remises App' },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.map(item => ({
      label: item.display_name,
      value: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
  } catch {
    return []
  }
}
