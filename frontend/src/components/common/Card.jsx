import { motion } from "framer-motion";

export function Card({ children, className = "", delay = 0, as: Comp = "div" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-card border border-border rounded-card shadow-soft p-5 sm:p-7 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function CardTitle({ eyebrow, title, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium tracking-wide uppercase text-ink-muted mb-1">
            {eyebrow}
          </p>
        )}
        {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
      </div>
      {action}
    </div>
  );
}
