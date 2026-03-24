import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase/config.js'

const COL = 'solicitudes'

export const SolicitudesRepository = {
  async getAll() {
    const q = query(collection(db, COL), orderBy('fecha', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async getById(id) {
    const snap = await getDoc(doc(db, COL, id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  },

  async create(data) {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      estado: 'pending',
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    })
    return ref.id
  },

  async update(id, data) {
    await updateDoc(doc(db, COL, id), {
      ...data,
      actualizadoEn: serverTimestamp(),
    })
  },

  async updateEstado(id, estado) {
    await updateDoc(doc(db, COL, id), {
      estado,
      actualizadoEn: serverTimestamp(),
    })
  },

  async getByEstado(estado) {
    const q = query(
      collection(db, COL),
      where('estado', '==', estado),
      orderBy('fecha', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async getByDateRange(desde, hasta) {
    const q = query(
      collection(db, COL),
      where('fecha', '>=', Timestamp.fromDate(desde)),
      where('fecha', '<=', Timestamp.fromDate(hasta)),
      orderBy('fecha', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  subscribeToAll(callback) {
    const q = query(collection(db, COL), orderBy('fecha', 'desc'))
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  },
}
