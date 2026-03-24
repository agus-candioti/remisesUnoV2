import { useEffect, useState } from 'react'
import { ChoferesRepository } from '../repositories/index.js'

export function useChoferes() {
  const [choferes, setChoferes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await ChoferesRepository.getAll()
      setChoferes(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createChofer(data) {
    await ChoferesRepository.create(data)
    await load()
  }

  async function updateChofer(id, data) {
    await ChoferesRepository.update(id, data)
    await load()
  }

  async function deleteChofer(id) {
    await ChoferesRepository.delete(id)
    await load()
  }

  return { choferes, loading, error, load, createChofer, updateChofer, deleteChofer }
}
