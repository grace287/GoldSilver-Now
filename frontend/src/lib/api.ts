/** 프론트와 백엔드 포트가 같아야 함 (예: 8080). .env의 NEXT_PUBLIC_API_URL 확인 */
export const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const API_URL = getApiUrl();

export interface PriceTodayItem {
  metal: "gold" | "silver";
  buy_price: number;
  sell_price: number;
  updated_at: string;
}

export interface PriceTodayResponse {
  gold: PriceTodayItem | null;
  silver: PriceTodayItem | null;
}

export interface PriceHistoryItem {
  date: string;
  buy_price: number;
  sell_price: number;
}

export interface PriceHistoryResponse {
  metal: "gold" | "silver";
  items: PriceHistoryItem[];
}

export interface ChangeRateItem {
  metal: "gold" | "silver";
  buy_change_percent: number;
  sell_change_percent: number;
  prev_buy: number;
  prev_sell: number;
  current_buy: number;
  current_sell: number;
}

export interface ChangeRateResponse {
  gold: ChangeRateItem | null;
  silver: ChangeRateItem | null;
}

/** 캐시 없이 매번 API에서 최신 데이터 가져오기 (크롤링 반영 빠르게) */
const noStore = { cache: "no-store" as RequestCache };

export async function fetchToday(): Promise<PriceTodayResponse> {
  const res = await fetch(`${API_URL}/api/prices/today`, noStore);
  if (!res.ok) throw new Error(`Failed to fetch today: ${res.status}`);
  return res.json();
}

export async function fetchHistory(
  metal: "gold" | "silver",
  days: number
): Promise<PriceHistoryResponse> {
  const res = await fetch(
    `${API_URL}/api/prices/history?metal=${metal}&days=${days}`,
    noStore
  );
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
  return res.json();
}

export async function fetchChangeRate(): Promise<ChangeRateResponse> {
  const res = await fetch(`${API_URL}/api/prices/change-rate`, noStore);
  if (!res.ok) throw new Error(`Failed to fetch change rate: ${res.status}`);
  return res.json();
}
