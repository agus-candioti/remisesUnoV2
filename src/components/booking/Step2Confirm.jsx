import { useState } from 'react'
import Button from '../common/Button.jsx'
import styles from './Steps.module.css'

function formatDate(fecha, hora) {
  if (!fecha) return ''
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year} a las ${hora}`
}

export default function Step2Confirm({ formData, onBack, onConfirm, loading }) {
  return (
    <div className={styles.confirm}>
      <p className={styles.confirmHint}>
        Revisá los datos antes de confirmar tu reserva.
      </p>

      <dl className={styles.summary}>
        <div className={styles.summaryRow}>
          <dt>Pasajero</dt>
          <dd>{formData.pasajero}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Teléfono</dt>
          <dd>{formData.telefono}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Origen</dt>
          <dd>{formData.origen}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Destino</dt>
          <dd>{formData.destino}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Fecha y hora</dt>
          <dd>{formatDate(formData.fecha, formData.hora)}</dd>
        </div>
        <div className={`${styles.summaryRow} ${styles.priceRow}`}>
          <dt>Precio estimado</dt>
          <dd className={styles.priceValue}>A confirmar</dd>
        </div>
      </dl>

      <div className={styles.actions2}>
        <Button variant="secondary" size="lg" onClick={onBack} disabled={loading}>
          ← Volver
        </Button>
        <Button size="lg" onClick={onConfirm} loading={loading}>
          Confirmar reserva
        </Button>
      </div>
    </div>
  )
}
