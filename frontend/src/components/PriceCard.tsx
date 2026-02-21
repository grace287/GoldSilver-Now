"use client";

import type { PriceTodayItem } from "@/lib/api";
import type { ChangeRateItem } from "@/lib/api";

function formatPrice(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "";
  }
}

function ChangeBadge({ percent }: { percent: number }) {
  const up = percent >= 0;
  return (
    <span
      className={`inline-flex items-center text-sm font-medium ${
        up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      {up ? "▲" : "▼"} {up ? "+" : ""}{percent.toFixed(2)}%
    </span>
  );
}

interface PriceCardProps {
  title: string;
  subtitle?: string;
  today: PriceTodayItem | null;
  changeRate: ChangeRateItem | null;
  /** silver는 단일 가격만 표시할 때 (buy=sell) */
  singlePriceLabel?: string;
}

export function PriceCard({
  title,
  subtitle,
  today,
  changeRate,
  singlePriceLabel,
}: PriceCardProps) {
  if (!today) {
    return (
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">시세 데이터가 없습니다.</p>
      </section>
    );
  }

  const isSilver = today.metal === "silver";
  const showSingle = isSilver && singlePriceLabel;

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
      <div className="mt-4 space-y-3">
        {showSingle ? (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-gold">
              ₩{formatPrice(today.buy_price)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{singlePriceLabel}</span>
            {changeRate && (
              <ChangeBadge percent={changeRate.buy_change_percent} />
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-gray-600 dark:text-gray-300">살 때</span>
              <span className="text-xl sm:text-2xl font-bold text-gold">
                ₩{formatPrice(today.buy_price)}
              </span>
              {changeRate && (
                <ChangeBadge percent={changeRate.buy_change_percent} />
              )}
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-gray-600 dark:text-gray-300">팔 때</span>
              <span className="text-xl sm:text-2xl font-bold text-gold">
                ₩{formatPrice(today.sell_price)}
              </span>
              {changeRate && (
                <ChangeBadge percent={changeRate.sell_change_percent} />
              )}
            </div>
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        기준 시각: {formatTime(today.updated_at)} (KST)
      </p>
    </section>
  );
}
