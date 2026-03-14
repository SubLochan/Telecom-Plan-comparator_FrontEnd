import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { planService } from '../services/planService'
import { authService } from '../services/authService'
import { formatPrice, planTypeLabel } from '../utils/formatters'
import { Plus, Trash2, Users, LayoutGrid, ShieldCheck, Pencil, X, Check, KeyRound, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

// The root admin (seeded on startup) is protected from role revocation
const ROOT_ADMIN_USERNAME = 'admin'

const EMPTY_FORM = {
  name: '', provider: '', planType: 'POSTPAID', monthlyPrice: '',
  dataLimitGB: '', callMinutes: '', smsCount: '',
  fiveGEnabled: false, internationalRoaming: false, hotspotEnabled: false,
  contractMonths: 0, setupFee: 0, description: '', additionalFeatures: ''
}

function planToForm(p) {
  return {
    name:                 p.name            ?? '',
    provider:             p.provider        ?? '',
    planType:             p.planType        ?? 'POSTPAID',
    monthlyPrice:         p.monthlyPrice    ?? '',
    dataLimitGB:          p.dataLimitGB     ?? '',
    callMinutes:          p.callMinutes     ?? '',
    smsCount:             p.smsCount        ?? '',
    fiveGEnabled:         p.fiveGEnabled    ?? false,
    internationalRoaming: p.internationalRoaming ?? false,
    hotspotEnabled:       p.hotspotEnabled  ?? false,
    contractMonths:       p.contractMonths  ?? 0,
    setupFee:             p.setupFee        ?? 0,
    description:          p.description     ?? '',
    additionalFeatures:   (p.additionalFeatures ?? []).join(', '),
  }
}

function buildBody(form) {
  return {
    name:                 form.name,
    provider:             form.provider,
    planType:             form.planType,
    monthlyPrice:         Number(form.monthlyPrice),
    contractMonths:       Number(form.contractMonths),
    setupFee:             Number(form.setupFee),
    dataLimitGB:          form.dataLimitGB  !== '' ? Number(form.dataLimitGB)  : null,
    callMinutes:          form.callMinutes  !== '' ? Number(form.callMinutes)  : null,
    smsCount:             form.smsCount     !== '' ? Number(form.smsCount)     : null,
    fiveGEnabled:         form.fiveGEnabled,
    internationalRoaming: form.internationalRoaming,
    hotspotEnabled:       form.hotspotEnabled,
    description:          form.description,
    additionalFeatures:   form.additionalFeatures
      ? form.additionalFeatures.split(',').map(s => s.trim()).filter(Boolean)
      : [],
  }
}

// ── Shared Plan Form ────────────────────────────────────────────────────────
function PlanForm({ title, form, setForm, onSubmit, onCancel, submitLabel }) {
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className={styles.createForm}>
      <div className={styles.formHeader}>
        <span>{title}</span>
        <button type="button" className={styles.formCloseBtn} onClick={onCancel}>
          <X size={16} />
        </button>
      </div>
      <form className={styles.formBody} onSubmit={onSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.fg}>
            <label>Plan Name *</label>
            <input required value={form.name} onChange={e => sf('name', e.target.value)} placeholder="e.g. Value 299" />
          </div>
          <div className={styles.fg}>
            <label>Provider *</label>
            <input required value={form.provider} onChange={e => sf('provider', e.target.value)} placeholder="e.g. Airtel" />
          </div>
          <div className={styles.fg}>
            <label>Plan Type</label>
            <select value={form.planType} onChange={e => sf('planType', e.target.value)}>
              {['PREPAID', 'POSTPAID', 'FAMILY', 'BUSINESS', 'STUDENT'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className={styles.fg}>
            <label>Monthly Price (₹) *</label>
            <input required type="number" min="0" step="0.01"
              value={form.monthlyPrice} onChange={e => sf('monthlyPrice', e.target.value)} placeholder="499" />
          </div>
          <div className={styles.fg}>
            <label>Data GB <span className={styles.optLabel}>(blank = unlimited)</span></label>
            <input type="number" min="0"
              value={form.dataLimitGB} onChange={e => sf('dataLimitGB', e.target.value)} placeholder="5" />
          </div>
          <div className={styles.fg}>
            <label>Call Minutes <span className={styles.optLabel}>(blank = unlimited)</span></label>
            <input type="number" min="0"
              value={form.callMinutes} onChange={e => sf('callMinutes', e.target.value)} placeholder="1000" />
          </div>
          <div className={styles.fg}>
            <label>SMS Count <span className={styles.optLabel}>(blank = unlimited)</span></label>
            <input type="number" min="0"
              value={form.smsCount} onChange={e => sf('smsCount', e.target.value)} placeholder="100" />
          </div>
          <div className={styles.fg}>
            <label>Contract Months <span className={styles.optLabel}>(0 = none)</span></label>
            <input type="number" min="0"
              value={form.contractMonths} onChange={e => sf('contractMonths', e.target.value)} />
          </div>
          <div className={styles.fg}>
            <label>Setup Fee (₹)</label>
            <input type="number" min="0" step="0.01"
              value={form.setupFee} onChange={e => sf('setupFee', e.target.value)} />
          </div>
          <div className={`${styles.fg} ${styles.fgFull}`}>
            <label>Extra Features <span className={styles.optLabel}>(comma-separated)</span></label>
            <input value={form.additionalFeatures}
              onChange={e => sf('additionalFeatures', e.target.value)}
              placeholder="HD streaming, 50GB hotspot, Travel pass" />
          </div>
          <div className={`${styles.fg} ${styles.fgFull}`}>
            <label>Description</label>
            <textarea rows={2} value={form.description}
              onChange={e => sf('description', e.target.value)}
              placeholder="Brief plan description…" />
          </div>
          <div className={styles.checkGroup}>
            <label className={styles.check}>
              <input type="checkbox" checked={form.fiveGEnabled}
                onChange={e => sf('fiveGEnabled', e.target.checked)} />
              5G Network
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={form.internationalRoaming}
                onChange={e => sf('internationalRoaming', e.target.checked)} />
              International Roaming
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={form.hotspotEnabled}
                onChange={e => sf('hotspotEnabled', e.target.checked)} />
              Mobile Hotspot
            </label>
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            <Check size={14} /> {submitLabel}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Main Admin Component ────────────────────────────────────────────────────
export default function Admin() {
  const { isAdmin, user } = useAuth()
  const navigate    = useNavigate()

  const [tab, setTab]         = useState('plans')
  const [plans, setPlans]     = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)

  // Edit form
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState(EMPTY_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [p, u] = await Promise.all([
        planService.getAll(0, 100),
        authService.getAllUsers(),
      ])
      setPlans(p?.content ?? [])
      setUsers(Array.isArray(u) ? u : [])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    loadData()
  }, [isAdmin, navigate, loadData])

  // ── Reset password state ─────────────────────────────────────────
  const [resetUserId, setResetUserId]     = useState(null)
  const [resetUsername, setResetUsername] = useState('')
  const [newPassword, setNewPassword]     = useState('')
  const [showNewPw, setShowNewPw]         = useState(false)
  const [resetting, setResetting]         = useState(false)

  const openReset = (u) => {
    setResetUserId(u.id)
    setResetUsername(u.username)
    setNewPassword('')
    setShowNewPw(false)
  }
  const closeReset = () => { setResetUserId(null); setResetUsername(''); setNewPassword('') }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('Password must be 6+ characters'); return }
    setResetting(true)
    try {
      await authService.resetPassword(resetUserId, newPassword)
      toast.success(`Password reset for ${resetUsername}`)
      closeReset()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setResetting(false)
    }
  }

  // ── Create ────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await planService.create(buildBody(createForm))
      toast.success('Plan created!')
      setShowCreate(false)
      setCreateForm(EMPTY_FORM)
      loadData()
    } catch (e) { toast.error(e.message) }
  }

  // ── Edit ──────────────────────────────────────────────────────────
  const startEdit = (plan) => {
    setEditingId(plan.id)
    setEditForm(planToForm(plan))
    setShowCreate(false)       // close create form if open
    // scroll to the row
    setTimeout(() => {
      document.getElementById(`edit-form-${plan.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const cancelEdit = () => { setEditingId(null); setEditForm(EMPTY_FORM) }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await planService.update(editingId, buildBody(editForm))
      toast.success('Plan updated!')
      cancelEdit()
      loadData()
    } catch (e) { toast.error(e.message) }
  }

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Discontinue this plan?')) return
    try {
      await planService.delete(id)
      toast.success('Plan discontinued')
      if (editingId === id) cancelEdit()
      loadData()
    } catch (e) { toast.error(e.message) }
  }

  // ── User role toggle ──────────────────────────────────────────────
  const isRootAdmin = (u) => u.username === ROOT_ADMIN_USERNAME

  const toggleAdmin = async (u) => {
    // Prevent removing admin from root account
    if (isRootAdmin(u)) {
      toast.error('Root admin cannot be demoted.')
      return
    }
    // Prevent logged-in admin from demoting themselves
    if (u.username === user?.username) {
      toast.error('You cannot remove your own admin access.')
      return
    }
    const roles = u.roles?.includes('ROLE_ADMIN')
      ? ['ROLE_USER']
      : ['ROLE_ADMIN', 'ROLE_USER']
    try {
      await authService.updateRole(u.id, roles)
      toast.success('Roles updated')
      loadData()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><ShieldCheck size={22} />Admin Panel</h1>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'plans' ? styles.tabActive : ''}`}
          onClick={() => setTab('plans')}><LayoutGrid size={14} />Plans</button>
        <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`}
          onClick={() => setTab('users')}><Users size={14} />Users</button>
      </div>

      {/* ── Plans Tab ─────────────────────────────────────────── */}
      {tab === 'plans' && (
        <div>
          <div className={styles.toolbar}>
            <span className={styles.count}>{plans.length} plans total</span>
            <button className={styles.addBtn}
              onClick={() => { setShowCreate(s => !s); cancelEdit() }}>
              <Plus size={14} />{showCreate ? 'Cancel' : 'Add New Plan'}
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <PlanForm
              title="Create New Plan"
              form={createForm}
              setForm={setCreateForm}
              onSubmit={handleCreate}
              onCancel={() => { setShowCreate(false); setCreateForm(EMPTY_FORM) }}
              submitLabel="Create Plan"
            />
          )}

          {loading ? (
            <div className={`skeleton ${styles.skel}`} />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Price/mo</th>
                    <th>5G</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <React.Fragment key={p.id}>
                      <tr key={p.id} className={editingId === p.id ? styles.rowEditing : ''}>
                        <td className={styles.tdName}>{p.name}</td>
                        <td>{p.provider}</td>
                        <td>{planTypeLabel(p.planType)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {formatPrice(p.monthlyPrice)}
                        </td>
                        <td style={{ color: p.fiveGEnabled ? 'var(--success)' : 'var(--text-3)', fontWeight: 600 }}>
                          {p.fiveGEnabled ? '✓ Yes' : '—'}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${p.status === 'ACTIVE' ? styles.active : styles.inactive}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={`${styles.editBtn} ${editingId === p.id ? styles.editBtnActive : ''}`}
                              onClick={() => editingId === p.id ? cancelEdit() : startEdit(p)}
                              title={editingId === p.id ? 'Cancel edit' : 'Edit plan'}>
                              {editingId === p.id ? <X size={14} /> : <Pencil size={14} />}
                            </button>
                            <button className={styles.deleteBtn}
                              onClick={() => handleDelete(p.id)} title="Discontinue">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline edit form row */}
                      {editingId === p.id && (
                        <tr key={`edit-${p.id}`} id={`edit-form-${p.id}`}>
                          <td colSpan={7} className={styles.editRow}>
                            <PlanForm
                              title={`Editing: ${p.name}`}
                              form={editForm}
                              setForm={setEditForm}
                              onSubmit={handleUpdate}
                              onCancel={cancelEdit}
                              submitLabel="Save Changes"
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────────────── */}
      {tab === 'users' && (
        <div>
          <div className={styles.toolbar}>
            <span className={styles.count}>{users.length} registered users</span>
          </div>
          {loading ? (
            <div className={`skeleton ${styles.skel}`} />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Username</th><th>Email</th><th>Roles</th><th>Status</th><th>Admin Access</th><th>Password</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const root    = isRootAdmin(u)
                    const isMe    = u.username === user?.username
                    const locked  = root || isMe
                    return (
                      <React.Fragment key={u.id}>
                      <tr className={root ? styles.rootRow : ''}>
                        <td className={styles.tdName}>
                          {u.username}
                          {root && (
                            <span className={styles.rootBadge} title="Root admin — protected">
                              🛡 Root
                            </span>
                          )}
                          {isMe && !root && (
                            <span className={styles.meBadge}>You</span>
                          )}
                        </td>
                        <td>{u.email}</td>
                        <td>{u.roles?.map(r => r.replace('ROLE_', '')).join(', ')}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${u.enabled ? styles.active : styles.inactive}`}>
                            {u.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          {locked ? (
                            <span className={styles.lockedBadge} title={root ? 'Root admin is protected' : 'Cannot remove your own access'}>
                              🔒 {root ? 'Protected' : 'You'}
                            </span>
                          ) : (
                            <button
                              className={`${styles.roleBtn} ${u.roles?.includes('ROLE_ADMIN') ? styles.roleBtnActive : ''}`}
                              onClick={() => toggleAdmin(u)}>
                              {u.roles?.includes('ROLE_ADMIN') ? 'Remove Admin' : 'Make Admin'}
                            </button>
                          )}
                        </td>
                        <td>
                          <button
                            className={styles.resetPwBtn}
                            onClick={() => resetUserId === u.id ? closeReset() : openReset(u)}
                            title="Reset password">
                            <KeyRound size={13} />
                            {resetUserId === u.id ? 'Cancel' : 'Reset Password'}
                          </button>
                        </td>
                      </tr>

                      {/* Inline reset password form */}
                      {resetUserId === u.id && (
                        <tr key={`reset-${u.id}`}>
                          <td colSpan={6} className={styles.resetRow}>
                            <form className={styles.resetForm} onSubmit={handleReset}>
                              <KeyRound size={14} className={styles.resetIcon} />
                              <span className={styles.resetLabel}>
                                New password for <strong>{resetUsername}</strong>
                              </span>
                              <div className={styles.resetInputWrap}>
                                <input
                                  className={styles.resetInput}
                                  type={showNewPw ? 'text' : 'password'}
                                  placeholder="Min 6 characters"
                                  value={newPassword}
                                  onChange={e => setNewPassword(e.target.value)}
                                  required
                                  minLength={6}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  className={styles.resetEye}
                                  onClick={() => setShowNewPw(s => !s)}>
                                  {showNewPw ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                              <button
                                type="submit"
                                className={styles.resetSubmit}
                                disabled={resetting || newPassword.length < 6}>
                                {resetting ? 'Saving…' : 'Set Password'}
                              </button>
                              <button type="button" className={styles.resetCancel} onClick={closeReset}>
                                <X size={13} />
                              </button>
                            </form>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
