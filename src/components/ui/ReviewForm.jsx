import { useState } from 'react'
import { Star } from 'lucide-react'
import styles from './ReviewForm.module.css'

export function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0)

  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= (hover || value) ? styles.starFilled : ''}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          aria-label={`${n} star`}
        >
          <Star size={18} fill={n <= (hover || value) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewForm({ onSubmit, loading }) {
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [err, setErr]         = useState('')

  const handle = async (e) => {
    e.preventDefault()
    if (rating === 0) { setErr('Please select a rating'); return }
    setErr('')
    await onSubmit(rating, comment)
    setRating(0)
    setComment('')
  }

  return (
    <form className={styles.form} onSubmit={handle}>
      <div className={styles.group}>
        <label className={styles.label}>Your Rating</label>
        <StarRating value={rating} onChange={setRating} />
        {err && <span className={styles.err}>{err}</span>}
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Comment (optional)</label>
        <textarea
          className={styles.textarea}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience with this plan…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <span className={styles.charCount}>{comment.length}/1000</span>
      </div>
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
