export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  sourceName: string;
  image: string | null;
  publishedAt: string | null;
  scrapedAt: string;
}
