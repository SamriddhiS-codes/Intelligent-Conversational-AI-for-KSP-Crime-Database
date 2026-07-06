import { motion } from "framer-motion";

export function SuggestionCard({ icon: Icon, label, onClick, delay = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-ink-muted hover:text-ink hover:border-accent/40 hover:shadow-soft transition-all whitespace-nowrap"
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
      {label}
    </motion.button>
  );
}
