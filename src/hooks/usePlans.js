import { useState, useEffect, useCallback } from 'react'
import { planService } from '../services/planService'

export function usePlans({ page = 0, size = 12, sortBy = 'monthlyPrice', sortDir = 'asc' } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await planService.getAll(page, size, sortBy, sortDir)
      // res is a Page<PlanDto.Response>: { content, totalElements, totalPages, ... }
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, size, sortBy, sortDir])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  return { data, loading, error, refetch: fetchPlans }
}

export function useFilteredPlans() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const filter = useCallback(async (filterBody, page = 0) => {
    setLoading(true); setError(null)
    try {
      const res = await planService.filter(filterBody, page)
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, filter }
}

export function usePlan(id) {
  const [plan, setPlan]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    planService.getById(id)
      .then(setPlan)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return { plan, loading, error }
}

export function useProviders() {
  const [providers, setProviders] = useState([])
  useEffect(() => {
    planService.getProviders()
      .then(res => setProviders(Array.isArray(res) ? res : []))
      .catch(() => {})
  }, [])
  return providers
}
