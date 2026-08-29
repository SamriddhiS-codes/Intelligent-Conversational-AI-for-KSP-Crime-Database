import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardTitle } from "../common/Card";
import { getTrends } from "../../lib/api";

export function TimelineCard({ district, delay = 0 }) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTrends(district)
      .then((rows) => {
        if (!active) return;
        const byMonth = {};
        rows.forEach((r) => {
          const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
          byMonth[key] = (byMonth[key] || 0) + r.count;
        });
        setData(
          Object.entries(byMonth)
            .sort(([a], [b]) => (a > b ? 1 : -1))
            .map(([month, count]) => ({ month, count }))
        );
      })
      .catch(() => setData([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [district]);

  if (loading || !data.length) return null;

  return (
    <Card delay={delay}>
      <CardTitle
        eyebrow={t("timelineCard.eyebrow")}
        title={
          district
            ? t("timelineCard.monthlyTrendDistrict", { district })
            : t("timelineCard.monthlyTrend")
        }
      />
      <div className="h-56 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E9E7E3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#7A7474" }}
              axisLine={{ stroke: "#E9E7E3" }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#7A7474" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E9E7E3",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#936562"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#936562" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
