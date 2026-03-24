import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../../firebase/config.js'

const COL = 'bloqueadas'

export const BloqueadasRepository = {
  async getAll() {
    const q = query(collection(db, COL), orderBy('fecha'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async create(data) {
    const ref = await addDoc(collection(db, COL), data)
    return ref.id
  },

  async delete(id) {
    await deleteDoc(doc(db, COL, id))
  },
}
