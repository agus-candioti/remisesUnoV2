/**
 * @typedef {Object} Solicitud
 * @property {string} id
 * @property {string} pasajero
 * @property {string} telefono
 * @property {string} origen
 * @property {string} destino
 * @property {import('firebase/firestore').Timestamp} fecha
 * @property {'pending'|'approved'|'dispatched'|'finished'|'cancelled'} estado
 * @property {string|null} zonaId
 * @property {number|null} precioEstimado
 * @property {string|null} choferAsignado
 * @property {string} notas
 * @property {import('firebase/firestore').Timestamp} creadoEn
 * @property {import('firebase/firestore').Timestamp} actualizadoEn
 */

/**
 * @interface ISolicitudesRepository
 *
 * Contract for all solicitud data operations.
 * Swap the implementation in /repositories/index.js to migrate backends.
 */

/**
 * @function getAll
 * @returns {Promise<Solicitud[]>}
 */

/**
 * @function getById
 * @param {string} id
 * @returns {Promise<Solicitud|null>}
 */

/**
 * @function create
 * @param {Omit<Solicitud, 'id'|'creadoEn'|'actualizadoEn'>} data
 * @returns {Promise<string>} New document ID
 */

/**
 * @function update
 * @param {string} id
 * @param {Partial<Solicitud>} data
 * @returns {Promise<void>}
 */

/**
 * @function updateEstado
 * @param {string} id
 * @param {Solicitud['estado']} estado
 * @returns {Promise<void>}
 */

/**
 * @function getByEstado
 * @param {Solicitud['estado']} estado
 * @returns {Promise<Solicitud[]>}
 */

/**
 * @function getByDateRange
 * @param {Date} desde
 * @param {Date} hasta
 * @returns {Promise<Solicitud[]>}
 */

/**
 * @function subscribeToAll
 * @param {function(Solicitud[]): void} callback
 * @returns {function} unsubscribe function
 */
