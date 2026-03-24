import { useState } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import AddressInput from './AddressInput.jsx'
import styles from './Steps.module.css'

function validate(data, bookingType) {
  const errors = {}
  if (!data.pasajero.trim()) errors.pasajero = 'Requerido'
  if (!data.telefono.trim()) errors.telefono = 'Requerido'
  else if (!/^\+?[\d\s\-()]{6,20}$/.test(data.telefono.trim()))
    errors.telefono = 'Teléfono inválido'
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
