import { useAuth } from '../context/AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'
import { User, ShieldCheck, Mail, LogOut, Info } from 'lucide-react'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Redirect if not logged in (ProtectedRoute already handles this, but guard anyway)
  if (!user) return <Navigate to="/login" replace />

  const isAdmin = user.roles?.includes('ROLE_ADMIN')

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.sub}>Manage your account settings and preferences</p>
        </div>

        <div className={styles.grid}>
          {/* Left card */}
          <div className={styles.profileCard}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}><User size={30} /></div>
              <div className={styles.username}>{user.username}</div>
              <div className={styles.roles}>
                {user.roles?.map(r => (
                  <span key={r} className={`${styles.role} ${r === 'ROLE_ADMIN' ? styles.adminRole : ''}`}>
                    {r === 'ROLE_ADMIN' && <ShieldCheck size={10} />}
                    {r.replace('ROLE_', '')}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.cardBottom}>
              <div className={styles.infoItem}><Mail size={15} /><span>{user.email}</span></div>
              <div className={styles.infoItem}><User size={15} /><span>@{user.username}</span></div>
              {isAdmin && (
                <div className={styles.infoItem}><ShieldCheck size={15} /><span>Administrator Access</span></div>
              )}
              <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>
                <LogOut size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Right details */}
          <div className={styles.detailsCard}>
            <div className={styles.detailsHeader}><Info size={15} /> Account Details</div>
            <div className={styles.detailsBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Username</span>
                <span className={styles.detailVal}>{user.username}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email Address</span>
                <span className={styles.detailVal}>{user.email}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Account Role</span>
                <span className={styles.detailVal}>
                  {user.roles?.map(r => r.replace('ROLE_', '')).join(', ')}
                </span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Account Status</span>
                <span className={styles.detailVal} style={{ color: 'var(--success)', fontWeight: 700 }}>
                  ● Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
