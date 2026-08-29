import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  MapPinned,
  Network,
  Radar,
  FileText,
  BarChart3,
} from "lucide-react";

const ACTION_DEFS = [
  {
    icon: TrendingUp,
    key: "crimePattern",
    prompt: "What crime patterns stand out across Karnataka this year?",
  },
  {
    icon: MapPinned,
    key: "hotspotTrend",
    prompt: "Show me the top crime hotspots right now.",
  },
  {
    icon: Network,
    key: "criminalNetwork",
    prompt: "Show the criminal network for extortion cases.",
  },
  {
    icon: Radar,
    key: "predictiveRisk",
    prompt: "Predict which districts are at rising risk this month.",
  },
  {
    icon: FileText,
    key: "generateReport",
    prompt: "Summarize open cases across all districts.",
  },
  {
    icon: BarChart3,
    key: "districtStats",
    prompt: "Compare case statistics across districts.",
  },
];

export function QuickActions({ onSelect }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {ACTION_DEFS.map(({ icon: Icon, key, prompt }, i) => (
        <motion.button
          key={key}
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
          <h4 className="text-sm font-semibold text-ink mb-1">
            {t(`quickActions.${key}.title`)}
          </h4>
          <p className="text-[13px] text-ink-muted leading-relaxed">
            {t(`quickActions.${key}.desc`)}
          </p>
        </motion.button>
      ))}
    </div>
  );
}
