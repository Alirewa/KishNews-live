# KishNews-live

Hourly scraper for Kish Island news, plus **KishEase** — a Next.js post/story creator that turns the latest scraped articles into ready-to-export Instagram content.

## Structure

- `scraper/` — Python scraper (`scrape.py`). Discovers article URLs per source (RSS or HTML listing) and extracts title/content/image/date with `trafilatura`. Writes the merged, deduped result to `data/news.json`.
- `data/news.json` — rolling list of the latest ~400 articles, updated hourly by GitHub Actions.
- `.github/workflows/scrape.yml` — runs the scraper every hour (`workflow_dispatch` also available for manual runs) and commits changes.
- `web/` — Next.js + TypeScript app (KishEase Post Creator). Fetches `data/news.json` straight from GitHub, lets you pick an article and auto-fill an Instagram post/story/reel-cover template, then export PNG/JPEG.

## Running the scraper locally

```bash
pip install -r scraper/requirements.txt
python scraper/scrape.py
```

## Running the web app locally

```bash
cd web
npm install
npm run dev
```

## Notes

- `irna.ir` is listed in `scraper/sources.py` but disabled — the site serves a Cloudflare JS challenge page to plain HTTP clients, so it can't be scraped without a headless browser.
- `telewebion.ir/live/kish` is a live-TV embed, not an article feed, so it's intentionally excluded from the scraper.
