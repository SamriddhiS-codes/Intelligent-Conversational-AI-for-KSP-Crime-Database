import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getNetwork } from "../lib/api";

const CRIME_TYPES = ["Murder","Robbery","Kidnapping","Fraud","Assault","Extortion"];
const DISTRICTS = ["Bengaluru Urban","Mysuru","Belagavi","Kalaburagi","Mangaluru","Hubballi"];

export function NetworkPage() {
  const { t } = useTranslation();
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [crimeType, setCrimeType] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const res = await getNetwork(crimeType || undefined, district || undefined);
      setData(res);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNetwork(); }, []);

  useEffect(() => {
    if (!data.nodes.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const persons = data.nodes.filter(n => n.type === "person").slice(0, 25);
    const crimes = data.nodes.filter(n => n.type === "crime").slice(0, 12);
    const positions = {};

    persons.forEach((n, i) => {
      const angle = (i / persons.length) * Math.PI * 2;
      positions[n.id] = { x: W/2 + Math.cos(angle) * 210, y: H/2 + Math.sin(angle) * 190 };
    });
    crimes.forEach((n, i) => {
      const angle = (i / crimes.length) * Math.PI * 2;
      positions[n.id] = { x: W/2 + Math.cos(angle) * 85, y: H/2 + Math.sin(angle) * 65 };
    });

    data.edges.slice(0, 60).forEach(e => {
      const from = positions[e.from], to = positions[e.to];
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = "rgba(59,130,246,0.12)";
      ctx.lineWidth = Math.min(e.weight, 2.5);
      ctx.stroke();
    });

    crimes.forEach(n => {
      const pos = positions[n.id];
      if (!pos) return;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#fef2f2";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#374151";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "center";
      ctx.fillText(n.label.split(" ")[0].slice(0, 10), pos.x, pos.y + 3);
    });

    persons.forEach(n => {
      const pos = positions[n.id];
      if (!pos) return;
      const r = Math.min(8 + (n.size || 1) * 1.5, 16);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#eff6ff";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1.5;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#374151";
      ctx.font = "8px Inter";
      ctx.textAlign = "center";
      const name = n.label.split(" ")[0];
      ctx.fillText(name.slice(0, 9), pos.x, pos.y + r + 11);
    });
  }, [data]);

  const legendItems = [
    ["#3b82f6", t("networkPage.legend.accusedPerson")],
    ["#ef4444", t("networkPage.legend.crimeType")],
  ];

  const statsItems = [
    [data.nodes.filter(n=>n.type==="person").length, t("networkPage.stats.accusedPersons")],
    [data.nodes.filter(n=>n.type==="crime").length, t("networkPage.stats.crimeCategories")],
    [data.edges.length, t("networkPage.stats.connections")],
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">{t("networkPage.title")}</h1>
      <p className="text-ink-muted text-sm mb-6">{t("networkPage.subtitle")}</p>

      <div className="flex gap-3 mb-6">
        <select value={crimeType} onChange={e => setCrimeType(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm outline-none bg-card">
          <option value="">{t("networkPage.allCrimeTypes")}</option>
          {CRIME_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={district} onChange={e => setDistrict(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm outline-none bg-card">
          <option value="">{t("networkPage.allDistricts")}</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={fetchNetwork} disabled={loading}
          className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60">
          {loading ? t("networkPage.loading") : t("networkPage.apply")}
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <div className="flex gap-6 mb-3">
          {legendItems.map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: c, background: c+"20" }}/>
              <span className="text-xs text-ink-muted">{l}</span>
            </div>
          ))}
        </div>
        {loading ? (
          <div className="h-[500px] flex items-center justify-center text-ink-muted">{t("networkPage.loadingNetwork")}</div>
        ) : data.nodes.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center text-ink-muted">{t("networkPage.noData")}</div>
        ) : (
          <canvas ref={canvasRef} width={860} height={500} style={{ width: "100%", height: 500 }} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {statsItems.map(([val, label]) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5">
            <div className="text-3xl font-bold text-accent">{val}</div>
            <div className="text-sm text-ink-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
