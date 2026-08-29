//report page for exporting official crime intelligence reports as PDF
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { exportPdf } from "../lib/api";

export function ReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const conversation = [
        { role: "user", content: "Generate KSP Crime Intelligence Report" },
        { role: "assistant", content: "This report contains crime analytics data from the KSP Crime Database including district-wise breakdown, crime type distribution, and hotspot analysis." }
      ];
      const blob = await exportPdf(conversation, []);

      // Guard: if the backend returned an error, axios still resolves (not
      // rejects) when responseType is "blob" — the error body just arrives
      // as a Blob instead of JSON. Detect that case explicitly instead of
      // silently downloading a broken "PDF" that's actually an error message.
      if (blob.type && blob.type.includes("json")) {
        const text = await blob.text();
        const detail = JSON.parse(text)?.detail || "Export failed.";
        throw new Error(detail);
      }

      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = "KSP-Crime-Report.pdf"; a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      console.error("PDF export failed:", err);
      let message = err?.message || "Something went wrong generating the report.";
      // When responseType is "blob", an error response body also arrives as
      // a Blob (not parsed JSON) — unwrap it to get the real backend detail.
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          message = JSON.parse(text)?.detail || message;
        } catch {
          // response wasn't JSON either — fall back to the generic message
        }
      } else if (err?.response?.data?.detail) {
        message = err.response.data.detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const REPORT_TYPE_DEFS = [
    { key: "crimeSummary", icon: "📊" },
    { key: "hotspotAnalysis", icon: "🗺️" },
    { key: "districtComparison", icon: "📋" },
    { key: "networkReport", icon: "🕸️" },
    { key: "trendAnalysis", icon: "📈" },
    { key: "caseStatus", icon: "⚖️" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">{t("reportsPage.title")}</h1>
      <p className="text-ink-muted text-sm mb-8">{t("reportsPage.subtitle")}</p>

      {success && (
        <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 text-sm flex items-center gap-2">
          ✅ {t("reportsPage.downloadSuccess")}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6 text-sm flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        {REPORT_TYPE_DEFS.map(r => (
          <div key={r.key} className="bg-card rounded-2xl border border-border p-5 hover:border-accent/30 transition-colors">
            <div className="text-2xl mb-3">{r.icon}</div>
            <h3 className="font-semibold text-ink text-sm mb-1">{t(`reportsPage.types.${r.key}.title`)}</h3>
            <p className="text-xs text-ink-muted mb-4">{t(`reportsPage.types.${r.key}.desc`)}</p>
            <button onClick={handleExport} disabled={loading}
              className="text-xs text-accent font-medium border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/5 disabled:opacity-60">
              {loading ? t("reportsPage.generating") : t("reportsPage.exportPdf")}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-highlight/30 rounded-2xl border border-accent/20 p-6">
        <h3 className="font-semibold text-ink text-sm mb-2">📌 {t("reportsPage.proTip")}</h3>
        <p className="text-xs text-ink-muted">
          {t("reportsPage.proTipText")}
        </p>
      </div>
    </div>
  );
}
