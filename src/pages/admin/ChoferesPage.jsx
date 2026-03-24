import { useState } from 'react'
import { useChoferes } from '../../hooks/useChoferes.js'
import { ViajesRepository, ChoferesRepository } from '../../repositories/index.js'
import { formatPrice } from '../../services/priceCalculator.js'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Input from '../../components/common/Input.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import styles from './CrudPage.module.css'

const EMPTY_FORM = { nombre: '', telefono: '', vehiculo: '', patente: '', activo: true }

export default function ChoferesPage() {
  const { choferes, loading, createChofer, updateChofer, deleteChofer, load } = useChoferes()
  const [modal, setModal] = useState(null) // null | 'new' | chofer object (edit)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Daily record modal
  const [registroChofer, setRegistroChofer] = useState(null)
  const [registroViajes, setRegistroViajes] = useState([])
  const [registroLoading, setRegistroLoading] = useState(false)
  const [registroDia, setRegistroDia] = useState(() => new Date().toISOString().split('T')[0])

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

  async function openRegistro(chofer) {
    setRegistroChofer(chofer)
    setRegistroViajes([])
    setRegistroLoading(true)
    const dia = new Date().toISOString().split('T')[0]
    setRegistroDia(dia)
    try {
      setRegistroViajes(await ViajesRepository.getByChoferAndDia(chofer.id, dia))
    } finally {
      setRegistroLoading(false)
    }
  }

  async function handleRegistroDiaChange(dia) {
    if (!registroChofer) return
    setRegistroDia(dia)
    setRegistroLoading(true)
    try {
      setRegistroViajes(await ViajesRepository.getByChoferAndDia(registroChofer.id, dia))
    } finally {
      setRegistroLoading(false)
    }
  }

  async function handleCerrarDia() {
    if (!registroChofer) return
    if (!window.confirm(`¿Cerrar el día de ${registroChofer.nombre}? El saldo acumulado se reiniciará a $0.`)) return
    setSaving(true)
    try {
      await ChoferesRepository.update(registroChofer.id, { balance: 0 })
      await load()
      setRegistroChofer(null)
      setRegistroViajes([])
    } finally {
      setSaving(false)
    }
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

  const registroTotal = registroViajes.reduce((sum, v) => sum + (v.monto ?? 0), 0)
  const today = new Date().toISOString().split('T')[0]

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
                <th>Saldo</th>
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
                  <td className={styles.price}>{formatPrice(c.balance ?? 0)}</td>
                  <td>
                    <span className={c.activo ? styles.badgeActive : styles.badgeInactive}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button size="sm" variant="secondary" onClick={() => openRegistro(c)}>Registro</Button>
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

      {/* Edit / New chofer modal */}
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

      {/* Daily record modal */}
      {registroChofer && (
        <Modal
          title={`Registro — ${registroChofer.nombre}`}
          onClose={() => { setRegistroChofer(null); setRegistroViajes([]) }}
          size="lg"
        >
          <div className={styles.form}>
            <div className={styles.registroHeader}>
              <div className={styles.registroSaldo}>
                <span className={styles.registroSaldoLabel}>Saldo acumulado</span>
                <span className={styles.registroSaldoValue}>{formatPrice(registroChofer.balance ?? 0)}</span>
              </div>
              <Input
                id="registro-dia"
                type="date"
                label="Ver día"
                max={today}
                value={registroDia}
                onChange={e => handleRegistroDiaChange(e.target.value)}
                className={styles.registroDiaPicker}
              />
            </div>

            {registroLoading ? (
              <div className={styles.centered}><LoadingSpinner /></div>
            ) : registroViajes.length === 0 ? (
              <p className={styles.empty}>No hay viajes registrados para este día.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Pasajero</th>
                      <th>Origen → Destino</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registroViajes.map(v => (
                      <tr key={v.id}>
                        <td className={styles.bold}>{v.pasajero}</td>
                        <td className={styles.routeCell}>{v.origen} → {v.destino}</td>
                        <td className={styles.price}>{formatPrice(v.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className={styles.bold}>Total del día</td>
                      <td className={styles.price}>{formatPrice(registroTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {registroDia === today && (registroChofer.balance ?? 0) > 0 && (
              <div className={styles.formActions}>
                <Button variant="danger" onClick={handleCerrarDia} loading={saving}>
                  Cerrar día y reiniciar saldo
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
