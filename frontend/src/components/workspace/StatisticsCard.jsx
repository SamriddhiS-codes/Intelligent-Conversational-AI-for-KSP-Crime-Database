import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardTitle } from "../common/Card";

export function StatisticsCard({ rows, delay = 0 }) {
  if (!rows?.length) return null;

  const keys = Object.keys(rows[0]);
  const labelKey =
    keys.find((k) => typeof rows[0][k] === "string") || keys[0];
  const valueKey =
    keys.find((k) => typeof rows[0][k] === "number" && k !== labelKey) ||
    keys[1] ||
    keys[0];

  const chartData = rows.slice(0, 12).map((r) => ({
    name: String(r[labelKey]).slice(0, 18),
    value: Number(r[valueKey]) || 0,
  }));

  return (
    <Card delay={delay}>
      <CardTitle eyebrow="Statistics" title={`By ${labelKey.replace(/_/g, " ")}`} />
      <div className="h-56 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E9E7E3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#7A7474" }}
              axisLine={{ stroke: "#E9E7E3" }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: "#7A7474" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E9E7E3",
                borderRadius: 12,
                fontSize: 12,
              }}
              cursor={{ fill: "#DBDFAC", opacity: 0.25 }}
            />
            <Bar dataKey="value" fill="#936562" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
