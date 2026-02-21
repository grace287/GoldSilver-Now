const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export async function fetchToday(): Promise<PriceTodayResponse> {
  const res = await fetch(`${API_URL}/api/prices/today`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch today");
  return res.json();
}

export async function fetchHistory(
  metal: "gold" | "silver",
  days: number
): Promise<PriceHistoryResponse> {
  const res = await fetch(
    `${API_URL}/api/prices/history?metal=${metal}&days=${days}`,
    { next: { revalidate: 120 } }
  );
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchChangeRate(): Promise<ChangeRateResponse> {
  const res = await fetch(`${API_URL}/api/prices/change-rate`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch change rate");
  return res.json();
}
