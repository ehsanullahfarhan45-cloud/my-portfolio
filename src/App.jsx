import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'

const pageModules = import.meta.glob('./pages/*.jsx')

const Home = lazy(pageModules['./pages/Home.jsx'])
const AdminLogin = lazy(pageModules['./pages/AdminLogin.jsx'])
const AdminDashboard = lazy(pageModules['./pages/AdminDashboard.jsx'])

const routeFallback = (
  <div className="grid min-h-screen place-items-center text-sm text-slate-500 dark:text-slate-300">
    Loading...
  </div>
)

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App