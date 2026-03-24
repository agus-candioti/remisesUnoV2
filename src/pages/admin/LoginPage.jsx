import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import ThemeToggle from '../../components/common/ThemeToggle.jsx'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRight}>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>U</span>
        </div>
        <h1 className={styles.title}>Panel de administración</h1>
        <p className={styles.subtitle}>Ingresá con tu cuenta de administrador</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="admin@unoremises.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Ingresar
          </Button>
        </form>

        <a href="/" className={styles.backLink}>← Volver al inicio</a>
      </div>
    </div>
  )
}
