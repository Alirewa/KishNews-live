"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { fetchNews } from "@/lib/news";
import { NewsCard } from "./NewsCard";

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNews();
      setItems(data);
    } catch {
      setError("بارگذاری اخبار از گیت‌هاب ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = query
    ? items.filter(
        (i) => i.title.includes(query) || i.sourceName.includes(query) || i.summary.includes(query)
      )
    : items;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-app-text">Kish Ease · آخرین اخبار کیش</h1>
          <p className="text-sm text-app-muted">
            {loading ? "در حال بارگذاری..." : `${filtered.length} خبر`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در عنوان یا منبع..."
            className="rounded-lg border border-app-border bg-app-card px-3 py-2 text-sm text-app-text outline-none focus:border-turquoise"
          />
          <button
            onClick={load}
            className="rounded-lg bg-turquoise px-4 py-2 text-sm font-bold text-deep-ocean transition hover:opacity-85"
          >
            بروزرسانی
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {!loading && filtered.length === 0 && !error && (
        <p className="text-center text-app-muted">خبری یافت نشد.</p>
      )}
    </div>
  );
}
