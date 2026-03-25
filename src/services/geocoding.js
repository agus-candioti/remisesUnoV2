/**
 * Nominatim geocoding service (OpenStreetMap).
 * Free, no API key required. Rate-limited — keep debounce >= 300ms on callers.
 * To migrate to Google Places: replace searchNominatim body, keep same return shape.
 */

/**
 * @typedef {{ label: string, value: string, lat: number, lng: number }} GeoSuggestion
 */

// Bounding box covering Campana and the broader Zona Norte / Buenos Aires metro area.
// Format: left (min_lon), top (max_lat), right (max_lon), bottom (min_lat)
// Covers: Campana, Zárate, Escobar, Pilar, Tigre, San Isidro, Buenos Aires city.
const VIEWBOX = '-59.5,-33.0,-57.5,-35.5'

/**
 * Build a concise human-readable address label from Nominatim's addressdetails.
 * e.g. "Arenaza 2175, Campana"  instead of the full verbose display_name.
 */
function buildLabel(item) {
  const a = item.address
  if (!a) return item.display_name

  const parts = []

  // Street + house number
  if (a.road) {
    parts.push(a.house_number ? `${a.road} ${a.house_number}` : a.road)
  } else if (a.pedestrian || a.path) {
    parts.push(a.pedestrian || a.path)
  } else if (item.type === 'amenity' || item.type === 'shop') {
    // Named place with no road — use the name directly
    parts.push(item.name ?? item.display_name.split(',')[0])
  }

  // City / town / village
  const locality = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county
  if (locality) parts.push(locality)

  return parts.length > 0 ? parts.join(', ') : item.display_name
}

/**
 * Search for address suggestions using Nominatim.
 * Results are restricted to the Campana / Buenos Aires Zona Norte area.
 * @param {string} query
 * @returns {Promise<GeoSuggestion[]>}
 */
export async function searchNominatim(query) {
  if (!query || query.trim().length < 3) return []
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '6',
      countrycodes: 'ar',
      addressdetails: '1',
      viewbox: VIEWBOX,
      // No bounded=1: viewbox biases results toward Campana/BA area but
      // still returns results if the exact address isn't in OSM locally.
    })
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'Accept-Language': 'es', 'User-Agent': 'UNO Remises App' } }
    )
    if (!res.ok) return []
    const data = await res.json()

    // Build clean labels and deduplicate (two results can produce the same short label)
    const seen = new Set()
    return data.reduce((acc, item) => {
      const label = buildLabel(item)
      if (!seen.has(label)) {
        seen.add(label)
        acc.push({ label, value: label, lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
      }
      return acc
    }, [])
  } catch {
    return []
  }
}
