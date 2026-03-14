import { useState, useEffect } from 'react'
import { useCompare } from '../context/CompareContext'
import { planService } from '../services/planService'
import { formatPrice, formatData, planTypeLabel } from '../utils/formatters'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X as XIcon, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './ComparePage.module.css'

const ROWS = [
  { label: 'Provider',  key: p => p.provider },
  { label: 'Type',      key: p => planTypeLabel(p.planType) },
  { label: 'Price/mo',  key: p => formatPrice(p.monthlyPrice),  highlight: 'min', rawKey: 'monthlyPrice' },
  { label: 'Data',      key: p => formatData(p.dataLimitGB),    highlight: 'max', rawKey: 'dataLimitGB' },
  { label: 'Calls',     key: p => p.callMinutes == null ? 'Unlimited' : `${p.callMinutes} min` },
  { label: 'SMS',       key: p => p.smsCount    == null ? 'Unlimited' : `${p.smsCount}` },
  { label: '5G',        key: p => p.fiveGEnabled,         bool: true },
  { label: 'Roaming',   key: p => p.internationalRoaming, bool: true },
  { label: 'Hotspot',   key: p => p.hotspotEnabled,       bool: true },
  { label: 'Contract',  key: p => p.contractMonths === 0 ? 'None' : `${p.contractMonths} mo` },
  { label: 'Setup Fee', key: p => formatPrice(p.setupFee ?? 0) },
  { label: 'Rating',    key: p => p.averageRating?.toFixed(1) ?? 'N/A', highlight: 'max', rawKey: 'averageRating' },
]

// Rows that are already shown in Provider / Type columns — skip in detail table
const SKIP_LABELS = ['Provider', 'Type']

export default function ComparePage() {
  const { selected, clear } = useCompare()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selected.length < 2) { setResult(null); return }
    setLoading(true)
    planService.compare(selected.map(p => p.id))
      .then(setResult)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [selected])

  if (selected.length === 0) return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚖️</div>
        <h2>Nothing to compare</h2>
        <p>Browse plans and select up to 5 to compare side by side.</p>
        <Link to="/" className={styles.emptyBtn}>Browse Plans →</Link>
      </div>
    </div>
  )

  if (selected.length === 1) return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>➕</div>
        <h2>Add one more plan</h2>
        <p>Select at least 2 plans to see a comparison.</p>
        <Link to="/" className={styles.emptyBtn}>Add Plans →</Link>
      </div>
    </div>
  )

  const plans   = result?.plans   ?? selected
  const summary = result?.summary ?? null

  const getBestIdx = (row) => {
    if (!row.rawKey || !row.highlight) return -1
    const vals = plans.map(p => parseFloat(p[row.rawKey]) || 0)
    const best  = row.highlight === 'max' ? Math.max(...vals) : Math.min(...vals)
    return plans.findIndex(p => parseFloat(p[row.rawKey]) === best)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.back}><ArrowLeft size={15} />Back</Link>
        <h1 className={styles.title}>Plan Comparison</h1>
        <button className={styles.clearBtn} onClick={clear}>Clear All</button>
      </div>

      {summary && (
        <div className={styles.summaryRow}>
          {summary.cheapest  && <SummaryBadge icon="💰" label="Best Value"   plan={summary.cheapest}  rank={1} color="var(--badge-1)" />}
          {summary.mostData  && <SummaryBadge icon="📶" label="Most Data"    plan={summary.mostData}  rank={2} color="var(--badge-2)" />}
          {summary.bestRated && <SummaryBadge icon="⭐" label="Best Rated"   plan={summary.bestRated} rank={3} color="var(--badge-3)" />}
          {summary.bestValue && <SummaryBadge icon="🏆" label="Recommended"  plan={summary.bestValue} rank={null} color="var(--primary)" />}
        </div>
      )}

      {loading ? (
        <div className={`skeleton ${styles.skeleton}`} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thLabel}>Rank</th>
                <th className={styles.thLabel}>Provider</th>
                <th className={styles.thLabel}>Plan Name</th>
                {ROWS.filter(r => !SKIP_LABELS.includes(r.label)).map(r => (
                  <th key={r.label} className={styles.thLabel}>{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((p, pi) => (
                <tr key={p.id} className={pi === 0 ? styles.rowFirst : ''}>
                  <td className={styles.td}>
                    {pi < 3
                      ? <span className={styles.rankBadge} style={{ background: ['var(--badge-1)', 'var(--badge-2)', 'var(--badge-3)'][pi] }}>{pi + 1}</span>
                      : <span className={styles.rankNum}>{pi + 1}</span>
                    }
                  </td>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{p.provider}</td>
                  <td className={styles.tdName}>{p.name}</td>
                  {ROWS.filter(r => !SKIP_LABELS.includes(r.label)).map(row => {
                    const val     = row.key(p)
                    const bestIdx = getBestIdx(row)
                    const isBest  = bestIdx === pi
                    if (row.bool) return (
                      <td key={row.label} className={`${styles.td} ${val ? styles.tdBoolYes : styles.tdBoolNo}`}>
                        {val ? <Check size={15} /> : <XIcon size={15} />}
                      </td>
                    )
                    return (
                      <td key={row.label} className={`${styles.td} ${isBest ? styles.tdBest : ''}`}>
                        {isBest && <Trophy size={11} className={styles.trophy} />}
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SummaryBadge({ icon, label, plan, rank, color }) {
  return (
    <div className={styles.summaryBadge}>
      {rank != null && (
        <span className={styles.rankCircle} style={{ background: color }}>{rank}</span>
      )}
      <span className={styles.summaryIcon}>{icon}</span>
      <div>
        <div className={styles.summaryLabel} style={{ color }}>{label}</div>
        <div className={styles.summaryPlan}>{plan?.provider} — {plan?.name}</div>
      </div>
    </div>
  )
}
