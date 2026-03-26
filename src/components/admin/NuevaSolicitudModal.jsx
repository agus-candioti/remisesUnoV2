import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import AddressInput from '../booking/AddressInput.jsx'
import { calculateTripPrice, findZoneForCoords } from '../../services/priceCalculator.js'
import styles from './NuevaSolicitudModal.module.css'

function normalizePhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('54')) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  if (d.startsWith('15')) d = d.slice(2)
  return d
}

const EMPTY = {
  pasajero: '',
  telefono: '',
  tipo: 'ahora',
  fecha: '',
  hora: '',
  origen: '',
  origenLat: null,
  origenLng: null,
  destino: '',
  destinoLat: null,
  destinoLng: null,
  precioManual: '',
  notas: '',
}

export default function NuevaSolicitudModal({ zonas, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [zonaDetectada, setZonaDetectada] = useState(null)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function handleOrigenSelect(suggestion) {
    if (!suggestion) {
      set('origenLat', null)
      set('origenLng', null)
      return
    }
    setForm(prev => ({
      ...prev,
      origen: suggestion.value,
      origenLat: suggestion.lat,
      origenLng: suggestion.lng,
    }))
    if (errors.origen) setErrors(prev => ({ ...prev, origen: null }))
  }

  function handleDestinoSelect(suggestion) {
    if (!suggestion) {
      setForm(prev => ({ ...prev, destinoLat: null, destinoLng: null }))
      setZonaDetectada(null)
      return
    }
    const { lat, lng } = suggestion
    const zonaMatch = findZoneForCoords(lat, lng, zonas ?? [])
    const precio = zonaMatch?.precio ?? null

    setForm(prev => ({
      ...prev,
      destino: suggestion.value,
      destinoLat: lat,
      destinoLng: lng,
      precioManual: precio != null ? String(precio) : '',
    }))
    setZonaDetectada(zonaMatch?.nombre ?? null)
    if (errors.destino) setErrors(prev => ({ ...prev, destino: null }))
  }

  function validate() {
    const errs = {}
    if (!form.pasajero.trim()) errs.pasajero = 'El nombre es obligatorio'
    const phone = normalizePhone(form.telefono)
    if (phone.length !== 10) errs.telefono = 'Ingresá un teléfono de 10 dígitos (sin 0 ni 15)'
    if (!form.origen.trim()) errs.origen = 'El origen es obligatorio'
    if (!form.destino.trim()) errs.destino = 'El destino es obligatorio'
    if (form.tipo === 'reserva') {
      if (!form.fecha) errs.fecha = 'La fecha es obligatoria'
      if (!form.hora) errs.hora = 'La hora es obligatoria'
    }
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const phone = normalizePhone(form.telefono)
      const fechaTs = form.tipo === 'ahora'
        ? Timestamp.now()
        : Timestamp.fromDate(new Date(`${form.fecha}T${form.hora}`))
      const precio = form.precioManual !== '' ? Number(form.precioManual) : null

      await onCreate({
        pasajero: form.pasajero.trim(),
        telefono: phone,
        tipo: form.tipo,
        fecha: fechaTs,
        origen: form.origen,
        origenLat: form.origenLat,
        origenLng: form.origenLng,
        destino: form.destino,
        destinoLat: form.destinoLat,
        destinoLng: form.destinoLng,
        precioEstimado: precio,
        notas: form.notas.trim(),
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Nueva solicitud" onClose={onClose} size="md">
      <div className={styles.form}>

        {/* Pasajero + Telefono */}
        <div className={styles.grid2}>
          <Input
            id="nsr-pasajero"
            label="Nombre del pasajero"
            placeholder="Ej: Juan García"
            value={form.pasajero}
            onChange={e => set('pasajero', e.target.value)}
            error={errors.pasajero}
          />
          <Input
            id="nsr-telefono"
            label="Teléfono"
            placeholder="11 2345 6789"
            value={form.telefono}
            onChange={e => set('telefono', e.target.value)}
            error={errors.telefono}
            hint="Sin 0, sin 15, sin +54"
          />
        </div>

        {/* Tipo selector */}
        <div>
          <p className={styles.tipoLabel}>Tipo de solicitud</p>
          <div className={styles.tipoGroup}>
            <button
              type="button"
              className={`${styles.tipoBtn} ${form.tipo === 'ahora' ? styles.tipoBtnActive : ''}`}
              onClick={() => set('tipo', 'ahora')}
            >
              Ahora mismo
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${form.tipo === 'reserva' ? styles.tipoBtnActive : ''}`}
              onClick={() => set('tipo', 'reserva')}
            >
              Reserva
            </button>
          </div>
        </div>

        {/* Date + Time (only for reserva) */}
        {form.tipo === 'reserva' && (
          <div className={styles.grid2}>
            <Input
              id="nsr-fecha"
              label="Fecha"
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              error={errors.fecha}
            />
            <Input
              id="nsr-hora"
              label="Hora"
              type="time"
              value={form.hora}
              onChange={e => set('hora', e.target.value)}
              error={errors.hora}
            />
          </div>
        )}

        {/* Origen */}
        <AddressInput
          id="nsr-origen"
          label="Origen"
          placeholder="Ej: Castelli 1537, Campana"
          value={form.origen}
          onChange={val => set('origen', val)}
          onSelect={handleOrigenSelect}
          error={errors.origen}
        />

        {/* Destino */}
        <AddressInput
          id="nsr-destino"
          label="Destino"
          placeholder="Ej: Arenaza 2175, Campana"
          value={form.destino}
          onChange={val => set('destino', val)}
          onSelect={handleDestinoSelect}
          error={errors.destino}
        />

        {/* Precio */}
        <div>
          <Input
            id="nsr-precio"
            label="Precio estimado (ARS)"
            type="number"
            placeholder="0"
            value={form.precioManual}
            onChange={e => set('precioManual', e.target.value)}
          />
          {zonaDetectada ? (
            <p className={styles.priceHint}>Calculado automaticamente — zona: {zonaDetectada}</p>
          ) : form.destinoLat != null ? (
            <p className={styles.priceHint}>Sin zona asignada — ingresa un precio manualmente si corresponde</p>
          ) : null}
        </div>

        {/* Notas */}
        <Input
          id="nsr-notas"
          label="Observaciones (opcional)"
          as="textarea"
          placeholder="Detalles adicionales del viaje..."
          value={form.notas}
          onChange={e => set('notas', e.target.value)}
        />

        <div className={styles.formActions}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Crear solicitud
          </Button>
        </div>
      </div>
    </Modal>
  )
}
