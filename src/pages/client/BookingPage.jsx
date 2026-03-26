import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { SolicitudesRepository } from '../../repositories/index.js'
import { useZonas } from '../../hooks/useZonas.js'
import { calculateTripPrice } from '../../services/priceCalculator.js'
import StepIndicator from '../../components/booking/StepIndicator.jsx'
import Step1TripDetails from '../../components/booking/Step1TripDetails.jsx'
import Step2Confirm from '../../components/booking/Step2Confirm.jsx'
import Step3Success from '../../components/booking/Step3Success.jsx'
import ThemeToggle from '../../components/common/ThemeToggle.jsx'
import styles from './BookingPage.module.css'

const INITIAL_FORM = {
  pasajero: '',
  telefono: '',
  origen: '',
  origenLat: null,
  origenLng: null,
  destino: '',
  destinoLat: null,
  destinoLng: null,
  fecha: '',
  hora: '',
  tipo: null,
  notas: '',
}

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [estimatedPrice, setEstimatedPrice] = useState(null)
  const [solicitudId, setSolicitudId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { zonas } = useZonas()

  function handleChange(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function handleSelectOrigen(suggestion) {
    setFormData(prev => ({
      ...prev,
      origenLat: suggestion?.lat ?? null,
      origenLng: suggestion?.lng ?? null,
    }))
  }

  function handleSelectDestino(suggestion) {
    setFormData(prev => ({
      ...prev,
      destinoLat: suggestion?.lat ?? null,
      destinoLng: suggestion?.lng ?? null,
    }))
  }

  function handleNext() {
    const price = calculateTripPrice(formData.destinoLat, formData.destinoLng, zonas, formData.origenLat, formData.origenLng)
    setEstimatedPrice(price)
    setStep(2)
  }

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`)
      const id = await SolicitudesRepository.create({
        pasajero: formData.pasajero.trim(),
        telefono: formData.telefono.trim(),
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        coordOrigen: formData.origenLat != null
          ? { lat: formData.origenLat, lng: formData.origenLng }
          : null,
        coordDestino: formData.destinoLat != null
          ? { lat: formData.destinoLat, lng: formData.destinoLng }
          : null,
        fecha: Timestamp.fromDate(fechaHora),
        tipo: formData.tipo,
        estado: 'pending',
        zonaId: null,
        precioEstimado: estimatedPrice,
        choferAsignado: null,
        choferNombre: null,
        notas: formData.notas.trim(),
      })
      setSolicitudId(id)
      setStep(3)
    } catch (e) {
      setError('Hubo un error al enviar tu reserva. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setStep(1)
    setFormData(INITIAL_FORM)
    setSolicitudId(null)
    setEstimatedPrice(null)
    setError(null)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>U</span>
          <span className={styles.logoText}>UNO Remises</span>
        </div>
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          {step < 3 && (
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>
                {step === 1 ? 'Reservá tu viaje' : 'Confirmá tu reserva'}
              </h1>
              <p className={styles.subtitle}>
                {step === 1
                  ? 'Completá los datos para solicitar un remis.'
                  : 'Revisá los datos de tu viaje antes de confirmar.'}
              </p>
            </div>
          )}

          <StepIndicator step={step} />

          {error && (
            <div className={styles.errorBanner}>{error}</div>
          )}

          {step === 1 && (
            <Step1TripDetails
              formData={formData}
              onChange={handleChange}
              onSelectOrigen={handleSelectOrigen}
              onSelectDestino={handleSelectDestino}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <Step2Confirm
              formData={formData}
              estimatedPrice={estimatedPrice}
              onBack={() => setStep(1)}
              onConfirm={handleConfirm}
              loading={loading}
            />
          )}
          {step === 3 && (
            <Step3Success
              formData={formData}
              solicitudId={solicitudId}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="/admin/login" className={styles.adminLink}>
          Acceso administrador
        </a>
      </footer>
    </div>
  )
}
