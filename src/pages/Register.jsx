import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftContent}>
          <span className={styles.towerIcon}>📡</span>
          <h1 className={styles.leftTitle}>Join Telecom Comparator</h1>
          <p className={styles.leftSub}>Create your free account and start finding the perfect mobile plan today.</p>
          <div className={styles.features}>
            {['Save & compare favourite plans','Get personalised recommendations','Set budget & data preferences','Track plan changes over time'].map(f => (
              <div key={f} className={styles.feature}><span className={styles.featureDot}/>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Create Account</h1>
          <p className={styles.sub}>Fill in the details below to get started</p>
          <form className={styles.form} onSubmit={handle}>
            <div className={styles.group}>
              <label className={styles.label}>Username</label>
              <input className={styles.input} type="text" required minLength={3} placeholder="Choose a username"
                value={form.username} onChange={e=>set('username',e.target.value)} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} type="email" required placeholder="you@example.com"
                value={form.email} onChange={e=>set('email',e.target.value)} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" required minLength={6} placeholder="Minimum 6 characters"
                value={form.password} onChange={e=>set('password',e.target.value)} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Confirm Password</label>
              <input className={styles.input} type="password" required placeholder="Repeat your password"
                value={form.confirm} onChange={e=>set('confirm',e.target.value)} />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating Account…' : 'Register'}
            </button>
          </form>
          <p className={styles.footer}>
            Already have an account? <Link to="/login" className={styles.link}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
