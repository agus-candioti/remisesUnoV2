/**
 * Address autocomplete service — backed by Google Places API (New).
 * searchAddress returns suggestions with placeId but no coords yet.
 * getPlaceCoords resolves coords for the selected placeId.
 */
import { searchGooglePlaces, getPlaceCoords } from './geocoding.js'

/**
 * @param {string} query
 * @returns {Promise<import('./geocoding.js').GeoSuggestion[]>}
 */
export async function searchAddress(query) {
  return searchGooglePlaces(query)
}

export { getPlaceCoords }
