import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../common/Card";

export function SummaryCard({ summary, rowCount, delay = 0 }) {
  const { t } = useTranslation();
  return (
    <Card delay={delay} className="bg-gradient-to-br from-card to-card">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <p className="text-xs font-medium tracking-wide uppercase text-ink-muted">
          {t("summaryCard.eyebrow")}
        </p>
      </div>
      <p className="text-[17px] leading-relaxed text-ink">{summary}</p>
      {typeof rowCount === "number" && (
        <p className="text-xs text-ink-muted mt-4">
          {t("summaryCard.basedOnRecords", { count: rowCount })}
        </p>
      )}
    </Card>
  );
}
