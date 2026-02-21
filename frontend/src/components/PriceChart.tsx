"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PriceHistoryItem } from "@/lib/api";

interface PriceChartProps {
  metal: "gold" | "silver";
  items7: PriceHistoryItem[];
  items30: PriceHistoryItem[];
}

export function PriceChart({ metal, items7, items30 }: PriceChartProps) {
  const [days, setDays] = useState<7 | 30>(7);
  const items = days === 7 ? items7 : items30;
  const data = items.map((i) => ({
    date: i.date.slice(5),
    buy: Number(i.buy_price),
    sell: Number(i.sell_price),
  }));

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {metal === "gold" ? "금" : "은"} 시세 추이
        </h2>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            type="button"
            onClick={() => setDays(7)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              days === 7
                ? "bg-gold text-gray-900"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            7일
          </button>
          <button
            type="button"
            onClick={() => setDays(30)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              days === 30
                ? "bg-gold text-gray-900"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            30일
          </button>
        </div>
      </div>
      <div className="h-64 sm:h-72">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            기간 내 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="stroke-gray-500 dark:stroke-gray-400"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                className="stroke-gray-500 dark:stroke-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tw-bg-opacity)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number, name: string) => [
                  `₩${new Intl.NumberFormat("ko-KR").format(value)}`,
                  name,
                ]}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="buy"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={false}
                name="매수가"
              />
              <Line
                type="monotone"
                dataKey="sell"
                stroke="#B8960C"
                strokeWidth={2}
                dot={false}
                name="매도가"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
