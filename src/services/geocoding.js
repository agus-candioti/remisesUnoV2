/**
 * Google Places API (New) geocoding service.
 * Uses the Places Autocomplete endpoint (v1) which is CORS-compatible for
 * browser requests. Requires VITE_GOOGLE_PLACES_API_KEY in .env.local.
 *
 * Flow:
 *   1. searchGooglePlaces(query)  → suggestions with placeId (no coords yet)
 *   2. getPlaceCoords(placeId)    → { lat, lng } fetched when user selects
 */

/**
 * @typedef {{ label: string, value: string, placeId: string, lat: number|null, lng: number|null }} GeoSuggestion
 */

const KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

// Bias searches toward Campana and the Zona Norte / Buenos Aires metro area.
const LOCATION_BIAS = {
  circle: {
    center: { latitude: -34.167, longitude: -58.957 },
    radius: 80000, // 80 km covers Buenos Aires metro + Zona Norte
  },
}

/**
 * Autocomplete address suggestions via Google Places (New) API.
 * Returns suggestions with placeId; coordinates are null until the user selects.
 * @param {string} query
 * @returns {Promise<GeoSuggestion[]>}
 */
export async function searchGooglePlaces(query) {
  if (!query || query.trim().length < 3) return []
  if (!KEY) {
    console.warn('[geocoding] VITE_GOOGLE_PLACES_API_KEY is not set')
    return []
  }
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': KEY,
      },
      body: JSON.stringify({
        input: query,
        locationBias: LOCATION_BIAS,
        languageCode: 'es',
        regionCode: 'AR',
        includedPrimaryTypes: ['address'],
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[geocoding] autocomplete failed:', res.status, err?.error?.message ?? err)
      return []
    }
    const data = await res.json()
    if (!data.suggestions) return []

    return data.suggestions
      .filter(s => s.placePrediction)
      .map(s => {
        const pred = s.placePrediction
        // Use structuredFormat for a cleaner label when available
        const label = pred.structuredFormat
          ? `${pred.structuredFormat.mainText.text}, ${pred.structuredFormat.secondaryText.text}`
          : pred.text.text
        return {
          label,
          value: label,
          placeId: pred.placeId,
          lat: null,
          lng: null,
        }
      })
  } catch (e) {
    console.error('[geocoding] autocomplete error:', e)
    return []
  }
}

/**
 * Fetch coordinates for a Google place ID.
 * Called once when the user selects a suggestion from the dropdown.
 * @param {string} placeId
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
export async function getPlaceCoords(placeId) {
  if (!KEY || !placeId) return null
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': KEY,
          'X-Goog-FieldMask': 'location',
        },
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[geocoding] place details failed:', res.status, err?.error?.message ?? err)
      return null
    }
    const data = await res.json()
    if (!data.location) return null
    return { lat: data.location.latitude, lng: data.location.longitude }
  } catch (e) {
    console.error('[geocoding] place details error:', e)
    return null
  }
}
