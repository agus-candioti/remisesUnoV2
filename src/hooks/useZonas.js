import { useEffect, useState } from 'react'
import { ZonasRepository } from '../repositories/index.js'

export function useZonas() {
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await ZonasRepository.getAll()
      setZonas(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createZona(data) {
    await ZonasRepository.create(data)
    await load()
  }

  async function updateZona(id, data) {
    await ZonasRepository.update(id, data)
    await load()
  }

  async function deleteZona(id) {
    await ZonasRepository.delete(id)
    await load()
  }

  return { zonas, loading, error, createZona, updateZona, deleteZona }
}
