"""Hourly Kish news scraper.

Discovers article URLs per source (RSS or HTML listing), extracts
title/content/image/date with trafilatura + a generic image heuristic,
merges into data/news.json (deduped by URL, capped, newest first).
"""
import hashlib
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import feedparser
import requests
import trafilatura
from bs4 import BeautifulSoup

from dates import parse_any_date, to_jalali_display
from sources import SOURCES

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "news.json"
MAX_ITEMS = 400
PER_SOURCE_LIMIT = 30
REQUEST_TIMEOUT = 15
MAX_AGE_HOURS = 48
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; KishNewsBot/1.0; +https://github.com/Alirewa/KishNews-live)"}

IMAGE_SKIP_HINTS = ("logo", "icon", "favicon", "sprite", "avatar", "spinner", ".svg")

# At least one of these must appear in the title or content for an article to be
# considered Kish-related (listing/tag pages occasionally surface unrelated items).
KEYWORDS = ("کیش",)


def url_id(url):
    return hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]


def _is_skippable(src):
    low = src.lower()
    return any(hint in low for hint in IMAGE_SKIP_HINTS)


def extract_image(soup, base_url):
    og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
    if og and og.get("content") and not _is_skippable(og["content"]):
        return urljoin(base_url, og["content"])
    tw = soup.find("meta", attrs={"name": "twitter:image"})
    if tw and tw.get("content") and not _is_skippable(tw["content"]):
        return urljoin(base_url, tw["content"])
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if not src or _is_skippable(src):
            continue
        return urljoin(base_url, src)
    return None


def fetch(url, encoding=None):
    r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    if encoding:
        r.encoding = encoding
    return r.text


def discover_html(source):
    list_url = source["list_url"]
    html = fetch(list_url, source.get("encoding"))
    soup = BeautifulSoup(html, "html.parser")
    domain = urlparse(list_url).netloc.replace("www.", "")
    pattern = re.compile(source["link_pattern"])
    found = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = urljoin(list_url, a["href"])
        p = urlparse(href)
        if p.netloc.replace("www.", "") != domain:
            continue
        target = p.path + (("?" + p.query) if p.query else "")
        if not pattern.search(target):
            continue
        clean_url = href.split("#")[0]
        if clean_url in seen:
            continue
        seen.add(clean_url)
        found.append(clean_url)
    return found[:PER_SOURCE_LIMIT]


def discover_rss(source):
    feed = feedparser.parse(source["rss_url"])
    urls = []
    for entry in feed.entries[:PER_SOURCE_LIMIT]:
        link = entry.get("link")
        if link:
            urls.append(link)
    return urls


def extract_article(url, source, encoding=None):
    try:
        html = fetch(url, encoding)
    except requests.RequestException as exc:
        print(f"  ! fetch failed: {url} ({exc})", file=sys.stderr)
        return None

    soup = BeautifulSoup(html, "html.parser")

    title = None
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    if not title:
        h1 = soup.find("h1")
        if h1 and h1.get_text(strip=True):
            title = h1.get_text(strip=True)
    if not title and soup.title and soup.title.get_text(strip=True):
        title = re.split(r"\s*[|\-–]\s*", soup.title.get_text(strip=True))[0].strip()
    if not title:
        return None

    extracted = None
    try:
        raw = trafilatura.extract(html, url=url, output_format="json", with_metadata=True)
        if raw:
            extracted = json.loads(raw)
    except Exception as exc:  # trafilatura can raise on malformed legacy HTML
        print(f"  ! trafilatura failed: {url} ({exc})", file=sys.stderr)

    content = (extracted or {}).get("text") or ""
    if not content:
        return None

    if not any(kw in title or kw in content for kw in KEYWORDS):
        return None

    summary = content.strip().replace("\n", " ")[:280]

    raw_date = None
    date_meta = soup.find("meta", property="article:published_time")
    if date_meta and date_meta.get("content"):
        raw_date = date_meta["content"]
    elif extracted and extracted.get("date"):
        raw_date = extracted["date"]

    scraped_at = datetime.now(timezone.utc)
    # Best-effort parse; if the source's date can't be understood, fall back to
    # "now" so every article still gets a sensible, always-Jalali display date
    # and a usable timestamp for the 48h freshness filter — never a hard error.
    effective_dt = parse_any_date(raw_date) or scraped_at

    image = extract_image(soup, url)

    return {
        "id": url_id(url),
        "title": title,
        "summary": summary,
        "content": content.strip(),
        "url": url,
        "source": source["slug"],
        "sourceName": source["name"],
        "image": image,
        "publishedAt": to_jalali_display(effective_dt),
        "publishedAtIso": effective_dt.isoformat(),
        "scrapedAt": scraped_at.isoformat(),
    }


def load_existing():
    if not DATA_FILE.exists():
        return []
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def effective_dt(item):
    """Best-effort reliable timestamp for an item, used for sorting and the
    48h freshness filter. Falls back through publishedAtIso -> scrapedAt ->
    parsing the (possibly legacy/Jalali) publishedAt string -> None."""
    for key in ("publishedAtIso", "scrapedAt"):
        dt = parse_any_date(item.get(key))
        if dt:
            return dt
    return parse_any_date(item.get("publishedAt"))


def main():
    existing = load_existing()
    by_url = {item["url"]: item for item in existing}

    for source in SOURCES:
        if not source.get("enabled", True):
            continue
        slug = source["slug"]
        print(f"== {slug} ==")
        try:
            if source["discover"] == "rss":
                urls = discover_rss(source)
            else:
                urls = discover_html(source)
        except Exception as exc:
            print(f"  ! discovery failed for {slug}: {exc}", file=sys.stderr)
            continue

        print(f"  discovered {len(urls)} candidate links")
        new_count = 0
        for url in urls:
            if url in by_url:
                continue
            try:
                article = extract_article(url, source, source.get("encoding"))
            except Exception as exc:  # a single bad article must never abort the run
                print(f"  ! extraction crashed: {url} ({exc})", file=sys.stderr)
                article = None
            if article:
                by_url[url] = article
                new_count += 1
        print(f"  added {new_count} new articles")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS)
    fresh = []
    for item in by_url.values():
        dt = effective_dt(item)
        # No parseable date at all (shouldn't normally happen) is kept rather
        # than silently dropped — visibility beats a hard filter here.
        if dt is None or dt >= cutoff:
            fresh.append(item)

    merged = sorted(fresh, key=lambda i: effective_dt(i) or datetime.min.replace(tzinfo=timezone.utc), reverse=True)[:MAX_ITEMS]

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(
        json.dumps(merged, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nWrote {len(merged)} items to {DATA_FILE}")


if __name__ == "__main__":
    main()
