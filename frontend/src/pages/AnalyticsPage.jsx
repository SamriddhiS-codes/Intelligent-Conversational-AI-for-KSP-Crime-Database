import { useEffect, useState } from "react";
import { getByDistrict, getCrimeTypes, getTrends } from "../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];

export function AnalyticsPage() {
  const [districts, setDistricts] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getByDistrict(), getCrimeTypes(), getTrends()])
      .then(([d, c, t]) => {
        setDistricts(d.slice(0, 10));
        setCrimeTypes(c.slice(0, 7));
        const grouped = {};
        t.forEach(row => {
          const key = `${row.year}-${String(row.month).padStart(2,"0")}`;
          if (!grouped[key]) grouped[key] = { period: key };
          grouped[key][row.crime_type] = (grouped[key][row.crime_type] || 0) + row.count;
        });
        setTrends(Object.values(grouped).sort((a,b) => a.period.localeCompare(b.period)).slice(-18));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topCrimeTypes = [...new Set(trends.flatMap(t => Object.keys(t).filter(k => k !== "period")))].slice(0, 4);

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-muted">Loading analytics...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Analytics</h1>
      <p className="text-ink-muted text-sm mb-8">Crime trends and district comparisons across Karnataka</p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-sm font-semibold text-ink mb-4">Crime Type Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={crimeTypes} dataKey="count" nameKey="crime_type" cx="50%" cy="50%" outerRadius={80}>
                {crimeTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-sm font-semibold text-ink mb-4">Top Districts by Crime Count</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={districts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border mb-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Crime Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={2} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {topCrimeTypes.map((ct, i) => (
              <Line key={ct} type="monotone" dataKey={ct} stroke={COLORS[i]} dot={false} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-ink mb-4">District Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary">
                {["District","Total","High Severity","Open Cases","Avg Loss (₹)"].map(h => (
                  <th key={h} className="text-left p-3 text-ink-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districts.map((d, i) => (
                <tr key={i} className="border-t border-border hover:bg-bg-secondary/50">
                  <td className="p-3 font-medium text-ink">{d.district}</td>
                  <td className="p-3">{d.total?.toLocaleString()}</td>
                  <td className="p-3 text-red-500 font-semibold">{d.high_severity}</td>
                  <td className="p-3 text-amber-500">{d.open_cases}</td>
                  <td className="p-3">₹{Number(d.avg_property_loss || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
