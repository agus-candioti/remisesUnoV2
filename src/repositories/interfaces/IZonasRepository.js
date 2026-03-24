/**
 * @typedef {Object} Zona
 * @property {string} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {number} precio
 * @property {boolean} activa
 * @property {Array<[number, number]>|null} polygon  — GeoJSON-style [[lat,lng],...] polygon or null if not yet drawn
 */

/**
 * @interface IZonasRepository
 */

/**
 * @function getAll
 * @returns {Promise<Zona[]>}
 */

/**
 * @function getById
 * @param {string} id
 * @returns {Promise<Zona|null>}
 */

/**
 * @function create
 * @param {Omit<Zona, 'id'>} data
 * @returns {Promise<string>}
 */

/**
 * @function update
 * @param {string} id
 * @param {Partial<Zona>} data
 * @returns {Promise<void>}
 */

/**
 * @function delete
 * @param {string} id
 * @returns {Promise<void>}
 */
