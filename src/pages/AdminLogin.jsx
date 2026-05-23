import { motion } from 'framer-motion'
import { ShieldCheck, Mail, LockKeyhole, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { getAuthInstance, isFirebaseConfigured } from '../services/firebase'
import { resetAdminPassword, signInAdmin } from '../services/adminService'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    let unsubscribe = null

    const initAuthListener = async () => {
      try {
        if (!isFirebaseConfigured()) {
          return
        }

        const auth = await getAuthInstance()

        if (!auth || !active) {
          return
        }

        const { onAuthStateChanged } = await import('firebase/auth')
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (active && user) {
            navigate('/admin', { replace: true })
          }
        })
      } catch {
        // Ignore auth bootstrap failures and let the login form render.
      }
    }

    initAuthListener()

    return () => {
      active = false
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signInAdmin(form.email, form.password)
      navigate('/admin', { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await resetAdminPassword(resetEmail)
      setSuccess('Password reset email sent. Check your inbox.')
    } catch (resetError) {
      setError(resetError.message || 'Unable to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-500">Admin Access</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Login to manage your portfolio</h1>
        </div>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-6 grid max-w-5xl gap-4 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-100">
            <ShieldCheck size={14} className="mr-2" />
            Secure admin panel
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Use Firebase Authentication to access the dashboard and update your portfolio content securely.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>• Keep credentials private and rotate passwords regularly.</p>
            <p>• Changes are saved directly to Firestore and reflected on the public site.</p>
            <p>• Only authenticated admins can write portfolio data.</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <Mail size={18} className="text-cyan-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border-0 bg-transparent text-slate-900 outline-none dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <LockKeyhole size={18} className="text-cyan-500" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border-0 bg-transparent text-slate-900 outline-none dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Login'}
              <ArrowRight size={16} />
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
          {success && <p className="mt-4 text-sm text-emerald-500">{success}</p>}

          <div className="mt-6 border-t border-slate-200/70 pt-6 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Forgot password?</p>
            <form onSubmit={handleReset} className="mt-3 space-y-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="Enter email to reset password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
              >
                Send reset email
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin