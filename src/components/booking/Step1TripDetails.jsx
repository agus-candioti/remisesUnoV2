import { useState } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import AddressInput from './AddressInput.jsx'
import styles from './Steps.module.css'

// Strip country code, leading 0, and mobile indicator to get bare 10-digit AR number
function normalizePhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('54')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('9')) d = d.slice(1)
  if (d.startsWith('0')) d = d.slice(1)
  return d
}

function validate(data, bookingType) {
  const errors = {}
  if (!data.pasajero.trim()) errors.pasajero = 'Requerido'
  if (!data.telefono.trim()) {
    errors.telefono = 'Requerido'
  } else {
    const normalized = normalizePhone(data.telefono)
    if (normalized.length !== 10) {
      errors.telefono = 'Ingresá área + número sin el 0 ni el 15 (ej: 1125941741)'
    }
  }
  if (!data.origen.trim()) errors.origen = 'Requerido'
  if (!data.destino.trim()) errors.destino = 'Requerido'
  if (!bookingType) errors.bookingType = 'Elegí una opción'
  if (bookingType === 'reserva') {
    if (!data.fecha) errors.fecha = 'Requerido'
    if (!data.hora) errors.hora = 'Requerido'
  }
  return errors
}

export default function Step1TripDetails({ formData, onChange, onSelectOrigen, onSelectDestino, onNext }) {
  const [errors, setErrors] = useState({})
  const [bookingType, setBookingType] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(formData, bookingType)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    // Store normalized phone so WhatsApp links work out of the box
    onChange('telefono', normalizePhone(formData.telefono))
    if (bookingType === 'ahora') {
      const now = new Date()
      onChange('fecha', now.toISOString().split('T')[0])
      onChange('hora', now.toTimeString().slice(0, 5))
    }
    onChange('tipo', bookingType)
    onNext()
  }

  function field(key) {
    return {
      value: formData[key],
      onChange: e => onChange(key, e.target.value),
      error: errors[key],
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid2}>
        <Input
          id="pasajero"
          label="Nombre del pasajero"
          placeholder="Juan García"
          {...field('pasajero')}
        />
        <Input
          id="telefono"
          label="Teléfono de contacto"
          placeholder="+54 9 11 1234-5678"
          type="tel"
          {...field('telefono')}
        />
      </div>

      <AddressInput
        id="origen"
        label="Dirección de origen"
        placeholder="¿Desde dónde salís?"
        value={formData.origen}
        onChange={val => onChange('origen', val)}
        onSelect={onSelectOrigen}
        error={errors.origen}
      />

      <AddressInput
        id="destino"
        label="Dirección de destino"
        placeholder="¿A dónde vas?"
        value={formData.destino}
        onChange={val => onChange('destino', val)}
        onSelect={onSelectDestino}
        error={errors.destino}
      />

      <Input
        as="textarea"
        id="notas"
        label="Observaciones (opcional)"
        placeholder="Ej: viajo con mascota, necesito lugar en el baúl, silla de bebé, voy con mucho equipaje…"
        rows={3}
        value={formData.notas}
        onChange={e => onChange('notas', e.target.value)}
      />

      {/* Booking type */}
      <div>
        <div className={styles.bookingTypeGroup}>
          <button
            type="button"
            className={`${styles.bookingTypeBtn} ${bookingType === 'ahora' ? styles.bookingTypeBtnActive : ''}`}
            onClick={() => setBookingType('ahora')}
          >
            <span className={styles.bookingTypeBtnIcon}>⚡</span>
            <span className={styles.bookingTypeBtnTitle}>Pedir Ahora</span>
            <span className={styles.bookingTypeBtnDesc}>Te enviamos un remis en minutos</span>
          </button>
          <button
            type="button"
            className={`${styles.bookingTypeBtn} ${bookingType === 'reserva' ? styles.bookingTypeBtnActive : ''}`}
            onClick={() => setBookingType('reserva')}
          >
            <span className={styles.bookingTypeBtnIcon}>📅</span>
            <span className={styles.bookingTypeBtnTitle}>Hacer una Reserva</span>
            <span className={styles.bookingTypeBtnDesc}>Elegí fecha y hora específicas</span>
          </button>
        </div>
        {errors.bookingType && (
          <p className={styles.bookingTypeError}>{errors.bookingType}</p>
        )}
      </div>

      {/* Date/time — only shown for scheduled bookings */}
      {bookingType === 'reserva' && (
        <div className={styles.grid2}>
          <Input
            id="fecha"
            label="Fecha"
            type="date"
            min={today}
            {...field('fecha')}
          />
          <Input
            id="hora"
            label="Hora"
            type="time"
            {...field('hora')}
          />
        </div>
      )}

      <div className={styles.actions}>
        <Button type="submit" size="lg" fullWidth>
          Continuar →
        </Button>
      </div>
    </form>
  )
}
