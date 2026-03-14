import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlan } from '../hooks/usePlans'
import { useReviews } from '../hooks/useReviews'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'
import ReviewForm, { StarRating } from '../components/ui/ReviewForm'
import { formatPrice, formatData, formatCalls, planTypeLabel, planTypeColor } from '../utils/formatters'
import { Wifi, Phone, MessageSquare, Globe, Zap, Flame, ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './PlanDetail.module.css'

export default function PlanDetail() {
  const { id }   = useParams()
  const { plan, loading, error } = usePlan(id)
  const { reviews, addReview, deleteReview } = useReviews(id)
  const { user, isAdmin }     = useAuth()
  const { toggle, isSelected } = useCompare()
  const [submitting, setSubmitting] = useState(false)

  const handleReview = async (rating, comment) => {
    setSubmitting(true)
    try {
      await addReview(rating, comment)
      toast.success('Review submitted!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      toast.success('Review deleted')
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (loading) return (
    <div className={styles.page}>
      <div className="container">
        <div className={`skeleton ${styles.skeletonHero}`} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div className={`skeleton ${styles.skeletonBlock}`} />
          <div className={`skeleton ${styles.skeletonBlock}`} />
        </div>
      </div>
    </div>
  )

  if (error || !plan) return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.notFound}>
          Plan not found. <Link to="/">← Back to plans</Link>
        </div>
      </div>
    </div>
  )

  const typeColor = planTypeColor(plan.planType)
  const selected  = isSelected(plan.id)

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.back}><ArrowLeft size={15} />All Plans</Link>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroInfo}>
            <span className={styles.typeBadge}
              style={{ color: typeColor, background: `${typeColor}15`, border: `1px solid ${typeColor}35` }}>
              {planTypeLabel(plan.planType)}
            </span>
            <div className={styles.provider}>{plan.provider}</div>
            <h1 className={styles.name}>{plan.name}</h1>
            {plan.description && <p className={styles.desc}>{plan.description}</p>}
            <div className={styles.rating}>
              <StarRating value={Math.round(plan.averageRating ?? 0)} readonly />
              <span className={styles.ratingVal}>{plan.averageRating?.toFixed(1) ?? 'N/A'}</span>
              <span className={styles.reviewCount}>({plan.reviewCount ?? 0} reviews)</span>
            </div>
          </div>

          <div className={styles.heroPrice}>
            <div className={styles.priceCard}>
              <div className={styles.price}>{formatPrice(plan.monthlyPrice)}</div>
              <div className={styles.priceLabel}>per month</div>
              {plan.setupFee > 0 && (
                <div className={styles.setupFee}>+ {formatPrice(plan.setupFee)} setup fee</div>
              )}
              {plan.contractMonths > 0
                ? <div className={styles.contract}>{plan.contractMonths}-month contract</div>
                : <div className={styles.noContract}>✓ No Contract</div>
              }
              <button
                className={`${styles.compareBtn} ${selected ? styles.compareBtnActive : ''}`}
                onClick={() => toggle(plan)}>
                {selected ? '✓ Added to Compare' : '+ Add to Compare'}
              </button>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className={styles.detailBox}>
          <div className={styles.detailBoxHeader}>
            <span className={styles.detailBoxBrand}>{plan.provider[0]}</span>
            <h2 className={styles.detailBoxTitle}>Plan Details</h2>
          </div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <Wifi size={14} style={{ color: 'var(--primary)', marginRight: 6 }} />
              <span className={styles.detailKey}>Data:</span>
              <span className={styles.detailVal} style={{ color: 'var(--primary)' }}>
                {formatData(plan.dataLimitGB)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <Phone size={14} style={{ color: 'var(--primary)', marginRight: 6 }} />
              <span className={styles.detailKey}>Calls:</span>
              <span className={styles.detailVal} style={{ color: 'var(--primary)' }}>
                {formatCalls(plan.callMinutes)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <MessageSquare size={14} style={{ color: 'var(--primary)', marginRight: 6 }} />
              <span className={styles.detailKey}>SMS:</span>
              <span className={styles.detailVal} style={{ color: 'var(--primary)' }}>
                {plan.smsCount ?? 'Unlimited'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <Zap size={14} style={{ color: plan.fiveGEnabled ? 'var(--success)' : 'var(--text-3)', marginRight: 6 }} />
              <span className={styles.detailKey}>5G:</span>
              <span className={styles.detailVal} style={{ color: plan.fiveGEnabled ? 'var(--success)' : 'var(--text-3)' }}>
                {plan.fiveGEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <Globe size={14} style={{ color: plan.internationalRoaming ? 'var(--success)' : 'var(--text-3)', marginRight: 6 }} />
              <span className={styles.detailKey}>Roaming:</span>
              <span className={styles.detailVal} style={{ color: plan.internationalRoaming ? 'var(--success)' : 'var(--text-3)' }}>
                {plan.internationalRoaming ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <Flame size={14} style={{ color: plan.hotspotEnabled ? 'var(--success)' : 'var(--text-3)', marginRight: 6 }} />
              <span className={styles.detailKey}>Hotspot:</span>
              <span className={styles.detailVal} style={{ color: plan.hotspotEnabled ? 'var(--success)' : 'var(--text-3)' }}>
                {plan.hotspotEnabled ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          {plan.additionalFeatures?.length > 0 && (
            <div className={styles.extras}>
              <span className={styles.detailKey}>Extra:</span>
              <span className={styles.extraVal}>{plan.additionalFeatures.join(', ')}</span>
            </div>
          )}
          <div className={styles.detailActions}>
            <button className={styles.subscribeBtn}>Subscribe Now</button>
            <button
              className={`${styles.saveBtn} ${selected ? styles.saveBtnActive : ''}`}
              onClick={() => toggle(plan)}>
              {selected ? '✓ Saved for Compare' : 'Save for Later'}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Reviews</h2>

          {user ? (
            <div className={styles.reviewFormWrap}>
              <h3 className={styles.reviewFormTitle}>Write a Review</h3>
              <ReviewForm onSubmit={handleReview} loading={submitting} />
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <Link to="/login" className={styles.loginLink}>Sign in</Link> to write a review
            </div>
          )}

          <div className={styles.reviewList}>
            {reviews.length === 0 && (
              <p className={styles.noReviews}>No reviews yet. Be the first to review this plan!</p>
            )}
            {reviews.map(r => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div>
                    <span className={styles.reviewUser}>{r.username}</span>
                    <span className={styles.reviewStars}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewDate}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {(isAdmin || user?.username === r.username) && (
                      <button className={styles.deleteReview} onClick={() => handleDelete(r.id)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
