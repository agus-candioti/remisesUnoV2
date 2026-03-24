import styles from './StepIndicator.module.css'

const STEPS = ['Datos del viaje', 'Confirmar', 'Listo']

export default function StepIndicator({ step }) {
  return (
    <div className={styles.wrapper}>
      {STEPS.map((label, i) => {
        const num = i + 1
        const active = num === step
        const done = num < step
        return (
          <div key={num} className={styles.item}>
            <div
              className={[
                styles.circle,
                active ? styles.active : '',
                done ? styles.done : '',
              ].join(' ')}
            >
              {done ? '✓' : num}
            </div>
            <span
              className={[
                styles.label,
                active ? styles.labelActive : '',
              ].join(' ')}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`${styles.line} ${done ? styles.lineDone : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
