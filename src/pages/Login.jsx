import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, UserCheck, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const { login, switchToSession, savedSessions } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [switching, setSwitching] = useState(null)   // username being switched to
  const [showPass, setShowPass] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitch = async (username) => {
    setSwitching(username)
    try {
      const ok = await switchToSession(username)
      if (ok) {
        toast.success(`Switched to ${username}`)
        navigate('/')
      } else {
        toast.error('Session expired — please log in again')
      }
    } finally {
      setSwitching(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftContent}>
          <span className={styles.towerIcon}>📡</span>
          <h1 className={styles.leftTitle}>Telecom Plan <em>Comparator</em></h1>
          <p className={styles.leftSub}>Find the best mobile plan for your needs</p>
          <div className={styles.features}>
            {[
              'Compare plans from top providers',
              'Filter by budget & data needs',
              'Read & write user reviews',
              'Visual analytics & reports',
            ].map(f => (
              <div key={f} className={styles.feature}>
                <span className={styles.featureDot} />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Welcome Back</h1>
          <p className={styles.sub}>Sign in to your account to continue</p>

          {/* ── Saved sessions switcher ── */}
          {savedSessions.length > 0 && (
            <div className={styles.sessionsBox}>
              <div className={styles.sessionsLabel}>
                <UserCheck size={13} /> Continue as…
              </div>
              {savedSessions.map(username => (
                <button
                  key={username}
                  className={styles.sessionBtn}
                  onClick={() => handleSwitch(username)}
                  disabled={switching === username}
                >
                  <span className={styles.sessionAvatar}>
                    {username[0].toUpperCase()}
                  </span>
                  <span className={styles.sessionName}>{username}</span>
                  {switching === username
                    ? <span className={styles.sessionSpinner} />
                    : <ChevronRight size={14} className={styles.sessionArrow} />
                  }
                </button>
              ))}
              <div className={styles.sessionsDivider}>
                <span>or sign in with a different account</span>
              </div>
            </div>
          )}

          {/* ── Login form ── */}
          <form className={styles.form} onSubmit={handle}>
            <div className={styles.group}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                required
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Password</label>
              <div className={styles.passWrap}>
                <input
                  className={styles.input}
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className={styles.hint}>
              Demo: <code>admin / admin123</code> or <code>john / john123</code>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
