import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardTitle } from "../common/Card";
import { getHotspots } from "../../lib/api";

// Karnataka's rough bounding box, used only to project lat/lng onto the SVG canvas.
const BOUNDS = { minLat: 11.5, maxLat: 18.5, minLng: 74.0, maxLng: 78.5 };

function project(lat, lng, width, height) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * width;
  const y = height - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * height;
  return { x, y };
}

export function HotspotMapCard({ delay = 0 }) {
  const { t } = useTranslation();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const width = 600;
  const height = 340;

  useEffect(() => {
    getHotspots(10)
      .then((rows) => setPoints(rows.filter((r) => r.lat && r.lng)))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !points.length) return null;

  const maxCount = Math.max(...points.map((p) => p.crime_count));

  return (
    <Card delay={delay}>
      <CardTitle eyebrow={t("hotspotMapCard.eyebrow")} title={t("hotspotMapCard.title")} />
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
        <rect x="0" y="0" width={width} height={height} rx="16" fill="#F6F5F2" />
        {points.map((p, i) => {
          const { x, y } = project(p.lat, p.lng, width, height);
          const r = 6 + (p.crime_count / maxCount) * 16;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#936562" opacity={0.16} />
              <circle cx={x} cy={y} r={r * 0.45} fill="#936562" opacity={0.85} />
              <title>{`${p.district} · ${p.crime_type} · ${p.crime_count} cases`}</title>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-2 mt-4">
        {points.slice(0, 6).map((p, i) => (
          <span
            key={i}
            className="text-[12px] bg-bg-secondary border border-border rounded-full px-3 py-1 text-ink-muted"
          >
            {p.district} · {p.crime_type} ({p.crime_count})
          </span>
        ))}
      </div>
    </Card>
  );
}
