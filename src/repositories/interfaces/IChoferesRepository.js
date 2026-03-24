/**
 * @typedef {Object} Chofer
 * @property {string} id
 * @property {string} nombre
 * @property {string} telefono
 * @property {string} vehiculo
 * @property {string} patente
 * @property {boolean} activo
 */

/**
 * @interface IChoferesRepository
 */

/**
 * @function getAll
 * @returns {Promise<Chofer[]>}
 */

/**
 * @function getById
 * @param {string} id
 * @returns {Promise<Chofer|null>}
 */

/**
 * @function create
 * @param {Omit<Chofer, 'id'>} data
 * @returns {Promise<string>}
 */

/**
 * @function update
 * @param {string} id
 * @param {Partial<Chofer>} data
 * @returns {Promise<void>}
 */

/**
 * @function delete
 * @param {string} id
 * @returns {Promise<void>}
 */
