import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useBloqueadas } from '../../hooks/useBloqueadas.js'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import styles from './CrudPage.module.css'

const EMPTY_FORM = { fecha: '', hasta: '', motivo: '', tipo: 'dia' }

function formatTs(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function BloqueadasPage() {
  const { bloqueadas, loading, createBloqueada, deleteBloqueada } = useBloqueadas()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.fecha) e.fecha = 'Requerido'
    if (!form.motivo.trim()) e.motivo = 'Requerido'
    if (form.tipo === 'rango' && !form.hasta) e.hasta = 'Requerido para rango'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await createBloqueada({
        fecha: Timestamp.fromDate(new Date(form.fecha + 'T00:00:00')),
        hasta: form.hasta ? Timestamp.fromDate(new Date(form.hasta + 'T23:59:59')) : null,
        motivo: form.motivo.trim(),
        tipo: form.tipo,
      })
      setModal(false)
      setForm(EMPTY_FORM)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este bloqueo?')) return
    await deleteBloqueada(id)
  }

  if (loading) return <div className={styles.centered}><LoadingSpinner size="lg" /></div>

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Fechas bloqueadas</h1>
        <Button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModal(true) }}>
          + Bloquear fecha
        </Button>
      </div>

      <p className={styles.hint}>
        Las fechas bloqueadas impiden que se acepten reservas en esos días.
      </p>

      {bloqueadas.length === 0 ? (
        <p className={styles.empty}>No hay fechas bloqueadas.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bloqueadas.map(b => (
                <tr key={b.id}>
                  <td>{formatTs(b.fecha)}</td>
                  <td>{b.hasta ? formatTs(b.hasta) : '—'}</td>
                  <td><span className={styles.typeBadge}>{b.tipo}</span></td>
                  <td>{b.motivo}</td>
                  <td>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Bloquear fecha" onClose={() => setModal(false)} size="sm">
          <div className={styles.form}>
            <Select
              label="Tipo de bloqueo"
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
            >
              <option value="dia">Día completo</option>
              <option value="rango">Rango de días</option>
              <option value="horario">Horario específico</option>
            </Select>
            <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} error={errors.fecha} />
            {form.tipo === 'rango' && (
              <Input label="Hasta" type="date" value={form.hasta} onChange={e => setForm(f => ({ ...f, hasta: e.target.value }))} error={errors.hasta} />
            )}
            <Input label="Motivo" placeholder="Ej: Feriado nacional" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} error={errors.motivo} />
            <div className={styles.formActions}>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} loading={saving}>Guardar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
