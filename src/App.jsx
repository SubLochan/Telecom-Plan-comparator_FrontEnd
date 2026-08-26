import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CompareProvider } from './context/CompareContext'

import Navbar         from './components/layout/Navbar'
import Dashboard      from './pages/Dashboard'
import PlanDetail     from './pages/PlanDetail'
import ComparePage    from './pages/ComparePage'
import Reports        from './pages/Reports'
import JobRecommender from './pages/JobRecommender'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Profile        from './pages/Profile'
import Admin          from './pages/Admin'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

function Spinner() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      border: '2px solid var(--border-2)',
      borderTopColor: 'var(--accent)',
      animation: 'spin 0.7s linear infinite'
    }} />
  )
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/plans/:id"   element={<PlanDetail />} />
        <Route path="/compare"     element={<ComparePage />} />
        <Route path="/best-plan"   element={<JobRecommender />} />
        <Route path="/reports"     element={<Reports />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin"       element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-3)',
                color: 'var(--text)',
                border: '1px solid var(--border-2)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg)' } },
              error:   { iconTheme: { primary: 'var(--danger)',  secondary: 'var(--bg)' } },
            }}
          />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
