import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCompare } from '../../context/CompareContext'
import {
  LayoutGrid, GitCompare, BarChart3, LogOut, User,
  Menu, X, ShieldCheck, Signal, ChevronDown, UserCheck, Sparkles,
} from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout, isAdmin, savedSessions, switchToSession } = useAuth()
  const { selected } = useCompare()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const dropRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    navigate('/')
  }

  const handleSwitch = async (username) => {
    setAccountOpen(false)
    const ok = await switchToSession(username)
    if (ok) {
      window.location.reload()   // full reload to reset all component state
    }
  }

  const links = [
    { to: '/',          label: 'Plans',       icon: <LayoutGrid size={15} /> },
    { to: '/best-plan', label: 'Best For You', icon: <Sparkles size={15} /> },
    { to: '/compare',   label: 'Compare',     icon: <GitCompare size={15} /> },
    { to: '/reports',   label: 'Reports',     icon: <BarChart3 size={15} /> },
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <Signal size={20} strokeWidth={2.5} />
          Telecom <span className={styles.logoEm}>Comparator</span>
        </Link>

        <div className={styles.links}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`${styles.link} ${location.pathname === l.to ? styles.active : ''}`}>
              {l.icon}{l.label}
              {l.to === '/compare' && selected.length > 0 && (
                <span className={styles.badge}>{selected.length}</span>
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin"
              className={`${styles.link} ${location.pathname === '/admin' ? styles.active : ''}`}>
              <ShieldCheck size={15} />Admin
            </Link>
          )}
        </div>

        <div className={styles.auth}>
          {user ? (
            <div className={styles.accountWrap} ref={dropRef}>
              <button
                className={styles.userChip}
                onClick={() => setAccountOpen(o => !o)}
                aria-expanded={accountOpen}>
                <span className={styles.userAvatar}>{user.username[0].toUpperCase()}</span>
                <span className={styles.userName}>{user.username}</span>
                <ChevronDown size={13} className={`${styles.chevron} ${accountOpen ? styles.chevronOpen : ''}`} />
              </button>

              {accountOpen && (
                <div className={styles.dropdown}>
                  {/* Current session info */}
                  <div className={styles.dropHeader}>
                    <span className={styles.dropAvatar}>{user.username[0].toUpperCase()}</span>
                    <div>
                      <div className={styles.dropName}>{user.username}</div>
                      <div className={styles.dropRole}>
                        {user.roles?.includes('ROLE_ADMIN') ? '🛡 Administrator' : '👤 User'}
                      </div>
                    </div>
                  </div>

                  <div className={styles.dropDivider} />

                  <Link to="/profile" className={styles.dropItem} onClick={() => setAccountOpen(false)}>
                    <User size={14} /> My Profile
                  </Link>

                  {/* Switch to another saved session */}
                  {savedSessions.length > 0 && (
                    <>
                      <div className={styles.dropDivider} />
                      <div className={styles.dropSectionLabel}>
                        <UserCheck size={11} /> Switch account
                      </div>
                      {savedSessions.map(username => (
                        <button key={username} className={styles.dropItem} onClick={() => handleSwitch(username)}>
                          <span className={styles.switchAvatar}>{username[0].toUpperCase()}</span>
                          {username}
                        </button>
                      ))}
                    </>
                  )}

                  <div className={styles.dropDivider} />

                  <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>Login</Link>
              <Link to="/register" className={styles.registerBtn}>Register</Link>
            </>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobile}>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                Profile ({user.username})
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className={styles.mobileLink}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
