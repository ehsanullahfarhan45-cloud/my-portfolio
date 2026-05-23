import { motion } from 'framer-motion'

const SkillGroup = ({ title, items }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/75"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-sm font-semibold text-slate-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

export default SkillGroup