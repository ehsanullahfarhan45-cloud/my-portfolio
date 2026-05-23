import { motion } from 'framer-motion'
import { KeyRound, LogOut, PenSquare, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { changeAdminPassword, createCollectionItem, deleteCollectionItem, getAdminData, saveProfile, signOutAdmin, updateCollectionItem } from '../services/adminService'

const defaultProfile = {
  name: '',
  title: '',
  intro: '',
  bio: '',
  about: '',
  email: '',
  phone: '',
  location: '',
  profileImage: '',
  socialLinks: [],
  linkedin: '',
  github: '',
  heroBadge: '',
  aboutTitle: '',
  skillsTitle: '',
  experienceTitle: '',
  educationTitle: '',
  projectsTitle: '',
  projectsDescription: '',
  contactTitle: '',
  contactSubtitle: '',
  footerText: ''
}

const emptyItem = {
  skills: { name: '', category: '', icon: '', order: 1 },
  experience: { role: '', company: '', period: '', summary: '', order: 1 },
  education: { degree: '', school: '', period: '', details: '', order: 1 },
  projects: { title: '', description: '', link: '', image: '', tags: '', order: 1 }
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [profile, setProfile] = useState(defaultProfile)
  const [skills, setSkills] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [editor, setEditor] = useState({ collection: 'skills', item: emptyItem.skills, editingId: null })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const data = await getAdminData()
      setProfile({
        ...defaultProfile,
        ...data.profile,
        socialLinks: Array.isArray(data.profile?.socialLinks) ? data.profile.socialLinks : []
      })
      setSkills(data.skills || [])
      setExperience(data.experience || [])
      setEducation(data.education || [])
      setProjects(data.projects || [])
      setMessages(data.messages || [])
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to load admin data.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const collectionLabels = useMemo(() => ({
    profile: 'Profile',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    messages: 'Messages'
  }), [])

  const startCreate = (collection) => {
    setActiveTab(collection)
    setEditor({
      collection,
      editingId: null,
      item: collection === 'projects' ? { ...emptyItem.projects } : { ...emptyItem[collection] }
    })
  }

  const startEdit = (collection, item) => {
    setActiveTab(collection)
    setEditor({
      collection,
      editingId: item.id,
      item: collection === 'projects'
        ? { ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '') }
        : { ...item }
    })
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  const handleEditorChange = (event) => {
    const { name, value } = event.target
    setEditor((current) => ({
      ...current,
      item: {
        ...current.item,
        [name]: value
      }
    }))
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus({ type: 'idle', message: '' })

    try {
      await saveProfile(profile)
      setStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCollectionSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus({ type: 'idle', message: '' })

    try {
      const payload = { ...editor.item }
      if (editor.collection === 'projects' && typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      }
      if (editor.editingId) {
        await updateCollectionItem(editor.collection, editor.editingId, payload)
        setStatus({ type: 'success', message: `${editor.collection.slice(0, -1)} updated.` })
      } else {
        await createCollectionItem(editor.collection, payload)
        setStatus({ type: 'success', message: `${editor.collection.slice(0, -1)} added.` })
      }
      await loadAdminData()
      startCreate(editor.collection)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save this item.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (collection, itemId) => {
    if (!window.confirm('Delete this item?')) {
      return
    }

    try {
      await deleteCollectionItem(collection, itemId)
      await loadAdminData()
      setStatus({ type: 'success', message: 'Item deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to delete item.' })
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus({ type: 'idle', message: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      setSaving(false)
      return
    }

    try {
      await changeAdminPassword(passwordForm.newPassword)
      setStatus({ type: 'success', message: 'Password updated successfully. Please sign in again for best security.' })
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to change password.' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOutAdmin()
      navigate('/admin/login', { replace: true })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to sign out.' })
    }
  }

  const renderInputs = () => {
    if (editor.collection === 'skills') {
      return (
        <>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Skill Name
            <input
              name="name"
              value={editor.item.name || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Category
            <input
              name="category"
              value={editor.item.category || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Icon Key
            <input
              name="icon"
              value={editor.item.icon || ''}
              onChange={handleEditorChange}
              placeholder="sparkles"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Order
            <input
              type="number"
              name="order"
              value={editor.item.order || 1}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
        </>
      )
    }

    if (editor.collection === 'experience') {
      return (
        <>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Role
            <input
              name="role"
              value={editor.item.role || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Company
            <input
              name="company"
              value={editor.item.company || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Period
            <input
              name="period"
              value={editor.item.period || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Summary
            <textarea
              name="summary"
              value={editor.item.summary || ''}
              onChange={handleEditorChange}
              rows="4"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Order
            <input
              type="number"
              name="order"
              value={editor.item.order || 1}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
        </>
      )
    }

    if (editor.collection === 'education') {
      return (
        <>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Degree
            <input
              name="degree"
              value={editor.item.degree || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            School
            <input
              name="school"
              value={editor.item.school || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Period
            <input
              name="period"
              value={editor.item.period || ''}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Details
            <textarea
              name="details"
              value={editor.item.details || ''}
              onChange={handleEditorChange}
              rows="3"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Order
            <input
              type="number"
              name="order"
              value={editor.item.order || 1}
              onChange={handleEditorChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
        </>
      )
    }

    return (
      <>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Title
          <input
            name="title"
            value={editor.item.title || ''}
            onChange={handleEditorChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Description
          <textarea
            name="description"
            value={editor.item.description || ''}
            onChange={handleEditorChange}
            rows="4"
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Link
          <input
            name="link"
            value={editor.item.link || ''}
            onChange={handleEditorChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Image URL
          <input
            name="image"
            value={editor.item.image || ''}
            onChange={handleEditorChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Tags (comma separated)
          <input
            name="tags"
            value={editor.item.tags || ''}
            onChange={handleEditorChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Order
          <input
            type="number"
            name="order"
            value={editor.item.order || 1}
            onChange={handleEditorChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </>
    )
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading admin dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-transparent px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-500">Firebase Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Portfolio Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </motion.div>

        {status.message && (
          <div className={`mt-4 rounded-[22px] px-4 py-3 text-sm ${status.type === 'error' ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-200' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-200'}`}>
            {status.message}
          </div>
        )}

        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[26px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-100">
              <ShieldCheck size={14} />
              Manage content
            </div>
            <nav className="mt-4 space-y-2">
              {Object.entries(collectionLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === key ? 'bg-cyan-500 text-slate-950' : 'border border-slate-200/70 text-slate-700 hover:border-cyan-200 dark:border-slate-700 dark:text-slate-100'}`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>{skills.length} skills</p>
              <p>{experience.length} experiences</p>
              <p>{education.length} education entries</p>
              <p>{projects.length} projects</p>
              <p>{messages.length} messages</p>
            </div>
          </aside>

          <section className="space-y-4">
            {activeTab === 'profile' && (
              <div className="rounded-[26px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Settings</h2>
                <form onSubmit={handleProfileSave} className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Name
                      <input name="name" value={profile.name || ''} onChange={handleProfileChange} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Title
                      <input name="title" value={profile.title || ''} onChange={handleProfileChange} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                      Intro / Short Bio
                      <textarea name="intro" value={profile.intro || ''} onChange={handleProfileChange} rows="3" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                      About / Long Description
                      <textarea name="about" value={profile.about || ''} onChange={handleProfileChange} rows="4" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email
                      <input name="email" value={profile.email || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Phone
                      <input name="phone" value={profile.phone || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Location
                      <input name="location" value={profile.location || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Profile Image URL
                      <input name="profileImage" value={profile.profileImage || ''} onChange={handleProfileChange} placeholder="/src/assets/profile.png" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Hero Badge
                      <input name="heroBadge" value={profile.heroBadge || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Footer Text
                      <input name="footerText" value={profile.footerText || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                    </label>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Social Links</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Edit the links shown on the public portfolio.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfile((current) => ({
                          ...current,
                          socialLinks: [...(current.socialLinks || []), { label: '', url: '', icon: 'website' }]
                        }))}
                        className="rounded-full border border-slate-200/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
                      >
                        Add Link
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {(profile.socialLinks || []).map((link, index) => (
                        <div key={`${link.label || 'link'}-${index}`} className="grid gap-3 rounded-[20px] border border-slate-200/70 bg-white p-3 dark:border-slate-700 dark:bg-slate-950/80 md:grid-cols-[1fr_1fr_140px_auto]">
                          <input
                            value={link.label || ''}
                            onChange={(event) => setProfile((current) => ({
                              ...current,
                              socialLinks: (current.socialLinks || []).map((currentLink, linkIndex) => (
                                linkIndex === index ? { ...currentLink, label: event.target.value } : currentLink
                              ))
                            }))}
                            placeholder="Label"
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          <input
                            value={link.url || ''}
                            onChange={(event) => setProfile((current) => ({
                              ...current,
                              socialLinks: (current.socialLinks || []).map((currentLink, linkIndex) => (
                                linkIndex === index ? { ...currentLink, url: event.target.value } : currentLink
                              ))
                            }))}
                            placeholder="https://example.com"
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          <select
                            value={link.icon || 'website'}
                            onChange={(event) => setProfile((current) => ({
                              ...current,
                              socialLinks: (current.socialLinks || []).map((currentLink, linkIndex) => (
                                linkIndex === index ? { ...currentLink, icon: event.target.value } : currentLink
                              ))
                            }))}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="linkedin">LinkedIn</option>
                            <option value="github">GitHub</option>
                            <option value="website">Website</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setProfile((current) => ({
                              ...current,
                              socialLinks: (current.socialLinks || []).filter((_, linkIndex) => linkIndex !== index)
                            }))}
                            className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 dark:border-rose-900 dark:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab !== 'profile' && (
              <div className="rounded-[26px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{collectionLabels[activeTab]}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create or edit portfolio data for the public page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCreate(activeTab)}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    <PlusCircle size={16} />
                    New {collectionLabels[activeTab].slice(0, -1)}
                  </button>
                </div>

                <form onSubmit={handleCollectionSubmit} className="mt-4 space-y-4">
                  {renderInputs()}
                  <div className="flex justify-end gap-3">
                    <button type="submit" disabled={saving} className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
                      {saving ? 'Saving...' : editor.editingId ? 'Update Item' : 'Create Item'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 space-y-3">
                  {(activeTab === 'skills' ? skills : activeTab === 'experience' ? experience : activeTab === 'education' ? education : projects).map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.name || item.role || item.degree || item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {item.category || item.company || item.school || item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEdit(activeTab, item)} className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
                          <PenSquare size={16} />
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(activeTab, item.id)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 dark:border-rose-900 dark:text-rose-200">
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="rounded-[26px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Messages</h2>
                <div className="mt-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{message.name}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message.email}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="rounded-[26px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Security</h2>
                <form onSubmit={handlePasswordChange} className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    New Password
                    <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Confirm Password
                    <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                  </label>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
                      <KeyRound size={16} />
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard