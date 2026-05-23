import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAuthInstance, isFirebaseConfigured } from '../services/firebase'

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let active = true
    let unsubscribe = null

    const checkAuth = async () => {
      try {
        if (!isFirebaseConfigured()) {
          if (active) {
            setChecking(false)
            setIsAuthenticated(false)
          }
          return
        }

        const auth = await getAuthInstance()

        if (!auth) {
          if (active) {
            setChecking(false)
            setIsAuthenticated(false)
          }
          return
        }

        const { onAuthStateChanged } = await import('firebase/auth')
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (active) {
            setIsAuthenticated(Boolean(user))
            setChecking(false)
          }
        })
      } catch {
        if (active) {
          setChecking(false)
          setIsAuthenticated(false)
        }
      }
    }

    checkAuth()

    return () => {
      active = false
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  if (checking) {
    return <div className="admin-loading">Checking admin access...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute