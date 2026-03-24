/**
 * Address autocomplete service.
 * Delegates to Nominatim (OpenStreetMap). No API key required.
 * To switch to Google Places: replace searchNominatim import and call.
 */
import { searchNominatim } from './geocoding.js'

/**
 * Search for address suggestions matching a query string.
 * @param {string} query
 * @returns {Promise<Array<{label: string, value: string, lat: number, lng: number}>>}
 */
export async function searchAddress(query) {
  return searchNominatim(query)
}
