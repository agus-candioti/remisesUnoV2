/**
 * Repository exports — swap these implementations to migrate from Firebase.
 * All hooks and components only import from this file, never from firebase/ directly.
 */
export { SolicitudesRepository } from './firebase/SolicitudesRepository.js'
export { ZonasRepository } from './firebase/ZonasRepository.js'
export { ChoferesRepository } from './firebase/ChoferesRepository.js'
export { BloqueadasRepository } from './firebase/BloqueadasRepository.js'
export { ViajesRepository } from './firebase/ViajesRepository.js'
