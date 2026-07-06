import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../common/Card";
import { useAuth } from "../../context/AuthContext";

export function ExplainabilityCard({ sql, intent, askedAt, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Card delay={delay} className="!p-0 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-7 py-5"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" strokeWidth={1.75} />
          <span className="text-sm font-medium text-ink">
            How the AI reached this
          </span>
          <span className="text-xs text-ink-muted bg-bg-secondary border border-border rounded-full px-2 py-0.5 capitalize">
            {intent}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-ink-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-7 pb-6"
          >
            <div className="border-t border-border pt-4 space-y-3">
              <Row label="Detected intent" value={intent} />
              <Row
                label="Queried by"
                value={`${user?.username || "—"} (${user?.role || "—"})`}
              />
              <Row
                label="Timestamp"
                value={askedAt ? new Date(askedAt).toLocaleString("en-IN") : "—"}
              />
              {sql && (
                <div>
                  <p className="text-xs text-ink-muted mb-1.5">Generated SQL</p>
                  <pre className="text-[12px] leading-relaxed bg-bg-secondary border border-border rounded-xl p-3.5 overflow-x-auto text-ink whitespace-pre-wrap">
                    {sql}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink font-medium capitalize">{value}</span>
    </div>
  );
}
