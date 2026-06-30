import Link from "next/link";
import type { NewsItem } from "@/lib/types";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/creator?id=${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-app-border bg-app-card transition hover:border-turquoise"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-app-sb">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/image-proxy?url=${encodeURIComponent(item.image)}`}
            alt={item.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-app-muted text-sm">
            بدون تصویر
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs text-app-muted">
          <span className="rounded-full bg-app-sb px-2 py-1">{item.sourceName}</span>
          {item.publishedAt && <span>{item.publishedAt}</span>}
        </div>
        <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-app-text">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-app-muted">{item.summary}</p>
      </div>
    </Link>
  );
}
