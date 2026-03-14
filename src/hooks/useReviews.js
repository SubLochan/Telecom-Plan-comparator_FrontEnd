import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '../services/reviewService'

export function useReviews(planId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchReviews = useCallback(async () => {
    if (!planId) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await reviewService.getByPlan(planId)
      // res is a Page<ReviewDto.Response>; extract content array
      setReviews(Array.isArray(res) ? res : (res?.content ?? []))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const addReview = useCallback(async (rating, comment) => {
    const r = await reviewService.add(planId, rating, comment)
    // r is the new ReviewDto.Response object
    setReviews(prev => [r, ...prev])
    return r
  }, [planId])

  const deleteReview = useCallback(async (reviewId) => {
    await reviewService.delete(reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }, [])

  return { reviews, loading, error, addReview, deleteReview, refetch: fetchReviews }
}
