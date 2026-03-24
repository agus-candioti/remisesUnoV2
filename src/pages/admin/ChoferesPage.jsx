import { useState } from 'react'
import { useChoferes } from '../../hooks/useChoferes.js'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Input from '../../components/common/Input.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import styles from './CrudPage.module.css'

const EMPTY_FORM = { nombre: '', telefono: '', vehiculo: '', patente: '', activo: true }

export default function ChoferesPage() {
  const { choferes, loading, createChofer, updateChofer, deleteChofer } = useChoferes()
  const [modal, setModal] = useState(null) // null | 'new' | chofer object (edit)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function openNew() {
    setForm(EMPTY_FORM)
    setErrors({})
    setModal('new')
  }

  function openEdit(c) {
    setForm({ nombre: c.nombre, telefono: c.telefono, vehiculo: c.vehiculo, patente: c.patente, activo: c.activo })
    setErrors({})
    setModal(c)
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.telefono.trim()) e.telefono = 'Requerido'
    if (!form.vehiculo.trim()) e.vehiculo = 'Requerido'
    if (!form.patente.trim()) e.patente = 'Requerido'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (modal === 'new') {
        await createChofer(form)
      } else {
        await updateChofer(modal.id, form)
      }
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este chofer?')) return
    await deleteChofer(id)
  }

  if (loading) return <div className={styles.centered}><LoadingSpinner size="lg" /></div>

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Choferes</h1>
        <Button onClick={openNew}>+ Nuevo chofer</Button>
      </div>

      {choferes.length === 0 ? (
        <p className={styles.empty}>No hay choferes registrados.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Vehículo</th>
                <th>Patente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {choferes.map(c => (
                <tr key={c.id}>
                  <td className={styles.bold}>{c.nombre}</td>
                  <td>{c.telefono}</td>
                  <td>{c.vehiculo}</td>
                  <td><span className={styles.mono}>{c.patente}</span></td>
                  <td>
                    <span className={c.activo ? styles.badgeActive : styles.badgeInactive}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Eliminar</Button>
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
          title={modal === 'new' ? 'Nuevo chofer' : 'Editar chofer'}
          onClose={() => setModal(null)}
          size="md"
        >
          <div className={styles.form}>
            <div className={styles.grid2}>
              <Input label="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} error={errors.nombre} />
              <Input label="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} error={errors.telefono} />
            </div>
            <div className={styles.grid2}>
              <Input label="Vehículo" placeholder="Toyota Corolla" value={form.vehiculo} onChange={e => setForm(f => ({ ...f, vehiculo: e.target.value }))} error={errors.vehiculo} />
              <Input label="Patente" placeholder="ABC 123" value={form.patente} onChange={e => setForm(f => ({ ...f, patente: e.target.value.toUpperCase() }))} error={errors.patente} />
            </div>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} />
              Chofer activo
            </label>
            <div className={styles.formActions}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
              <Button onClick={handleSave} loading={saving}>Guardar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
