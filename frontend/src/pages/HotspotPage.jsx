import { useEffect, useState } from "react";
import { getHotspots } from "../lib/api";

export function HotspotPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    getHotspots(30).then(data => {
      setHotspots(data.filter(h => h.lat && h.lng));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!hotspots.length || mapReady) return;

    const initMap = () => {
      if (!window.L) return;
      setMapReady(true);
      const map = window.L.map("hotspot-map").setView([15.3173, 75.7139], 7);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      hotspots.forEach(h => {
        const color = h.crime_count > 50 ? "#ef4444" : h.crime_count > 20 ? "#f59e0b" : "#3b82f6";
        const radius = Math.min(Math.max(h.crime_count * 300, 3000), 25000);
        window.L.circle([h.lat, h.lng], { color, fillColor: color, fillOpacity: 0.35, radius, weight: 1.5 })
          .addTo(map)
          .bindPopup(`<b>${h.district}</b><br/><span style="color:#6b7280;font-size:11px">${h.police_station}</span><br/><b>${h.crime_count}</b> ${h.crime_type} cases`);
      });
    };

    if (window.L) { initMap(); return; }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);
  }, [hotspots, mapReady]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">Hotspot Map</h1>
          <p className="text-ink-muted text-sm">Crime concentration across Karnataka districts</p>
        </div>
        <div className="flex gap-4">
          {[["#ef4444","High (50+)"],["#f59e0b","Medium (20-50)"],["#3b82f6","Low (<20)"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: c }}/>
              <span className="text-xs text-ink-muted">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6" style={{ position: "relative" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card z-10 text-ink-muted">
            Loading hotspot data...
          </div>
        )}
        <div id="hotspot-map" style={{ width: "100%", height: 480 }} />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Top Crime Hotspots</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary">
                {["Rank","District","Police Station","Crime Type","Count"].map(h => (
                  <th key={h} className="text-left p-3 text-ink-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hotspots.slice(0, 15).map((h, i) => (
                <tr key={i} className="border-t border-border hover:bg-bg-secondary/50">
                  <td className="p-3">
                    <span className="bg-highlight text-accent text-xs font-bold px-2 py-1 rounded">#{i+1}</span>
                  </td>
                  <td className="p-3 font-medium text-ink">{h.district}</td>
                  <td className="p-3 text-ink-muted">{h.police_station}</td>
                  <td className="p-3">{h.crime_type}</td>
                  <td className="p-3 font-bold" style={{ color: h.crime_count > 50 ? "#ef4444" : h.crime_count > 20 ? "#f59e0b" : "#3b82f6" }}>
                    {h.crime_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
