import { motion } from "framer-motion";
import { MapPin, User } from "lucide-react";

const SEVERITY_STYLES = {
  High: "bg-[#F3E4E1] text-[#8A4A3E]",
  Medium: "bg-highlight/60 text-ink",
  Low: "bg-bg-secondary text-ink-muted",
};

export function RecordCard({ record, delay = 0 }) {
  const severity = record.severity;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-soft hover:shadow-softLift transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-ink-muted mb-0.5">
            {record.fir_number || "Record"}
          </p>
          <h4 className="text-sm font-semibold text-ink">
            {record.crime_type || "—"}
          </h4>
        </div>
        {severity && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
              SEVERITY_STYLES[severity] || "bg-bg-secondary text-ink-muted"
            }`}
          >
            {severity}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-[13px] text-ink-muted">
        {record.district && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>
              {record.district}
              {record.police_station ? ` · ${record.police_station}` : ""}
            </span>
          </div>
        )}
        {record.accused_name && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{record.accused_name}</span>
          </div>
        )}
      </div>

      {record.case_status && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-[12px] text-ink-muted">{record.case_status}</span>
        </div>
      )}
    </motion.div>
  );
}
