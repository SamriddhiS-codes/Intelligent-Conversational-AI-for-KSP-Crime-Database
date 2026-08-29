import { useState } from "react";
import { useTranslation } from "react-i18next";
import { runQuery } from "../lib/api";

export function FIRSearchPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true); setError(""); setSearched(true);
    try {
      const res = await runQuery(`Find FIR records where ${search}`, []);
      setResults(res.results || []);
    } catch {
      setError(t("firSearchPage.searchFailed"));
    } finally { setLoading(false); }
  };

  // Display label (translated) is separate from the actual query text sent
  // to the backend (kept in English, since crime_type/district field values
  // in the database are English and the SQL-generation prompt expects that).
  const QUICK = [
    { labelKey: "accusedKumar", query: "accused name contains Kumar" },
    { labelKey: "murderMysuru", query: "crime type is Murder and district is Mysuru" },
    { labelKey: "underInvestigation", query: "case status is Under Investigation" },
    { labelKey: "weaponKnife", query: "weapon used is Knife" },
    { labelKey: "juvenileInvolved", query: "is juvenile involved" },
    { labelKey: "bengaluruHigh", query: "district is Bengaluru Urban and severity is High" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">{t("firSearchPage.title")}</h1>
      <p className="text-ink-muted text-sm mb-6">{t("firSearchPage.subtitle")}</p>

      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={t("firSearchPage.placeholder")}
            className="flex-1 border border-border rounded-xl px-4 py-3 text-sm outline-none bg-bg-secondary focus:border-accent"
          />
          <button onClick={handleSearch} disabled={loading}
            className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
            {loading ? t("firSearchPage.searching") : t("firSearchPage.search")}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-ink-muted mb-2">{t("firSearchPage.quickSearches")}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map(q => (
              <button key={q.labelKey} onClick={() => { setSearch(q.query); }}
                className="bg-highlight text-accent text-xs px-3 py-1.5 rounded-full border border-accent/20 hover:bg-accent/10">
                {t(`firSearchPage.quick.${q.labelKey}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">{error}</div>}

      {searched && !loading && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            {results.length > 0
              ? t("firSearchPage.recordsFound", { count: results.length })
              : t("firSearchPage.noRecordsFound")}
          </h3>
          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary">
                    {Object.keys(results[0]).slice(0, 8).map(k => (
                      <th key={k} className="text-left p-3 text-ink-muted font-medium whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-bg-secondary/50">
                      {Object.values(row).slice(0, 8).map((v, j) => (
                        <td key={j} className="p-3 text-ink whitespace-nowrap">{v ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
