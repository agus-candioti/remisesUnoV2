import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../../firebase/config.js'

const COL = 'choferes'

export const ChoferesRepository = {
  async getAll() {
    const q = query(collection(db, COL), orderBy('nombre'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async getById(id) {
    const snap = await getDoc(doc(db, COL, id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  },

  async create(data) {
    const ref = await addDoc(collection(db, COL), data)
    return ref.id
  },

  async update(id, data) {
    await updateDoc(doc(db, COL, id), data)
  },

  async delete(id) {
    await deleteDoc(doc(db, COL, id))
  },
}
