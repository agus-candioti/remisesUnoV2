import { useEffect, useState } from 'react'
import { BloqueadasRepository } from '../repositories/index.js'

export function useBloqueadas() {
  const [bloqueadas, setBloqueadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await BloqueadasRepository.getAll()
      setBloqueadas(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createBloqueada(data) {
    await BloqueadasRepository.create(data)
    await load()
  }

  async function deleteBloqueada(id) {
    await BloqueadasRepository.delete(id)
    await load()
  }

  return { bloqueadas, loading, error, createBloqueada, deleteBloqueada }
}
