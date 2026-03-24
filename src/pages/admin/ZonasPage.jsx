import { useState } from 'react'
import { useZonas } from '../../hooks/useZonas.js'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Input from '../../components/common/Input.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ZonaMapEditor from '../../components/admin/ZonaMapEditor.jsx'
import { formatPrice } from '../../services/priceCalculator.js'
import styles from './CrudPage.module.css'
import zonaStyles from './ZonasPage.module.css'

const EMPTY_FORM = { nombre: '', descripcion: '', precio: '', activa: true }

export default function ZonasPage() {
  const { zonas, loading, createZona, updateZona, deleteZona } = useZonas()
  const [modal, setModal] = useState(null)
  const [mapZona, setMapZona] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function openNew() {
    setForm(EMPTY_FORM)
    setErrors({})
    setModal('new')
  }

  function openEdit(z) {
    setForm({ nombre: z.nombre, descripcion: z.descripcion, precio: String(z.precio), activa: z.activa })
    setErrors({})
    setModal(z)
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.precio || isNaN(Number(form.precio))) e.precio = 'Precio inválido'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const data = { ...form, precio: Number(form.precio) }
      if (modal === 'new') {
        await createZona(data)
      } else {
        await updateZona(modal.id, data)
      }
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta zona?')) return
    await deleteZona(id)
  }

  async function handleMapSave(polygon) {
    await updateZona(mapZona.id, { ...mapZona, polygon })
    setMapZona(null)
  }

  if (loading) return <div className={styles.centered}><LoadingSpinner size="lg" /></div>

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Zonas</h1>
        <Button onClick={openNew}>+ Nueva zona</Button>
      </div>

      <p className={styles.hint}>
        Las zonas con sus precios son visibles solo para administradores. Dibujá el polígono de cada zona para calcular precios automáticamente.
      </p>

      {zonas.length === 0 ? (
        <p className={styles.empty}>No hay zonas configuradas.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Mapa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map(z => (
                <tr key={z.id}>
                  <td className={styles.bold}>{z.nombre}</td>
                  <td>{z.descripcion || '—'}</td>
                  <td className={styles.price}>{formatPrice(z.precio)}</td>
                  <td>
                    <button
                      className={`${zonaStyles.mapBtn} ${z.polygon ? zonaStyles.mapBtnActive : ''}`}
                      onClick={() => setMapZona(z)}
                      title={z.polygon ? 'Zona dibujada — click para editar' : 'Sin polígono — click para dibujar'}
                    >
                      {z.polygon ? '📍 Editár' : '🗺 Dibujar'}
                    </button>
                  </td>
                  <td>
                    <span className={z.activa ? styles.badgeActive : styles.badgeInactive}>
                      {z.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(z)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(z.id)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'new' ? 'Nueva zona' : 'Editar zona'}
          onClose={() => setModal(null)}
          size="sm"
        >
          <div className={styles.form}>
            <Input label="Nombre de zona" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} error={errors.nombre} placeholder="Ej: Centro — Palermo" />
            <Input label="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción interna" />
            <Input label="Precio (ARS)" type="number" min="0" step="50" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} error={errors.precio} />
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={form.activa} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))} />
              Zona activa
            </label>
            <div className={styles.formActions}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
              <Button onClick={handleSave} loading={saving}>Guardar</Button>
            </div>
          </div>
        </Modal>
      )}

      {mapZona && (
        <ZonaMapEditor
          zona={mapZona}
          onSave={handleMapSave}
          onClose={() => setMapZona(null)}
        />
      )}
    </div>
  )
}
