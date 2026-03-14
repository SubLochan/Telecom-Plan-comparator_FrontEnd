import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CompareContext = createContext(null)

const MAX = 5

export function CompareProvider({ children }) {
  const { user } = useAuth()

  // Key comparisons by user id — null/undefined means "guest"
  const [store, setStore] = useState({})   // { [userId]: [plan, ...] }

  // Derive the active user key — guests share a "guest" bucket
  const userKey = user?.id ?? 'guest'

  // Active selection for the current user
  const selected = store[userKey] ?? []

  // Clear the current user's list when they log out (userKey changes to 'guest')
  useEffect(() => {
    // When user changes (login / logout / switch), do NOT carry over another user's list.
    // Each key starts empty unless already stored in the same session.
  }, [userKey])

  const toggle = useCallback((plan) => {
    setStore(prev => {
      const current = prev[userKey] ?? []
      const exists  = current.find(p => p.id === plan.id)
      const next    = exists
        ? current.filter(p => p.id !== plan.id)
        : current.length >= MAX ? current : [...current, plan]
      return { ...prev, [userKey]: next }
    })
  }, [userKey])

  const clear = useCallback(() => {
    setStore(prev => ({ ...prev, [userKey]: [] }))
  }, [userKey])

  const isSelected = useCallback(
    (id) => selected.some(p => p.id === id),
    [selected]
  )

  return (
    <CompareContext.Provider value={{ selected, toggle, clear, isSelected, max: MAX }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be inside CompareProvider')
  return ctx
}
