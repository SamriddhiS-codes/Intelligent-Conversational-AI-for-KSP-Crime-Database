import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardTitle } from "../common/Card";
import { getCrimeTypes } from "../../lib/api";

const COLORS = ["#936562", "#DBDFAC", "#3C2A36", "#C9B8B6", "#A9AE84", "#7A7474"];

export function DistrictBreakdownCard({ delay = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCrimeTypes()
      .then((rows) => setData(rows.slice(0, 6)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data.length) return null;

  return (
    <Card delay={delay}>
      <CardTitle eyebrow="District & Category Breakdown" title="Crime type distribution" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="crime_type"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E9E7E3",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#7A7474" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
