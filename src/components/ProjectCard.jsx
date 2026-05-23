import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const ProjectCard = ({ title, description, image, link, tags = [] }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/75"
    >
      <div
        className="relative h-40 bg-slate-200/80 dark:bg-slate-900"
        style={
          image
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.85)), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : undefined
        }
      >
        {!image && (
          <div className="flex h-full items-end p-4 text-sm font-semibold text-slate-900 dark:text-white">
            Featured Project
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Featured Project</p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 transition hover:text-cyan-500 dark:text-white"
            >
              Visit
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cyan-200/70 bg-cyan-50 px-3 py-1 text-xs font-semibold text-slate-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export default ProjectCard