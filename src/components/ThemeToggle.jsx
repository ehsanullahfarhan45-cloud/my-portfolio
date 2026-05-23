import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-900 shadow-soft backdrop-blur transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default ThemeToggle
