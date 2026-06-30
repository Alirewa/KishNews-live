"""Best-effort date parsing/formatting. Never raises — callers always get
either a usable value or None/the input unchanged."""
import re
from datetime import datetime, timedelta, timezone

import jdatetime

TEHRAN_TZ = timezone(timedelta(hours=3, minutes=30))

_FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
_AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"
_WESTERN_DIGITS = "0123456789"
_TO_WESTERN = {**{d: w for d, w in zip(_FA_DIGITS, _WESTERN_DIGITS)}, **{d: w for d, w in zip(_AR_DIGITS, _WESTERN_DIGITS)}}
_TO_FA = {w: d for d, w in zip(_FA_DIGITS, _WESTERN_DIGITS)}


def _to_western_digits(s: str) -> str:
    return "".join(_TO_WESTERN.get(ch, ch) for ch in s)


def to_fa_digits(s: str) -> str:
    return "".join(_TO_FA.get(ch, ch) for ch in s)


_JALALI_RE = re.compile(r"(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})(?:[^\d]+(\d{1,2}):(\d{2}))?")


def parse_any_date(raw):
    """Returns a timezone-aware datetime, or None if unparseable. Never raises."""
    if not raw or not isinstance(raw, str):
        return None
    raw = raw.strip()
    if not raw:
        return None

    normalized = _to_western_digits(raw)

    # ISO 8601 (handles sources that expose article:published_time / trafilatura dates)
    try:
        iso = normalized.replace("Z", "+00:00")
        dt = datetime.fromisoformat(iso)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        # Sanity check: ISO years line up with the Gregorian calendar (~2000+).
        if 2000 <= dt.year <= 2100:
            return dt
    except (ValueError, TypeError):
        pass

    # Jalali "YYYY/MM/DD - HH:MM" (the format most Iranian news sites display)
    m = _JALALI_RE.search(normalized)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        hh = int(m.group(4)) if m.group(4) else 0
        mm = int(m.group(5)) if m.group(5) else 0
        if 1300 <= y <= 1500 and 1 <= mo <= 12 and 1 <= d <= 31:
            try:
                jd = jdatetime.datetime(y, mo, d, hh, mm, tzinfo=TEHRAN_TZ)
                return jd.togregorian().replace(tzinfo=TEHRAN_TZ)
            except ValueError:
                return None

    return None


def to_jalali_display(dt: datetime) -> str:
    """Formats a tz-aware datetime as a Persian-digit Jalali string for display."""
    local = dt.astimezone(TEHRAN_TZ)
    j = jdatetime.datetime.fromgregorian(datetime=local.replace(tzinfo=None))
    return to_fa_digits(j.strftime("%Y/%m/%d - %H:%M"))
