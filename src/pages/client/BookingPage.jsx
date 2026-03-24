import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { SolicitudesRepository } from '../../repositories/index.js'
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
  destino: '',
  fecha: '',
  hora: '',
}

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [solicitudId, setSolicitudId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
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
        fecha: Timestamp.fromDate(fechaHora),
        estado: 'pending',
        zonaId: null,
        precioEstimado: null,
        choferAsignado: null,
        choferNombre: null,
        notas: '',
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
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Confirm
              formData={formData}
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
