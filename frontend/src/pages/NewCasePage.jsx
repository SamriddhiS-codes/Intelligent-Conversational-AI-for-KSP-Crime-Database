import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCrime } from "../lib/api";

const CRIME_TYPES = [
  "Robbery", "Burglary", "Drug Trafficking", "Vehicle Theft", "Kidnapping",
  "Murder", "Hit and Run", "Rioting", "Fraud", "Assault",
];
const SEVERITIES = ["Low", "Medium", "High"];

export function NewCasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fir_number: "",
    crime_type: "",
    district: "",
    police_station: "",
    incident_date: "",
    case_narrative: "",
    severity: "Medium",
    weapon_used: "",
    is_juvenile_involved: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createCrime(form);
      setSuccess(result);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create case.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold text-ink mb-1">Log New Case</h1>
      <p className="text-sm text-ink-muted mb-6">
        The case narrative below is embedded immediately, so it's searchable
        via "similar cases" right after you submit — no waiting for a batch job.
      </p>

      {success && (
        <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 text-sm">
          ✅ Case <strong>{success.fir_number}</strong> created and{" "}
          {success.indexed ? "indexed for similar-case search." : "saved (no narrative to index)."}{" "}
          <button
            className="underline font-medium"
            onClick={() => navigate("/workspace")}
          >
            Go ask the AI about it →
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="FIR Number">
            <input
              required
              value={form.fir_number}
              onChange={update("fir_number")}
              placeholder="e.g. 0512/2026"
              className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Field>
          <Field label="Crime Type">
            <select required value={form.crime_type} onChange={update("crime_type")} className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option value="">Select...</option>
              {CRIME_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="District">
            <input required value={form.district} onChange={update("district")} className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </Field>
          <Field label="Police Station">
            <input required value={form.police_station} onChange={update("police_station")} className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </Field>
          <Field label="Incident Date">
            <input
              required
              type="date"
              value={form.incident_date}
              onChange={update("incident_date")}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Field>
          <Field label="Severity">
            <select value={form.severity} onChange={update("severity")} className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30">
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Weapon Used (optional)">
            <input value={form.weapon_used} onChange={update("weapon_used")} className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-muted mt-6">
            <input type="checkbox" checked={form.is_juvenile_involved} onChange={update("is_juvenile_involved")} />
            Juvenile involved
          </label>
        </div>

        <Field label="Case Narrative">
          <textarea
            required
            rows={5}
            value={form.case_narrative}
            onChange={update("case_narrative")}
            placeholder="Describe what happened, as you would in an FIR..."
            className="w-full px-3 py-2 border border-border rounded-xl text-sm text-ink bg-card resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Creating & indexing..." : "Create Case"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-muted">{label}</label>
      {children}
    </div>
  );
}