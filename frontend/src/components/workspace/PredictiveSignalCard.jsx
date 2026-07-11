import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { Card, CardTitle } from "../common/Card";
import { getTrends } from "../../lib/api";

const RISK_STYLES = {
  High: "bg-[#F3E4E1] text-[#8A4A3E]",
  Medium: "bg-highlight/60 text-ink",
  Low: "bg-bg-secondary text-ink-muted",
};

const RISK_ICON = {
  High: TrendingUp,
  Medium: Minus,
  Low: TrendingDown,
};

// Heuristic: compares the most recent 2 months of counts per crime_type
// against the 2 months before that. This is an early-stage signal, not a
// trained forecasting model — labeled as such in the UI.
function computeSignals(rows) {
  const byType = {};
  rows.forEach((r) => {
    const key = r.crime_type;
    byType[key] = byType[key] || [];
    byType[key].push(r);
  });

  return Object.entries(byType)
    .map(([crimeType, entries]) => {
      const sorted = [...entries].sort(
        (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month)
      );
      const recent = sorted.slice(-2).reduce((s, r) => s + r.count, 0);
      const prior = sorted.slice(-4, -2).reduce((s, r) => s + r.count, 0);
      const delta = prior === 0 ? recent : (recent - prior) / Math.max(prior, 1);
      let risk = "Low";
      if (delta > 0.25) risk = "High";
      else if (delta > 0.05) risk = "Medium";
      return { crimeType, recent, prior, delta, risk };
    })
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5);
}

export function PredictiveSignalCard({ district, delay = 0 }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrends(district)
      .then((rows) => setSignals(computeSignals(rows)))
      .catch(() => setSignals([]))
      .finally(() => setLoading(false));
  }, [district]);

  if (loading || !signals.length) return null;

  return (
    <Card delay={delay}>
      <CardTitle
        eyebrow="Early Warning Signal"
        title="Rising-risk crime types"
        action={
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
            Heuristic signal
          </span>
        }
      />
      <div className="space-y-2.5">
        {signals.map(({ crimeType, risk, delta }) => {
          const Icon = RISK_ICON[risk];
          return (
            <div
              key={crimeType}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                <span className="text-sm text-ink">{crimeType}</span>
              </div>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${RISK_STYLES[risk]}`}
              >
                {risk} · {delta >= 0 ? "+" : ""}
                {Math.round(delta * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-ink-muted mt-4">
        Based on recent vs. prior 2-month movement in reported counts. Intended as an
        early-stage signal for investigator attention, not a validated forecast.
      </p>
    </Card>
  );
}
