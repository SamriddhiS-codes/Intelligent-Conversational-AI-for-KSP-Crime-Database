import { useEffect, useState } from "react";
import { Card, CardTitle } from "../common/Card";
import { getNetwork } from "../../lib/api";

const WIDTH = 640;
const HEIGHT = 380;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };


function layout(nodes) {
  const crimeNodes = nodes.filter((n) => n.type === "crime");
  const personNodes = nodes.filter((n) => n.type === "person");
  const positioned = {};

  crimeNodes.forEach((n, i) => {
    const angle = (i / Math.max(crimeNodes.length, 1)) * 2 * Math.PI;
    positioned[n.id] = {
      ...n,
      x: CENTER.x + Math.cos(angle) * 90,
      y: CENTER.y + Math.sin(angle) * 90,
    };
  });

  personNodes.forEach((n, i) => {
    const angle = (i / Math.max(personNodes.length, 1)) * 2 * Math.PI;
    positioned[n.id] = {
      ...n,
      x: CENTER.x + Math.cos(angle) * 250,
      y: CENTER.y + Math.sin(angle) * 165,
    };
  });

  return positioned;
}

export function CrimeNetworkCard({ crimeType, district, delay = 0 }) {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetwork(crimeType, district)
      .then((data) => setGraph(data))
      .catch(() => setGraph(null))
      .finally(() => setLoading(false));
  }, [crimeType, district]);

  if (loading || !graph?.nodes?.length) return null;

  const positioned = layout(graph.nodes);
  const maxWeight = Math.max(...graph.edges.map((e) => e.weight || 1), 1);

  return (
    <Card delay={delay}>
      <CardTitle eyebrow="Criminal Network Explorer" title="Accused ↔ crime-type connections" />
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-80">
        {graph.edges.map((e, i) => {
          const from = positioned[e.from];
          const to = positioned[e.to];
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#DBDFAC"
              strokeWidth={1 + (e.weight / maxWeight) * 3}
              opacity={0.7}
            />
          );
        })}
        {Object.values(positioned).map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.type === "crime" ? 10 : 6}
              fill={n.type === "crime" ? "#936562" : "#3C2A36"}
            />
            <text
              x={n.x}
              y={n.y - (n.type === "crime" ? 16 : 12)}
              textAnchor="middle"
              fontSize="10"
              fill="#7A7474"
            >
              {String(n.label).slice(0, 16)}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-5 mt-3 text-[12px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Crime type
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ink inline-block" /> Accused person
        </span>
      </div>
    </Card>
  );
}
