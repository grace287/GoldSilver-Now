"use client";

import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PriceHistoryItem } from "@/lib/api";
import { fetchHistory } from "@/lib/api";

const PERIODS: { days: number; label: string }[] = [
  { days: 7, label: "1주일" },
  { days: 30, label: "1개월" },
  { days: 90, label: "3개월" },
  { days: 180, label: "6개월" },
  { days: 365, label: "1년" },
  { days: 1095, label: "3년" },
  { days: 1825, label: "5년" },
];

function formatWon(value: number): string {
  if (value >= 10000) {
    return `₩${(value / 10000).toFixed(1)}만`;
  }
  return `₩${new Intl.NumberFormat("ko-KR").format(value)}`;
}

function formatWonFull(value: number): string {
  return `₩${new Intl.NumberFormat("ko-KR").format(value)}`;
}

interface PriceChartProps {
  metal: "gold" | "silver";
  items7: PriceHistoryItem[];
  items30: PriceHistoryItem[];
}

export function PriceChart({ metal, items7, items30 }: PriceChartProps) {
  const [currentDays, setCurrentDays] = useState(7);
  const [extraItems, setExtraItems] = useState<Record<number, PriceHistoryItem[]>>({});
  const [loading, setLoading] = useState(false);

  const getItems = useCallback(
    (days: number): PriceHistoryItem[] => {
      if (days === 7) return items7;
      if (days === 30) return items30;
      return extraItems[days] ?? [];
    },
    [items7, items30, extraItems]
  );

  const items = getItems(currentDays);
  const data = items.map((i) => ({
    date: i.date,
    dateShort: i.date.slice(5),
    buy: Number(i.buy_price),
    sell: Number(i.sell_price),
  }));

  const handlePeriodClick = async (days: number) => {
    setCurrentDays(days);
    if (days !== 7 && days !== 30 && !extraItems[days]) {
      setLoading(true);
      try {
        const res = await fetchHistory(metal, days);
        setExtraItems((prev) => ({ ...prev, [days]: res.items }));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {metal === "gold" ? "금" : "은"} 시세 추이
        </h2>
        <div className="flex flex-wrap gap-1">
          {PERIODS.map(({ days, label }) => (
            <button
              key={days}
              type="button"
              onClick={() => handlePeriodClick(days)}
              disabled={loading}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentDays === days
                  ? "bg-gold text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 sm:h-72">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            불러오는 중…
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            기간 내 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
              <XAxis
                dataKey="dateShort"
                tick={{ fontSize: 11 }}
                className="stroke-gray-500 dark:stroke-gray-400"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatWon(v)}
                className="stroke-gray-500 dark:stroke-gray-400"
                width={56}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length || !label) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg px-3 py-2 text-sm">
                      <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                        {row.date}
                      </p>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: "#2563eb" }}
                          />
                          살 때: <span className="font-semibold">{formatWonFull(row.buy)}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: "#D4AF37" }}
                          />
                          팔 때: <span className="font-semibold">{formatWonFull(row.sell)}</span>
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (value === "buy" ? "살 때" : "팔 때")}
              />
              <Line
                type="monotone"
                dataKey="buy"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="buy"
              />
              <Line
                type="monotone"
                dataKey="sell"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={false}
                name="sell"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
