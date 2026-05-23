import { motion } from 'framer-motion'

const SectionHeader = ({ eyebrow, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-500">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>}
    </motion.div>
  )
}

export default SectionHeader