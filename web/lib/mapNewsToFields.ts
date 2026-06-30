import type { NewsItem } from "./types";
import type { TemplateFields } from "../components/creator/layerTemplates";

function formatMeta(news: NewsItem) {
  return [news.sourceName, news.publishedAt].filter(Boolean).join(" · ");
}

// Keeps each template intentionally short: a title plus at most one short
// meta/description line. Longer detail belongs in the post caption, not the
// image — extra context can always go on its own slide via "+ افزودن اسلاید".
export function mapNewsToFields(news: NewsItem, templateId: string): TemplateFields {
  const meta = formatMeta(news);

  switch (templateId) {
    case "news-sq":
      return { badge: "⚡ خبر فوری", title: news.title, meta };
    case "reels":
      return { title: news.title };
    case "photo-pt":
      return { cat: news.sourceName, title: news.title, loc: meta };
    case "loc-sq":
      return { name_fa: news.title, name_en: meta, desc: news.summary.slice(0, 60) };
    case "highlight":
      return { name: news.sourceName };
    case "blank":
      return { text: news.title };
    default:
      return { title: news.title };
  }
}
