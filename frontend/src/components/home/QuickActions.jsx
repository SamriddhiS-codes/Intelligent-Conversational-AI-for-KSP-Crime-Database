import { motion } from "framer-motion";
import {
  TrendingUp,
  MapPinned,
  Network,
  Radar,
  FileText,
  BarChart3,
} from "lucide-react";

const ACTIONS = [
  {
    icon: TrendingUp,
    title: "Crime Pattern Analysis",
    desc: "Surface recurring patterns across crime types and districts.",
    prompt: "What crime patterns stand out across Karnataka this year?",
  },
  {
    icon: MapPinned,
    title: "Hotspot & Trend Detection",
    desc: "See where and when incidents are concentrating.",
    prompt: "Show me the top crime hotspots right now.",
  },
  {
    icon: Network,
    title: "Criminal Network Explorer",
    desc: "Trace connections between accused persons and crime types.",
    prompt: "Show the criminal network for extortion cases.",
  },
  {
    icon: Radar,
    title: "Predictive Risk Signals",
    desc: "Early-warning signals based on recent trend movement.",
    prompt: "Predict which districts are at rising risk this month.",
  },
  {
    icon: FileText,
    title: "Generate Report",
    desc: "Export the current workspace as an official PDF report.",
    prompt: "Summarize open cases across all districts.",
  },
  {
    icon: BarChart3,
    title: "District Statistics",
    desc: "Compare case load, severity and closure rate by district.",
    prompt: "Compare case statistics across districts.",
  },
];

export function QuickActions({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {ACTIONS.map(({ icon: Icon, title, desc, prompt }, i) => (
        <motion.button
          key={title}
          type="button"
          onClick={() => onSelect(prompt)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * i }}
          whileHover={{ y: -3 }}
          className="text-left bg-card border border-border rounded-card p-5 shadow-soft hover:shadow-softLift hover:border-accent/30 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-highlight/50 flex items-center justify-center mb-3">
            <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
          </div>
          <h4 className="text-sm font-semibold text-ink mb-1">{title}</h4>
          <p className="text-[13px] text-ink-muted leading-relaxed">{desc}</p>
        </motion.button>
      ))}
    </div>
  );
}
