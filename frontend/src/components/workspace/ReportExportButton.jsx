import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { exportPdf } from "../../lib/api";

export function ReportExportButton({ conversation, queryResults }) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const blob = await exportPdf(conversation, queryResults);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "ksp-crime-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // fail silently in-UI; a toast component can hook in here later
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-ink text-white text-sm font-medium hover:bg-[#2C1F28] transition-colors disabled:opacity-60"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" strokeWidth={1.75} />
      )}
      {downloading ? t("reportExport.preparing") : t("reportExport.generate")}
    </button>
  );
}
