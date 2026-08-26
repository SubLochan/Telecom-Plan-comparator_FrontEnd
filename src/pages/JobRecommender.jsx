import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Laptop, Car, HardHat, Sparkles, Wifi, Phone,
  Zap, CheckCircle2, Quote, ArrowRight, RefreshCw, AlertTriangle,
} from 'lucide-react'
import { useOccupations, useRecommendation } from '../hooks/useRecommendation'
import { useCompare } from '../context/CompareContext'
import { formatPrice, formatData, formatCalls } from '../utils/formatters'
import styles from './JobRecommender.module.css'

const ICONS = {
  STUDENT: GraduationCap,
  WFH_PROFESSIONAL: Laptop,
  FIELD_SALES: Car,
  DAILY_WAGE_WORKER: HardHat,
}

// Fallback list shown instantly while /plans/occupations loads (or if it fails),
// so the picker never feels empty.
const FALLBACK_OCCUPATIONS = [
  { value: 'STUDENT', label: 'Student', icon: '🎓', description: 'Minimum 1GB/day, budget-friendly, student perks a bonus' },
  { value: 'WFH_PROFESSIONAL', label: 'WFH Professional', icon: '💻', description: 'Minimum 2GB/day, mobile hotspot for backup connectivity, video-call ready' },
  { value: 'FIELD_SALES', label: 'Field Sales', icon: '🚗', description: 'Minimum 1.5GB/day, unlimited/near-unlimited calling, hotspot for on-the-go work' },
  { value: 'DAILY_WAGE_WORKER', label: 'Daily Wage Worker', icon: '🛠️', description: 'Minimum 0.5GB/day, lowest possible monthly cost, no long contracts' },
]

export default function JobRecommender() {
  const { occupations: fetched, loading: occLoading } = useOccupations()
  const occupations = fetched.length ? fetched : FALLBACK_OCCUPATIONS

  const [selected, setSelected] = useState(null)
  const [maxBudget, setMaxBudget] = useState('')

  const { result, loading, error, getRecommendation } = useRecommendation()
  const { toggle, isSelected } = useCompare()

  const handlePick = (occupationValue) => {
    setSelected(occupationValue)
    getRecommendation(occupationValue, maxBudget ? Number(maxBudget) : undefined).catch(() => {})
  }

  const handleRefresh = () => {
    if (selected) getRecommendation(selected, maxBudget ? Number(maxBudget) : undefined).catch(() => {})
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.eyebrow}><Sparkles size={13} /> AI Plan Recommender</div>
          <h1 className={styles.title}>Best Plan for My Job</h1>
          <p className={styles.sub}>
            Tell us what you do — we'll match your daily data, calling and connectivity needs to the plan that actually fits.
          </p>
        </div>
      </div>

      <div className={styles.inner}>
        {/* ── Occupation picker ─────────────────────────────────── */}
        <div className={styles.pickerCard}>
          <div className={styles.pickerLabel}>What best describes your work?</div>
          <div className={styles.grid}>
            {(occLoading ? FALLBACK_OCCUPATIONS : occupations).map(o => {
              const Icon = ICONS[o.value] ?? Sparkles
              const active = selected === o.value
              return (
                <button
                  key={o.value}
                  className={`${styles.occCard} ${active ? styles.occCardActive : ''}`}
                  onClick={() => handlePick(o.value)}
                >
                  <span className={styles.occIcon}><Icon size={22} /></span>
                  <span className={styles.occLabel}>{o.label}</span>
                  <span className={styles.occDesc}>{o.description}</span>
                </button>
              )
            })}
          </div>

          <div className={styles.budgetRow}>
            <label className={styles.budgetLabel}>Max monthly budget (optional)</label>
            <div className={styles.budgetInputWrap}>
              <span className={styles.budgetPrefix}>₹</span>
              <input
                type="number"
                min="0"
                className={styles.budgetInput}
                placeholder="e.g. 500"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
                onBlur={() => selected && handlePick(selected)}
              />
            </div>
          </div>
        </div>

        {/* ── Loading ────────────────────────────────────────────── */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.spinner} />
            <span>Matching plans to your needs…</span>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────── */}
        {!loading && error && (
          <div className={styles.errorCard}>
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button className={styles.retryBtn} onClick={handleRefresh}><RefreshCw size={13}/> Retry</button>
          </div>
        )}

        {/* ── Result ─────────────────────────────────────────────── */}
        {!loading && !error && result && (
          <div className={styles.result}>
            {/* Requirement summary */}
            <div className={styles.reqBar}>
              <span className={styles.reqBadge}>{result.occupationLabel}</span>
              <span className={styles.reqText}>{result.requirementSummary}</span>
              <button className={styles.refreshBtn} onClick={handleRefresh} title="Refresh recommendation">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* AI reasoning quote */}
            <div className={styles.reasonCard}>
              <Quote size={20} className={styles.reasonQuoteIcon} />
              <p className={styles.reasonText}>{result.reason}</p>
            </div>

            {/* Recommended plan hero */}
            <div className={styles.heroCard}>
              <div className={styles.heroBadge}><Sparkles size={12} /> Best Fit</div>
              <div className={styles.heroTop}>
                <div>
                  <div className={styles.heroProvider}>{result.recommendedPlan.provider}</div>
                  <h2 className={styles.heroName}>{result.recommendedPlan.name}</h2>
                </div>
                <div className={styles.heroPriceBlock}>
                  <div className={styles.heroPrice}>{formatPrice(result.recommendedPlan.monthlyPrice)}</div>
                  <div className={styles.heroPriceLabel}>/month</div>
                </div>
              </div>

              <div className={styles.heroSpecs}>
                <div className={styles.heroSpec}><Wifi size={14}/> {formatData(result.recommendedPlan.dataLimitGB)}</div>
                <div className={styles.heroSpec}><Phone size={14}/> {formatCalls(result.recommendedPlan.callMinutes)}</div>
                {result.recommendedPlan.fiveGEnabled && <div className={styles.heroSpec}><Zap size={14}/> 5G</div>}
              </div>

              <ul className={styles.highlights}>
                {result.matchHighlights.map((h, i) => (
                  <li key={i} className={h.startsWith('⚠') ? styles.highlightWarn : styles.highlight}>
                    {h.startsWith('⚠') ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
                    <span>{h.replace('⚠ ', '')}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.heroActions}>
                <Link to={`/plans/${result.recommendedPlan.id}`} className={styles.viewBtn}>
                  View Full Details <ArrowRight size={14} />
                </Link>
                <button
                  className={`${styles.compareBtn} ${isSelected(result.recommendedPlan.id) ? styles.compareBtnActive : ''}`}
                  onClick={() => toggle(result.recommendedPlan)}
                >
                  {isSelected(result.recommendedPlan.id) ? '✓ Added to Compare' : '+ Add to Compare'}
                </button>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives?.length > 0 && (
              <div className={styles.altSection}>
                <div className={styles.altHeading}>Other close matches</div>
                <div className={styles.altGrid}>
                  {result.alternatives.map(p => (
                    <Link to={`/plans/${p.id}`} key={p.id} className={styles.altCard}>
                      <div className={styles.altTop}>
                        <div>
                          <div className={styles.altProvider}>{p.provider}</div>
                          <div className={styles.altName}>{p.name}</div>
                        </div>
                        <div className={styles.altPrice}>{formatPrice(p.monthlyPrice)}</div>
                      </div>
                      <div className={styles.altSpecs}>
                        <span>{formatData(p.dataLimitGB)}</span>
                        <span>•</span>
                        <span>{formatCalls(p.callMinutes)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────── */}
        {!loading && !error && !result && (
          <div className={styles.emptyState}>
            <Sparkles size={28} className={styles.emptyIcon} />
            <p>Pick your occupation above and we'll find your best-fit plan instantly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
