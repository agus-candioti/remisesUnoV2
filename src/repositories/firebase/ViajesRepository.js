import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase/config.js'

const COL = 'registroViajes'

export const ViajesRepository = {
  /**
   * Record a finished trip against a driver.
   * @param {{ choferId, choferNombre, solicitudId, pasajero, origen, destino, fechaViaje, monto, dia }} data
   */
  async create(data) {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      registradoEn: serverTimestamp(),
    })
    return ref.id
  },

  /**
   * Get all trips for a driver on a specific day.
   * @param {string} choferId
   * @param {string} dia  — 'YYYY-MM-DD'
   */
  async getByChoferAndDia(choferId, dia) {
    const q = query(
      collection(db, COL),
      where('choferId', '==', choferId),
      where('dia', '==', dia)
    )
    const snap = await getDocs(q)
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    // Sort by registradoEn ascending (serverTimestamp may be null briefly on create)
    return docs.sort((a, b) =>
      (a.registradoEn?.toMillis?.() ?? 0) - (b.registradoEn?.toMillis?.() ?? 0)
    )
  },
}
