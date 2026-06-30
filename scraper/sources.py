# Per-source configuration for the Kish news scraper.
#
# Two discovery modes:
#   - "rss":  feedparser reads entries directly (title/link/date/image already structured)
#   - "html": fetch `list_url`, collect <a href> whose absolute path matches `link_pattern`
#
# `encoding` overrides response decoding for legacy non-UTF-8 sites (e.g. classic ASP).
# `irna` is included for completeness but the site serves a Cloudflare JS-challenge page to
# plain HTTP clients, so it will reliably yield 0 items until a browser-based fetch is added.

SOURCES = [
    {
        "slug": "kish-news",
        "name": "خبرگزاری کیش",
        "discover": "html",
        "list_url": "https://news.kish.ir/",
        "link_pattern": r"^/fa/news/.+/\d+$",
    },
    {
        "slug": "iribnews",
        "name": "خبرگزاری صدا و سیما",
        "discover": "html",
        "list_url": "https://www.iribnews.ir/fa/kish",
        "link_pattern": r"^/fa/news/\d+/",
    },
    {
        "slug": "irna",
        "name": "ایرنا",
        "discover": "html",
        "list_url": "https://www.irna.ir/service/province/kish",
        "link_pattern": r"^/news/\d+/",
        "enabled": False,  # site returns a JS/Cloudflare challenge page to plain HTTP clients
    },
    {
        "slug": "sobhekish",
        "name": "صبح کیش",
        "discover": "html",
        "list_url": "https://sobhekish.ir/",
        "link_pattern": r"^/fa/[a-z\-]+/\d+-",
    },
    {
        "slug": "kishvandnews",
        "name": "کیشوند نیوز",
        "discover": "rss",
        "rss_url": "https://kishvandnews.ir/feed/",
    },
    {
        "slug": "eghtesad-kish",
        "name": "اقتصاد کیش",
        "discover": "html",
        "list_url": "https://eghtesad-kish.ir/",
        "link_pattern": r"news_item\.asp\?NewsID=\d+",
        "encoding": "windows-1256",
    },
    {
        "slug": "mehrnews",
        "name": "خبرگزاری مهر",
        "discover": "html",
        "list_url": "https://www.mehrnews.com/tag/%D8%AC%D8%B2%DB%8C%D8%B1%D9%87+%DA%A9%DB%8C%D8%B4",
        "link_pattern": r"^/news/\d+/",
    },
    {
        "slug": "andishekish",
        "name": "اندیشه کیش",
        "discover": "html",
        "list_url": "https://www.andishekish.ir/",
        "link_pattern": r"\?p=\d+$",
    },
    {
        "slug": "tasnim",
        "name": "خبرگزاری تسنیم",
        "discover": "html",
        "list_url": "https://tasnimnews.ir/fa/keyword/6932/%D8%A7%D8%AE%D8%A8%D8%A7%D8%B1-%DA%A9%DB%8C%D8%B4",
        "link_pattern": r"^/fa/news/\d+/\d+/\d+/\d+/",
    },
    {
        "slug": "khabaronline",
        "name": "خبرآنلاین",
        "discover": "html",
        "list_url": "https://www.khabaronline.ir/tag/%D8%AC%D8%B2%DB%8C%D8%B1%D9%87+%DA%A9%DB%8C%D8%B4",
        "link_pattern": r"^/(news|live)/\d+/",
    },
    # telewebion.ir/live/kish is a live-TV embed page, not an article feed — intentionally
    # excluded, there is nothing article-shaped to scrape there.
]
