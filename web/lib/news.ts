import type { NewsItem } from "./types";

const NEWS_URL =
  "https://raw.githubusercontent.com/Alirewa/KishNews-live/main/data/news.json";

// Always pulls the latest committed data.json straight from GitHub (not the local
// checkout), so the feed reflects whatever the hourly scraper Action has produced —
// regardless of whether this machine has pulled the latest commit.
export async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(NEWS_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch news.json: ${res.status}`);
  }
  return res.json();
}
