import { fetchToday, fetchChangeRate, fetchHistory } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceCard } from "@/components/PriceCard";
import { PriceChart } from "@/components/PriceChart";

export const revalidate = 60;

export default async function Home() {
  let today = { gold: null, silver: null } as Awaited<ReturnType<typeof fetchToday>>;
  let changeRate = { gold: null, silver: null } as Awaited<ReturnType<typeof fetchChangeRate>>;
  let historyGold7 = { metal: "gold" as const, items: [] };
  let historyGold30 = { metal: "gold" as const, items: [] };
  let historySilver7 = { metal: "silver" as const, items: [] };
  let historySilver30 = { metal: "silver" as const, items: [] };

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
    console.error("API fetch error:", e);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
        <PriceCard
          title="오늘의 금 시세"
          subtitle="금 1돈 (3.75g)"
          today={today.gold}
          changeRate={changeRate.gold ?? null}
        />
        <PriceChart
          metal="gold"
          items7={historyGold7.items}
          items30={historyGold30.items}
        />
        <PriceCard
          title="오늘의 은 시세"
          subtitle="은 시세"
          today={today.silver}
          changeRate={changeRate.silver ?? null}
          singlePriceLabel="/ 1g"
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
