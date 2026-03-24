/**
 * @typedef {Object} Bloqueada
 * @property {string} id
 * @property {import('firebase/firestore').Timestamp} fecha
 * @property {import('firebase/firestore').Timestamp|null} hasta
 * @property {string} motivo
 * @property {'dia'|'rango'|'horario'} tipo
 */

/**
 * @interface IBloqueadasRepository
 */

/**
 * @function getAll
 * @returns {Promise<Bloqueada[]>}
 */

/**
 * @function create
 * @param {Omit<Bloqueada, 'id'>} data
 * @returns {Promise<string>}
 */

/**
 * @function delete
 * @param {string} id
 * @returns {Promise<void>}
 */
