"use client";

import type { PriceTodayItem } from "@/lib/api";
import type { ChangeRateItem } from "@/lib/api";

function formatPrice(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function ChangePill({ percent }: { percent: number }) {
  const up = percent >= 0;
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
        up
          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
          : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
      }`}
    >
      {up ? "▲" : "▼"} {up ? "+" : ""}{percent.toFixed(2)}%
    </span>
  );
}

interface TodaySummaryCardProps {
  gold: PriceTodayItem | null;
  silver: PriceTodayItem | null;
  changeGold: ChangeRateItem | null;
  changeSilver: ChangeRateItem | null;
}

export function TodaySummaryCard({
  gold,
  silver,
  changeGold,
  changeSilver,
}: TodaySummaryCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-4 py-3 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0" aria-hidden>🟡</span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">금 1돈</p>
            {gold ? (
              <p className="text-base sm:text-lg font-bold text-gold truncate">
                살 때 ₩{formatPrice(gold.buy_price)} · 팔 때 ₩{formatPrice(gold.sell_price)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        </div>
        {changeGold && (
          <div className="shrink-0">
            <ChangePill percent={changeGold.buy_change_percent} />
          </div>
        )}
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-4 py-3 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0" aria-hidden>⚪</span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">은 1g</p>
            {silver ? (
              <p className="text-base sm:text-lg font-bold text-gold truncate">
                ₩{formatPrice(silver.buy_price)}/g
              </p>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        </div>
        {changeSilver && (
          <div className="shrink-0">
            <ChangePill percent={changeSilver.buy_change_percent} />
          </div>
        )}
      </div>
    </div>
  );
}
