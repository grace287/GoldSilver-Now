"use client";

import type { PriceTodayItem } from "@/lib/api";
import type { ChangeRateItem } from "@/lib/api";

function formatPrice(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
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
    <section
      className="rounded-2xl border-l-4 border-gold bg-amber-50/80 dark:bg-amber-950/20 dark:border-gold shadow-md overflow-hidden"
      aria-label="오늘의 시세 요약"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 sm:gap-0">
        {/* 왼쪽: 오늘 날짜 */}
        <div className="flex sm:flex-col justify-center sm:justify-center items-center sm:items-center py-3 sm:py-6 px-4 sm:px-6 bg-white/60 dark:bg-gray-800/40 sm:min-w-[140px] border-b sm:border-b-0 sm:border-r border-amber-200/60 dark:border-amber-800/40">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today</p>
          <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mt-0.5 sm:mt-2">
            {formatTodayDate()}
          </p>
        </div>
        {/* 오른쪽: 금·은 카드 */}
        <div className="flex-1 grid grid-cols-2 gap-3 p-4 sm:p-5">
          <div className="flex flex-col justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">금 1돈 · 살 때</p>
            {gold ? (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gold tracking-tight">
                  ₩{formatPrice(gold.buy_price)}
                </p>
                {changeGold && (
                  <div className="mt-2">
                    <ChangePill percent={changeGold.buy_change_percent} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">은 1g · 살 때</p>
            {silver ? (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gold tracking-tight">
                  ₩{formatPrice(silver.buy_price)}
                </p>
                {changeSilver && (
                  <div className="mt-2">
                    <ChangePill percent={changeSilver.buy_change_percent} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
