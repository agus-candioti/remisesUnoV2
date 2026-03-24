/**
 * Address autocomplete service — mock implementation.
 * Returns hardcoded Buenos Aires neighborhood suggestions.
 * To migrate to Google Places API: replace the searchAddress body,
 * keeping the same function signature and return shape.
 */

const MOCK_ADDRESSES = [
  'Palermo, CABA',
  'Belgrano, CABA',
  'Recoleta, CABA',
  'San Telmo, CABA',
  'Villa Urquiza, CABA',
  'Caballito, CABA',
  'Flores, CABA',
  'Almagro, CABA',
  'Boedo, CABA',
  'Villa Crespo, CABA',
  'Núñez, CABA',
  'Colegiales, CABA',
  'Chacarita, CABA',
  'Paternal, CABA',
  'Villa del Parque, CABA',
  'Monte Castro, CABA',
  'Floresta, CABA',
  'Liniers, CABA',
  'Mataderos, CABA',
  'Villa Lugano, CABA',
  'Barracas, CABA',
  'La Boca, CABA',
  'Puerto Madero, CABA',
  'Monserrat, CABA',
  'San Nicolás, CABA',
  'Retiro, CABA',
  'Microcentro, CABA',
]

/**
 * Search for address suggestions matching a query string.
 * @param {string} query
 * @returns {Promise<Array<{label: string, value: string}>>}
 */
export async function searchAddress(query) {
  if (!query || query.trim().length < 2) return []

  // Simulate async latency
  await new Promise(r => setTimeout(r, 120))

  const lower = query.toLowerCase()
  return MOCK_ADDRESSES
    .filter(a => a.toLowerCase().includes(lower))
    .slice(0, 5)
    .map(a => ({ label: a, value: a }))
}
