export type TemplateFields = Record<string, string>;

export interface TextLayer {
  id: string;
  fieldId: string;
  label: string;
  defaultVal: string;
  big?: boolean;
  x: number;
  y: number;
  w: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "right" | "left" | "center";
  pill?: { bg: string; color: string };
  letterSpacing?: number;
  lineHeight?: number;
}

export interface ConfigField {
  id: string;
  label: string;
  defaultVal: string;
  type: "color";
}

export interface Template {
  id: string;
  cat: string;
  name: string;
  icon: string;
  w: number;
  h: number;
  layers: TextLayer[];
  configFields?: ConfigField[];
  chrome: (fields: TemplateFields, bg: string | null, op: number) => string;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export const TEMPLATES: Template[] = [
  // ── پست ۱:۱ خبر فوری ───────────────────────────────────────────────────
  {
    id: "news-sq",
    cat: "پست ۱:۱  (1080×1080)",
    name: "خبر فوری",
    icon: "🔴",
    w: 1080,
    h: 1080,
    layers: [
      {
        id: "badge",
        fieldId: "badge",
        label: "تگ رویداد",
        defaultVal: "● خبر فوری",
        x: 7.4,
        y: 8,
        w: 52,
        fontSize: 26,
        fontWeight: 800,
        color: "#fff",
        align: "right",
        // red background, white dot reads as a live indicator
        pill: { bg: "#D32F2F", color: "#fff" },
      },
      {
        id: "title",
        fieldId: "title",
        label: "عنوان (کوتاه و جذاب)",
        defaultVal: "جشنواره موسیقی کیش این شهریور برگزار می‌شود",
        big: true,
        x: 7.4,
        y: 36,
        w: 85,
        fontSize: 58,
        fontWeight: 900,
        color: "#fff",
        align: "right",
        lineHeight: 1.4,
      },
      {
        id: "meta",
        fieldId: "meta",
        label: "منبع / تاریخ",
        defaultVal: "KishEase · کیش ایز",
        x: 7.4,
        y: 87,
        w: 85,
        fontSize: 26,
        fontWeight: 500,
        color: "#2EC4D9",
        align: "right",
        letterSpacing: 1,
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg
        ? `background:url(${bg}) center/cover no-repeat`
        : "background:linear-gradient(155deg,#0B3B5C,#0D2840)";
      const ovl = bg
        ? `<div style="position:absolute;inset:0;background:linear-gradient(155deg,rgba(11,59,92,${op}),rgba(13,40,64,${clamp(op + 0.15)}))"></div>`
        : "";
      // stripe changed to red to match the new badge
      return `<div style="${bgS};position:absolute;inset:0"></div>${ovl}
      <div style="position:absolute;top:0;right:0;width:10px;height:100%;background:#D32F2F"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.5))"></div>`;
    },
  },

  // ── معرفی مکان ۱:۱ ────────────────────────────────────────────────────
  {
    id: "loc-sq",
    cat: "پست ۱:۱  (1080×1080)",
    name: "معرفی مکان",
    icon: "📍",
    w: 1080,
    h: 1080,
    layers: [
      {
        id: "name_fa",
        fieldId: "name_fa",
        label: "نام مکان (فارسی)",
        defaultVal: "پارک ساحلی المپیک",
        x: 7,
        y: 65,
        w: 86,
        fontSize: 62,
        fontWeight: 900,
        color: "#fff",
        align: "right",
        lineHeight: 1.3,
      },
      {
        id: "name_en",
        fieldId: "name_en",
        label: "نام مکان (انگلیسی)",
        defaultVal: "Olympic Coastal Park · Kish",
        x: 7,
        y: 78,
        w: 86,
        fontSize: 24,
        fontWeight: 300,
        color: "#A8E6EF",
        align: "right",
        letterSpacing: 1,
      },
      {
        id: "desc",
        fieldId: "desc",
        label: "توضیح (یک خط)",
        defaultVal: "چشم‌انداز خیره‌کننده خلیج فارس",
        x: 7,
        y: 87,
        w: 86,
        fontSize: 24,
        fontWeight: 400,
        color: "rgba(255,255,255,.75)",
        align: "right",
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg
        ? `background:url(${bg}) center/cover no-repeat`
        : "background:linear-gradient(160deg,#2EC4D9,#1A7BA0,#0B3B5C)";
      return `<div style="${bgS};position:absolute;inset:0"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(11,59,92,${clamp(op + 0.2)}) 100%)"></div>
      <div style="position:absolute;top:28px;right:28px;width:64px;height:64px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;border:1px solid rgba(255,255,255,.25)">📍</div>
      <div style="position:absolute;bottom:32px;left:28px;font-family:'Pelak',sans-serif;font-size:20px;font-weight:300;color:rgba(255,255,255,.3);letter-spacing:3px">@KishEase</div>`;
    },
  },

  // ── پست عکسی ۴:۵ ──────────────────────────────────────────────────────
  {
    id: "photo-pt",
    cat: "پست ۴:۵  (1080×1350)",
    name: "پست عکسی",
    icon: "📷",
    w: 1080,
    h: 1350,
    layers: [
      {
        id: "cat",
        fieldId: "cat",
        label: "دسته / تگ",
        defaultVal: "📸 طبیعت",
        x: 58,
        y: 4,
        w: 35,
        fontSize: 22,
        fontWeight: 600,
        color: "#fff",
        align: "right",
        pill: { bg: "rgba(255,255,255,.15)", color: "#fff" },
      },
      {
        id: "title",
        fieldId: "title",
        label: "عنوان (کوتاه و جذاب)",
        defaultVal: "غروب آفتاب در ساحل شمالی کیش",
        big: true,
        x: 6.7,
        y: 73,
        w: 86,
        fontSize: 54,
        fontWeight: 900,
        color: "#fff",
        align: "right",
        lineHeight: 1.4,
      },
      {
        id: "loc",
        fieldId: "loc",
        label: "منبع / موقعیت",
        defaultVal: "KishEase · کیش ایز",
        x: 6.7,
        y: 90,
        w: 70,
        fontSize: 24,
        fontWeight: 500,
        color: "#2EC4D9",
        align: "right",
        letterSpacing: 1,
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg
        ? `background:url(${bg}) center/cover no-repeat`
        : "background:linear-gradient(160deg,#164E70,#0B3B5C)";
      return `<div style="${bgS};position:absolute;inset:0"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,59,92,.25) 0%,transparent 30%,rgba(11,59,92,${clamp(op + 0.15)}) 100%)"></div>`;
    },
  },

  // ── کاور ریلز ۹:۱۶ ────────────────────────────────────────────────────
  {
    id: "reels",
    cat: "ریلز / استوری ۹:۱۶  (1080×1920)",
    name: "کاور ریلز",
    icon: "🎬",
    w: 1080,
    h: 1920,
    layers: [
      {
        // @KishEase handle centered at top — inside safe zone (below IG UI chrome ~220px)
        id: "handle",
        fieldId: "handle",
        label: "ایدی پیج (بالا)",
        defaultVal: "@KishEase",
        x: 8,
        y: 14,
        w: 84,
        fontSize: 32,
        fontWeight: 400,
        color: "rgba(255,255,255,.70)",
        align: "center",
        letterSpacing: 4,
      },
      {
        // Main title centered in the bottom black zone, inside safe zone
        id: "title",
        fieldId: "title",
        label: "عنوان کاور (کوتاه — حداکثر ۲ خط)",
        defaultVal: "جشنواره موسیقی کیش",
        big: true,
        x: 8,
        y: 73,
        w: 84,
        fontSize: 66,
        fontWeight: 900,
        color: "#fff",
        align: "center",
        lineHeight: 1.35,
      },
      {
        // Short date/sub at bottom
        id: "sub",
        fieldId: "sub",
        label: "تاریخ / زیرعنوان کوتاه",
        defaultVal: "کیش ایز · اخبار روز",
        x: 8,
        y: 86,
        w: 84,
        fontSize: 28,
        fontWeight: 400,
        color: "rgba(255,255,255,.60)",
        align: "center",
        letterSpacing: 1,
      },
    ],
    chrome(_f, bg, _op) {
      const bgS = bg
        ? `background:url(${bg}) center/cover no-repeat`
        : "background:linear-gradient(180deg,#0A2E48 0%,#1A7BA0 45%,#2EC4D9 100%)";
      return `<div style="${bgS};position:absolute;inset:0"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 22%,transparent 52%,rgba(0,0,0,.6) 68%,rgba(0,0,0,.92) 82%,#000 100%)"></div>
      <div style="position:absolute;top:0;right:0;width:6px;height:100%;background:linear-gradient(180deg,#D32F2F,#E07B54)"></div>`;
    },
  },

  // ── کاور هایلایت ۱:۱ ──────────────────────────────────────────────────
  {
    id: "highlight",
    cat: "هایلایت ۱:۱  (1080×1080)",
    name: "کاور هایلایت",
    icon: "⭕",
    w: 1080,
    h: 1080,
    layers: [
      {
        id: "icon",
        fieldId: "icon",
        label: "آیکون (ایموجی)",
        defaultVal: "📍",
        x: 25,
        y: 28,
        w: 50,
        fontSize: 210,
        fontWeight: 400,
        color: "#fff",
        align: "center",
      },
      {
        id: "name",
        fieldId: "name",
        label: "نام هایلایت",
        defaultVal: "مکان‌ها",
        x: 10,
        y: 62,
        w: 80,
        fontSize: 74,
        fontWeight: 900,
        color: "#fff",
        align: "center",
      },
    ],
    configFields: [
      { id: "c1", label: "رنگ بالا", defaultVal: "#0B3B5C", type: "color" },
      { id: "c2", label: "رنگ پایین", defaultVal: "#1A7BA0", type: "color" },
    ],
    chrome(f, bg, _op) {
      const c1 = f.c1 || "#0B3B5C";
      const c2 = f.c2 || "#1A7BA0";
      const bgS = bg
        ? `background:url(${bg}) center/cover no-repeat`
        : `background:linear-gradient(145deg,${c1},${c2})`;
      const ovl = bg
        ? `<div style="position:absolute;inset:0;background:linear-gradient(145deg,${c1}CC,${c2}CC)"></div>`
        : "";
      return `<div style="${bgS};position:absolute;inset:0"></div>${ovl}
      <div style="position:absolute;bottom:32px;left:0;right:0;text-align:center;font-family:'Pelak',sans-serif;font-size:22px;font-weight:300;color:rgba(255,255,255,.25);letter-spacing:3px">@KishEase</div>`;
    },
  },

  // ── اسلاید آزاد (branded) ─────────────────────────────────────────────
  {
    id: "blank",
    cat: "اسلاید آزاد",
    name: "اسلاید آزاد",
    icon: "✍️",
    w: 1080,
    h: 1080,
    layers: [
      {
        id: "text",
        fieldId: "text",
        label: "متن آزاد",
        defaultVal: "ادامه مطلب را اینجا بنویس...",
        big: true,
        x: 10,
        y: 36,
        w: 80,
        fontSize: 52,
        fontWeight: 700,
        color: "#E2E8F0",
        align: "right",
        lineHeight: 1.6,
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg
        ? `background:url(${bg}) center/cover no-repeat`
        : "background:linear-gradient(155deg,#0F1923,#16232F)";
      const ovl = bg
        ? `<div style="position:absolute;inset:0;background:rgba(15,25,35,${clamp(op + 0.1)})"></div>`
        : "";
      return `<div style="${bgS};position:absolute;inset:0"></div>${ovl}
      <div style="position:absolute;top:0;right:0;width:6px;height:100%;background:linear-gradient(180deg,#2EC4D9,#1A7BA0)"></div>
      <div style="position:absolute;top:48px;left:0;right:0;text-align:center;font-family:'Pelak',sans-serif;font-size:16px;font-weight:400;color:rgba(46,196,217,.4);letter-spacing:5px;text-transform:uppercase">KISH EASE · کیش ایز</div>
      <div style="position:absolute;bottom:48px;left:0;right:0;text-align:center;font-family:'Pelak',sans-serif;font-size:18px;font-weight:300;color:rgba(46,196,217,.3);letter-spacing:3px">@KishEase</div>
      <div style="position:absolute;bottom:96px;left:10%;right:10%;height:1px;background:rgba(46,196,217,.12)"></div>`;
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
