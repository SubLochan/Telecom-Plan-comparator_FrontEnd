import { useState, useEffect, useCallback } from 'react'
import { recommendationService } from '../services/recommendationService'

export function useOccupations() {
  const [occupations, setOccupations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recommendationService.getOccupations()
      .then(res => setOccupations(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { occupations, loading }
}

export function useRecommendation() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const getRecommendation = useCallback(async (occupation, maxBudget) => {
    setLoading(true); setError(null)
    try {
      const res = await recommendationService.recommend(occupation, maxBudget)
      setResult(res)
      return res
    } catch (e) {
      setError(e.message)
      setResult(null)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => { setResult(null); setError(null) }, [])

  return { result, loading, error, getRecommendation, reset }
}
