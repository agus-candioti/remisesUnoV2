import { useState } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import AddressInput from './AddressInput.jsx'
import styles from './Steps.module.css'

function validate(data) {
  const errors = {}
  if (!data.pasajero.trim()) errors.pasajero = 'Requerido'
  if (!data.telefono.trim()) errors.telefono = 'Requerido'
  else if (!/^\+?[\d\s\-()]{6,20}$/.test(data.telefono.trim()))
    errors.telefono = 'Teléfono inválido'
  if (!data.origen.trim()) errors.origen = 'Requerido'
  if (!data.destino.trim()) errors.destino = 'Requerido'
  if (!data.fecha) errors.fecha = 'Requerido'
  if (!data.hora) errors.hora = 'Requerido'
  return errors
}

export default function Step1TripDetails({ formData, onChange, onSelectOrigen, onSelectDestino, onNext }) {
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(formData)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onNext()
  }

  function field(key) {
    return {
      value: formData[key],
      onChange: e => onChange(key, e.target.value),
      error: errors[key],
    }
  }

  // Min date = today
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

      <div className={styles.actions}>
        <Button type="submit" size="lg" fullWidth>
          Continuar →
        </Button>
      </div>
    </form>
  )
}
