"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
      title="최신 시세로 새로고침"
    >
      {loading ? "갱신 중…" : "🔄 새로고침"}
    </button>
  );
}
