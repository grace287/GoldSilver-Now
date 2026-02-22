import { fetchToday, fetchChangeRate, fetchHistory, getApiUrl } from "@/lib/api";
import type { PriceHistoryResponse } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TodaySummaryCard } from "@/components/TodaySummaryCard";
import { PriceCard } from "@/components/PriceCard";
import { PriceChart } from "@/components/PriceChart";
import { RefreshButton } from "@/components/RefreshButton";

export const revalidate = 0;

const emptyHistory = (metal: "gold" | "silver"): PriceHistoryResponse => ({ metal, items: [] });

export default async function Home() {
  let today = { gold: null, silver: null } as Awaited<ReturnType<typeof fetchToday>>;
  let changeRate = { gold: null, silver: null } as Awaited<ReturnType<typeof fetchChangeRate>>;
  let historyGold7: PriceHistoryResponse = emptyHistory("gold");
  let historyGold30: PriceHistoryResponse = emptyHistory("gold");
  let historySilver7: PriceHistoryResponse = emptyHistory("silver");
  let historySilver30: PriceHistoryResponse = emptyHistory("silver");
  let apiError: string | null = null;

  try {
    const [todayRes, changeRateRes, hg7, hg30, hs7, hs30] = await Promise.all([
      fetchToday(),
      fetchChangeRate(),
      fetchHistory("gold", 7),
      fetchHistory("gold", 30),
      fetchHistory("silver", 7),
      fetchHistory("silver", 30),
    ]);
    today = todayRes;
    changeRate = changeRateRes;
    historyGold7 = hg7;
    historyGold30 = hg30;
    historySilver7 = hs7;
    historySilver30 = hs30;
  } catch (e) {
    const message = e instanceof Error ? e.message : "API 요청 실패";
    apiError = message;
    console.error("API fetch error:", e);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {apiError && (
        <div
          className="mx-4 mt-4 p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm"
          role="alert"
        >
          <strong>시세 API에 연결할 수 없습니다.</strong>
          <p className="mt-1">{apiError}</p>
          <p className="mt-2 opacity-90">
            <code className="bg-black/10 dark:bg-white/10 px-1 rounded">NEXT_PUBLIC_API_URL</code>이
            백엔드 주소와 같은지 확인하고, 백엔드를 실행한 뒤 새로고침하세요. (현재: {getApiUrl()})
          </p>
        </div>
      )}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TodaySummaryCard
            gold={today.gold}
            silver={today.silver}
            changeGold={changeRate.gold ?? null}
            changeSilver={changeRate.silver ?? null}
          />
          <RefreshButton />
        </div>
        <PriceCard
          title="오늘의 금 시세"
          subtitle="금 1돈 (3.75g)"
          today={today.gold}
          changeRate={changeRate.gold ?? null}
        />
        <section className="space-y-1">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            지난 시세 (1주일 · 1개월 · 3개월 · 6개월 · 1년 · 3년 · 5년)
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            금액(원) 기준, 살 때·팔 때 색으로 구분. 마우스 오버 시 상세 표시. 크롤러를 주기적으로 실행하면 날짜별 데이터가 쌓입니다.
          </p>
        </section>
        <PriceChart
          metal="gold"
          items7={historyGold7.items}
          items30={historyGold30.items}
        />
        <PriceCard
          title="오늘의 은 시세"
          subtitle="은 1g 기준"
          today={today.silver}
          changeRate={changeRate.silver ?? null}
        />
        <PriceChart
          metal="silver"
          items7={historySilver7.items}
          items30={historySilver30.items}
        />
      </main>
      <Footer />
    </div>
  );
}
