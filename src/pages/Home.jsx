import { motion } from 'framer-motion'
import { ArrowRight, Globe2, Mail, MapPin, Menu, MessageSquare, PhoneCall, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import SkillGroup from '../components/SkillGroup'
import ProjectCard from '../components/ProjectCard'
import SkeletonLoader from '../components/SkeletonLoader'
import ThemeToggle from '../components/ThemeToggle'
import profileImage from '../../assests/mylogo.png'
import { loadPortfolioData, submitContactMessage } from '../services/portfolioService'

const initialForm = { name: '', email: '', message: '' }

const socialIconMap = {
  linkedin: Globe2,
  github: Globe2,
  website: Globe2,
  default: Globe2
}

const navItems = ['About', 'Skills', 'Experience', 'Education', 'Projects', 'Contact']

const Home = () => {
  const [portfolioData, setPortfolioData] = useState({
    profile: null,
    skills: [],
    experience: [],
    education: [],
    projects: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState(initialForm)
  const [formStatus, setFormStatus] = useState({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await loadPortfolioData()
      setPortfolioData(data)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      fetchPortfolio()
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    fetchPortfolio()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const profile = portfolioData.profile ?? {}

  const groupedSkills = useMemo(() => {
    return portfolioData.skills.reduce((groups, skill) => {
      const category = skill.category || 'General'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(skill.name)
      return groups
    }, {})
  }, [portfolioData.skills])

  const socialLinks = useMemo(() => {
    if (Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0) {
      return profile.socialLinks
        .filter((item) => item?.url)
        .map((item) => ({
          label: item.label || item.icon || 'Link',
          url: item.url,
          icon: socialIconMap[item.icon] || socialIconMap.default
        }))
    }

    const links = []

    if (profile.linkedin) {
      links.push({ label: 'LinkedIn', url: profile.linkedin, icon: socialIconMap.linkedin })
    }

    if (profile.github) {
      links.push({ label: 'GitHub', url: profile.github, icon: socialIconMap.github })
    }

    if (links.length === 0) {
      links.push({ label: 'Portfolio', url: '#contact', icon: socialIconMap.default })
    }

    return links
  }, [profile])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormStatus({ type: 'idle', message: '' })

    try {
      await submitContactMessage(formState)
      setFormStatus({
        type: 'success',
        message: 'Thanks for reaching out. Your message has been saved to Firestore.'
      })
      setFormState(initialForm)
    } catch (submitError) {
      setFormStatus({
        type: 'error',
        message: submitError.message || 'Unable to save your message right now.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const brandInitial = profile.name ? profile.name.charAt(0) : 'P'
  const profileAvatar = profile.profileImage || profileImage
  const footerText = profile.footerText || `© ${new Date().getFullYear()} ${profile.name || 'Portfolio'} — Built with React and Firebase.`

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 rounded-[28px] border border-slate-200/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-black text-slate-950">
                {brandInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.name || 'Your Portfolio'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{profile.title || 'Professional Developer'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <nav className="hidden items-center gap-2 md:flex">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <ThemeToggle />
              <button
                type="button"
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-900 shadow-soft backdrop-blur transition hover:scale-105 md:hidden dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-3 rounded-[22px] border border-slate-200/70 bg-white/95 p-3 md:hidden dark:border-slate-800 dark:bg-slate-950/95">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className="pt-6">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              <motion.section
                id="home"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]"
              >
                <div className="rounded-[30px] border border-slate-200/70 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100">
                    <Sparkles size={14} />
                    {profile.heroBadge || 'Dynamic portfolio powered by Firestore'}
                  </div>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    {profile.name || 'Portfolio'}
                  </h1>
                  <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{profile.title || 'Developer'}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {profile.intro || profile.bio || profile.description || ''}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft"
                    >
                      Let’s Connect
                      <ArrowRight size={16} />
                    </a>
                    <a
                      href="#projects"
                      className="inline-flex items-center rounded-full border border-slate-200/70 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-cyan-200 dark:border-slate-700 dark:text-white"
                    >
                      View Projects
                    </a>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {socialLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
                        >
                          <Icon size={16} />
                          {link.label}
                        </a>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-[30px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-6">
                  <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/80">
                    <img
                      src={profileAvatar}
                      alt={profile.name || 'Profile'}
                      className="h-72 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-500">Snapshot</p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Premium portfolio experience</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        Built to showcase your work with elegant sections, responsive layouts, and live-firestore content updates.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-slate-200/70 px-4 py-3 dark:border-slate-800">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Experience</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{portfolioData.experience.length}</p>
                    </div>
                    <div className="rounded-[20px] border border-slate-200/70 px-4 py-3 dark:border-slate-800">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Projects</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{portfolioData.projects.length}</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {error && (
                <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-200">
                  <strong>{error}</strong>
                  <button
                    type="button"
                    onClick={fetchPortfolio}
                    className="ml-3 rounded-full border border-rose-300 px-3 py-1 font-semibold dark:border-rose-600"
                  >
                    Retry
                  </button>
                </div>
              )}

              <section id="about" className="mt-8">
                <SectionHeader
                  eyebrow="About me"
                  title={profile.aboutTitle || 'Building thoughtful digital products'}
                  description={profile.about || profile.bio || ''}
                />
              </section>

              <section id="skills" className="mt-2">
                <SectionHeader
                  eyebrow="Skills"
                  title={profile.skillsTitle || 'Core strengths and technical focus'}
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(groupedSkills).map(([category, items]) => (
                    <SkillGroup key={category} title={category} items={items} />
                  ))}
                </div>
              </section>

              <section id="experience" className="mt-8">
                <SectionHeader
                  eyebrow="Experience"
                  title={profile.experienceTitle || 'Professional journey'}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolioData.experience.map((item) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/75"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">{item.period}</p>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{item.role}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.company}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.summary}</p>
                    </motion.article>
                  ))}
                </div>
              </section>

              <section id="education" className="mt-8">
                <SectionHeader
                  eyebrow="Education"
                  title={profile.educationTitle || 'Academic foundation'}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolioData.education.map((item) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/75"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">{item.period}</p>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{item.degree}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.school}</p>
                      {item.details && <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.details}</p>}
                    </motion.article>
                  ))}
                </div>
              </section>

              <section id="projects" className="mt-8">
                <SectionHeader
                  eyebrow="Projects"
                  title={profile.projectsTitle || 'Selected work'}
                  description={profile.projectsDescription || 'A dynamic showcase of recent work and product thinking.'}
                />
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {portfolioData.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      title={project.title}
                      description={project.description}
                      image={project.image}
                      link={project.link}
                      tags={project.tags || []}
                    />
                  ))}
                </div>
              </section>

              <section id="contact" className="mt-8">
                <SectionHeader
                  eyebrow="Contact"
                  title={profile.contactTitle || 'Let’s build something meaningful together'}
                  description={profile.contactSubtitle || 'Send your details and I’ll follow up as soon as possible.'}
                />
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-cyan-500" />
                        <span>{profile.email || 'Available on request'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneCall size={18} className="text-cyan-500" />
                        <span>{profile.phone || 'Available on request'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-cyan-500" />
                        <span>{profile.location || 'Remote'}</span>
                      </div>
                    </div>
                    <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-start gap-3">
                        <MessageSquare size={18} className="mt-0.5 text-cyan-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Prefer a personal intro?</p>
                          <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Reach out directly to discuss collaborations, opportunities, or product ideas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="rounded-[24px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Name
                        <input
                          type="text"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          required
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Email
                        <input
                          type="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          required
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Message
                        <textarea
                          name="message"
                          value={formState.message}
                          onChange={handleChange}
                          rows="5"
                          required
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || isOffline}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? 'Saving...' : isOffline ? 'Offline' : 'Send Message'}
                        {!isOffline && <ArrowRight size={16} />}
                      </button>
                      {isOffline && (
                        <p className="text-sm text-rose-500">
                          Reconnect to the internet to send a message.
                        </p>
                      )}
                    </div>

                    {formStatus.message && (
                      <p className={`mt-4 text-sm ${formStatus.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {formStatus.message}
                      </p>
                    )}
                  </form>
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="mt-10 border-t border-slate-200/70 pt-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
          <p>{footerText}</p>
        </footer>
      </div>
    </div>
  )
}

export default Home