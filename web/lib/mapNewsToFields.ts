import type { NewsItem } from "./types";
import type { TemplateFields } from "../components/creator/layerTemplates";

// Source is always KishEase — the external news source is cited in the
// article link, not on the visual output (which is published under our brand).
const BRAND = "KishEase · کیش ایز";

function metaLine(news: NewsItem) {
  return [BRAND, news.publishedAt].filter(Boolean).join(" · ");
}

export function mapNewsToFields(news: NewsItem, templateId: string): TemplateFields {
  const meta = metaLine(news);
  switch (templateId) {
    case "news-sq":
      return { badge: "● خبر فوری", title: news.title, meta };
    case "reels":
      return { handle: "@KishEase", title: news.title, sub: meta };
    case "photo-pt":
      return { cat: "📸 کیش ایز", title: news.title, loc: meta };
    case "loc-sq":
      return { name_fa: news.title, name_en: "@KishEase · KishEase.com", desc: news.summary.slice(0, 60) };
    case "highlight":
      return { name: "کیش ایز", icon: "🏝️" };
    case "blank":
      return { text: news.title };
    default:
      return { title: news.title };
  }
}
