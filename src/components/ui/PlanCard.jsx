import { Wifi, Phone, MessageSquare, Globe, Zap, Flame } from 'lucide-react'
import { useCompare } from '../../context/CompareContext'
import { Link } from 'react-router-dom'
import { formatPrice, formatData, formatCalls, planTypeLabel, planTypeColor } from '../../utils/formatters'
import styles from './PlanCard.module.css'

export default function PlanCard({ plan, delay = 0 }) {
  const { toggle, isSelected } = useCompare()
  const selected = isSelected(plan.id)
  const typeColor = planTypeColor(plan.planType)

  return (
    <div className={`${styles.card} ${selected ? styles.selected : ''}`}
      style={{ animationDelay: `${delay}ms` }}>

      <div className={styles.header}>
        <div>
          <span className={styles.typeBadge}
            style={{ color: typeColor, background: `${typeColor}18`, border: `1px solid ${typeColor}33` }}>
            {planTypeLabel(plan.planType)}
          </span>
          <div className={styles.provider}>{plan.provider}</div>
          <h3 className={styles.name}>{plan.name}</h3>
        </div>
        <div className={styles.priceBlock}>
          <div className={styles.price}>{formatPrice(plan.monthlyPrice)}</div>
          <div className={styles.priceLabel}>/month</div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.specs}>
        <div className={styles.spec}>
          <span className={styles.specLabel}><Wifi size={13}/>Data</span>
          <span className={styles.specVal}>{formatData(plan.dataLimitGB)}</span>
        </div>
        <div className={styles.spec}>
          <span className={styles.specLabel}><Phone size={13}/>Calls</span>
          <span className={styles.specVal}>{formatCalls(plan.callMinutes)}</span>
        </div>
        <div className={styles.spec}>
          <span className={styles.specLabel}><MessageSquare size={13}/>SMS</span>
          <span className={styles.specVal}>{plan.smsCount == null ? 'Unlimited' : plan.smsCount}</span>
        </div>
      </div>

      <div className={styles.features}>
        {plan.fiveGEnabled         && <span className={styles.pill}><Zap size={10}/>5G</span>}
        {plan.internationalRoaming && <span className={`${styles.pill} ${styles.pillAmber}`}><Globe size={10}/>Roaming</span>}
        {plan.hotspotEnabled       && <span className={`${styles.pill} ${styles.pillGreen}`}><Flame size={10}/>Hotspot</span>}
        {plan.contractMonths === 0 && <span className={`${styles.pill} ${styles.pillGreen}`}>No Contract</span>}
      </div>

      <div className={styles.rating}>
        <span className={styles.stars}>{'★'.repeat(Math.round(plan.averageRating??0))}{'☆'.repeat(5-Math.round(plan.averageRating??0))}</span>
        <span className={styles.ratingVal}>{plan.averageRating?.toFixed(1)??'N/A'}</span>
        <span className={styles.reviewCount}>({plan.reviewCount??0})</span>
      </div>

      <div className={styles.actions}>
        <Link to={`/plans/${plan.id}`} className={styles.detailBtn}>View Details</Link>
        <button className={`${styles.compareBtn} ${selected?styles.compareBtnActive:''}`} onClick={()=>toggle(plan)}>
          {selected ? '✓ Selected' : '+ Compare'}
        </button>
      </div>
    </div>
  )
}
