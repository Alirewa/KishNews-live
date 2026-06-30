// Layer-based template model: a small set of decorative "chrome" (background
// gradients/stripes — not editable) plus a handful of draggable, click-to-edit
// text layers. Kept deliberately short per slide — long lists belong in extra
// slides (see Creator's multi-slide support), not crammed into one image.

export type TemplateFields = Record<string, string>;

export interface TextLayer {
  id: string;
  fieldId: string;
  label: string;
  defaultVal: string;
  big?: boolean; // multi-line input in the side panel
  /** position & size as % of the canvas, draggable from these defaults */
  x: number;
  y: number;
  w: number;
  fontSize: number; // px, relative to a 1080px-wide canvas
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
  /** non-editable background chrome (gradient/stripe/overlay), as an HTML string */
  chrome: (fields: TemplateFields, bg: string | null, op: number) => string;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export const TEMPLATES: Template[] = [
  {
    id: "news-sq",
    cat: "پست ۱:۱  (1080×1080)",
    name: "خبر فوری",
    icon: "⚡",
    w: 1080,
    h: 1080,
    layers: [
      {
        id: "badge",
        fieldId: "badge",
        label: "تگ رویداد",
        defaultVal: "⚡ خبر فوری",
        x: 7.4,
        y: 9,
        w: 50,
        fontSize: 20,
        fontWeight: 800,
        color: "#fff",
        align: "right",
        pill: { bg: "#E07B54", color: "#fff" },
      },
      {
        id: "title",
        fieldId: "title",
        label: "عنوان (کوتاه و جذاب)",
        defaultVal: "جشنواره موسیقی کیش این شهریور برگزار می‌شود",
        big: true,
        x: 7.4,
        y: 38,
        w: 85,
        fontSize: 54,
        fontWeight: 900,
        color: "#fff",
        align: "right",
        lineHeight: 1.4,
      },
      {
        id: "meta",
        fieldId: "meta",
        label: "منبع / تاریخ",
        defaultVal: "خبرگزاری کیش · امروز",
        x: 7.4,
        y: 89,
        w: 85,
        fontSize: 18,
        fontWeight: 300,
        color: "#A8E6EF",
        align: "right",
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg ? `background:url(${bg}) center/cover no-repeat` : "background:linear-gradient(155deg,#0B3B5C,#0D2840)";
      const ovl = bg
        ? `<div style="position:absolute;inset:0;background:linear-gradient(155deg,rgba(11,59,92,${op}),rgba(13,40,64,${clamp(op + 0.15)}))"></div>`
        : "";
      return `<div style="${bgS};position:absolute;inset:0"></div>${ovl}<div style="position:absolute;top:0;right:0;width:8px;height:100%;background:#E07B54"></div>`;
    },
  },

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
        y: 70,
        w: 86,
        fontSize: 56,
        fontWeight: 900,
        color: "#fff",
        align: "right",
      },
      {
        id: "name_en",
        fieldId: "name_en",
        label: "نام مکان (انگلیسی)",
        defaultVal: "Olympic Coastal Park · Kish",
        x: 7,
        y: 81,
        w: 86,
        fontSize: 18,
        fontWeight: 300,
        color: "#A8E6EF",
        align: "right",
      },
      {
        id: "desc",
        fieldId: "desc",
        label: "توضیح (یک خط)",
        defaultVal: "چشم‌انداز خیره‌کننده خلیج فارس",
        x: 7,
        y: 88,
        w: 86,
        fontSize: 20,
        fontWeight: 400,
        color: "rgba(255,255,255,.8)",
        align: "right",
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg ? `background:url(${bg}) center/cover no-repeat` : "background:linear-gradient(160deg,#2EC4D9,#1A7BA0,#0B3B5C)";
      return `<div style="${bgS};position:absolute;inset:0"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(11,59,92,${clamp(op + 0.15)}) 100%)"></div>
      <div style="position:absolute;top:22px;right:22px;width:54px;height:54px;background:rgba(255,255,255,.14);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px">📍</div>`;
    },
  },

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
        x: 60,
        y: 4,
        w: 33,
        fontSize: 16,
        fontWeight: 600,
        color: "#fff",
        align: "right",
        pill: { bg: "rgba(255,255,255,.14)", color: "#fff" },
      },
      {
        id: "title",
        fieldId: "title",
        label: "عنوان (کوتاه و جذاب)",
        defaultVal: "غروب آفتاب در ساحل شمالی کیش",
        big: true,
        x: 6.7,
        y: 76,
        w: 86,
        fontSize: 48,
        fontWeight: 900,
        color: "#fff",
        align: "right",
        lineHeight: 1.4,
      },
      {
        id: "loc",
        fieldId: "loc",
        label: "موقعیت / منبع",
        defaultVal: "📍 ساحل شمالی، کیش",
        x: 6.7,
        y: 92,
        w: 70,
        fontSize: 16,
        fontWeight: 400,
        color: "rgba(255,255,255,.6)",
        align: "right",
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg ? `background:url(${bg}) center/cover no-repeat` : "background:linear-gradient(160deg,#164E70,#0B3B5C)";
      return `<div style="${bgS};position:absolute;inset:0"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,59,92,.2) 0%,transparent 35%,rgba(11,59,92,${clamp(op + 0.1)}) 100%)"></div>`;
    },
  },

  {
    id: "reels",
    cat: "ریلز / استوری ۹:۱۶  (1080×1920)",
    name: "کاور ریلز",
    icon: "🎬",
    w: 1080,
    h: 1920,
    layers: [
      {
        id: "title",
        fieldId: "title",
        label: "عنوان (کوتاه — حداکثر ۲ خط)",
        defaultVal: "جشنواره موسیقی کیش این شهریور",
        big: true,
        // kept well inside Instagram's safe zone: clear of the top ~220px UI
        // and bottom ~250px UI, centered in the lower-third black band
        x: 8,
        y: 76,
        w: 84,
        fontSize: 56,
        fontWeight: 900,
        color: "#fff",
        align: "center",
        lineHeight: 1.4,
      },
    ],
    chrome(_f, bg, _op) {
      const bgS = bg ? `background:url(${bg}) center/cover no-repeat` : "background:linear-gradient(160deg,#0A2E48,#1A7BA0,#2EC4D9)";
      // Simple, deliberate look: background image + a single gradient that
      // goes from transparent at top to fully black at the bottom, where the
      // title sits — nothing else competes with the title for attention.
      return `<div style="${bgS};position:absolute;inset:0"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,transparent 55%,rgba(0,0,0,.55) 70%,rgba(0,0,0,.95) 85%,#000 100%)"></div>`;
    },
  },

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
        y: 32,
        w: 50,
        fontSize: 200,
        fontWeight: 400,
        color: "#fff",
        align: "center",
      },
      {
        id: "name",
        fieldId: "name",
        label: "نام هایلایت",
        defaultVal: "مکان‌ها",
        x: 15,
        y: 60,
        w: 70,
        fontSize: 70,
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
      const bgS = bg ? `background:url(${bg}) center/cover no-repeat` : `background:linear-gradient(145deg,${c1},${c2})`;
      const ovl = bg ? `<div style="position:absolute;inset:0;background:linear-gradient(145deg,${c1}CC,${c2}CC)"></div>` : "";
      return `<div style="${bgS};position:absolute;inset:0"></div>${ovl}`;
    },
  },

  {
    id: "blank",
    cat: "اسلاید آزاد",
    name: "صفحه خالی",
    icon: "➕",
    w: 1080,
    h: 1080,
    layers: [
      {
        id: "text",
        fieldId: "text",
        label: "متن آزاد",
        defaultVal: "متن خودت رو اینجا بنویس...",
        big: true,
        x: 10,
        y: 40,
        w: 80,
        fontSize: 48,
        fontWeight: 700,
        color: "#0D1B2A",
        align: "center",
        lineHeight: 1.5,
      },
    ],
    chrome(_f, bg, op) {
      const bgS = bg ? `background:url(${bg}) center/cover no-repeat` : "background:#F8F5EE";
      const ovl = bg ? `<div style="position:absolute;inset:0;background:rgba(248,245,238,${clamp(op)})"></div>` : "";
      return `<div style="${bgS};position:absolute;inset:0"></div>${ovl}`;
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
