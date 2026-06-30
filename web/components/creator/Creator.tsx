"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchNews } from "@/lib/news";
import { mapNewsToFields } from "@/lib/mapNewsToFields";
import type { NewsItem } from "@/lib/types";
import { TEMPLATES, getTemplate, type TemplateFields } from "./layerTemplates";
import { Canvas } from "./Canvas";
import { renderSlideHtml } from "./renderSlideHtml";
import type { Pos } from "./layerStyle";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

function proxiedImage(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

interface Slide {
  id: string;
  templateId: string;
  fields: TemplateFields;
  positions: Record<string, Pos>;
  bgImg: string | null;
  opacity: number;
}

function newSlide(templateId: string, fields: TemplateFields = {}, bgImg: string | null = null): Slide {
  return {
    id: `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    templateId,
    fields,
    positions: {},
    bgImg,
    opacity: 0.72,
  };
}

export function Creator() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");

  const [news, setNews] = useState<NewsItem | null>(null);
  const [slides, setSlides] = useState<Slide[]>([newSlide("news-sq")]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState("یک تمپلیت از منوی کنار انتخاب کنید");
  const [busy, setBusy] = useState<"" | "png" | "jpg">("");

  const slide = slides[activeIndex];
  const tpl = useMemo(() => getTemplate(slide.templateId), [slide.templateId]);

  useEffect(() => {
    let cancelled = false;
    if (!newsId) return;
    setStatus("در حال بارگذاری خبر...");
    fetchNews()
      .then((items) => {
        if (cancelled) return;
        const found = items.find((i) => i.id === newsId) || null;
        setNews(found);
        if (found) {
          setSlides([
            newSlide("news-sq", mapNewsToFields(found, "news-sq"), found.image ? proxiedImage(found.image) : null),
          ]);
          setActiveIndex(0);
        }
        setStatus(found ? `✓ خبر «${found.title}» بارگذاری شد` : "خبر پیدا نشد");
      })
      .catch(() => {
        if (!cancelled) setStatus("بارگذاری خبر ناموفق بود");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsId]);

  const updateSlide = (patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === activeIndex ? { ...s, ...patch } : s)));
  };

  const selectTpl = (id: string) => {
    const t = getTemplate(id);
    if (!t) return;
    const base: TemplateFields = {};
    t.layers.forEach((l) => (base[l.fieldId] = l.defaultVal));
    t.configFields?.forEach((c) => (base[c.id] = c.defaultVal));
    if (news) Object.assign(base, mapNewsToFields(news, id));
    updateSlide({ templateId: id, fields: base, positions: {} });
  };

  const addSlide = () => {
    const base: TemplateFields = { text: "" };
    setSlides((prev) => [...prev, newSlide("blank", base)]);
    setActiveIndex(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((i) => Math.max(0, i >= index ? i - 1 : i));
  };

  const onFieldChange = (fieldId: string, val: string) => {
    updateSlide({ fields: { ...slide.fields, [fieldId]: val } });
  };

  const onPositionChange = (layerId: string, pos: Pos) => {
    updateSlide({ positions: { ...slide.positions, [layerId]: pos } });
  };

  const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSlide({ bgImg: String(ev.target?.result || "") });
    reader.readAsDataURL(file);
  };

  const removeBg = () => updateSlide({ bgImg: null, opacity: 0.72 });

  const download = async (fmt: "png" | "jpg") => {
    if (!tpl) return;
    setBusy(fmt);
    setStatus("در حال رندر تصویر با کیفیت کامل...");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const wrap = document.createElement("div");
      wrap.style.cssText = `position:fixed;top:0;left:-${tpl.w + 200}px;width:${tpl.w}px;height:${tpl.h}px;overflow:hidden;direction:rtl;font-family:'PelakFA','Pelak',sans-serif;z-index:-9999`;
      wrap.innerHTML = renderSlideHtml(tpl, slide.fields, slide.positions, slide.bgImg, slide.opacity);
      document.body.appendChild(wrap);

      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(wrap, {
        scale: 1,
        width: tpl.w,
        height: tpl.h,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      document.body.removeChild(wrap);

      const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
      const base = `KishEase_${tpl.id}_${ts}`;

      if (fmt === "png") {
        triggerDownload(canvas.toDataURL("image/png"), base + ".png");
        setStatus(`✅ دانلود PNG: ${tpl.w}×${tpl.h}px`);
      } else {
        const jc = document.createElement("canvas");
        jc.width = canvas.width;
        jc.height = canvas.height;
        const ctx = jc.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, jc.width, jc.height);
        ctx.drawImage(canvas, 0, 0);
        triggerDownload(jc.toDataURL("image/jpeg", 0.95), base + ".jpg");
        setStatus(`✅ دانلود JPEG (95%): ${tpl.w}×${tpl.h}px`);
      }
    } catch (err) {
      setStatus("❌ خطا در رندر: " + (err instanceof Error ? err.message : String(err)));
    }
    setBusy("");
  };

  const exportJSON = () => {
    const data = {
      version: "2.0",
      app: "KishEase Post Creator",
      slides,
      newsUrl: news?.url || null,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `KishEase_slides_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setStatus("✅ محتوا برون‌بری شد");
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result || "{}"));
        if (!Array.isArray(data.slides) || data.slides.length === 0) {
          throw new Error("فایل معتبر نیست");
        }
        setSlides(data.slides);
        setActiveIndex(0);
        setStatus("✅ محتوا درون‌بری شد");
      } catch (err) {
        alert("❌ خطا در خواندن فایل: " + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!tpl) return null;

  const scale = Math.min(380 / tpl.w, 440 / tpl.h);
  const dW = Math.floor(tpl.w * scale);
  const dH = Math.floor(tpl.h * scale);

  const categories = useMemo(() => {
    const map = new Map<string, typeof TEMPLATES>();
    TEMPLATES.filter((t) => t.id !== "blank").forEach((t) => {
      const list = map.get(t.cat) || [];
      list.push(t);
      map.set(t.cat, list as typeof TEMPLATES);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="flex h-screen flex-col bg-app-bg text-app-text">
      <header className="flex h-[52px] flex-shrink-0 items-center gap-3 border-b border-app-border bg-app-sb px-4">
        <div className="text-[15px] font-black tracking-widest text-white">
          Kish<em className="text-turquoise not-italic">Ease</em>
        </div>
        <div className="h-6 w-px bg-app-border" />
        <div className="flex-1 truncate text-xs text-app-muted">
          {tpl.name} · اسلاید {activeIndex + 1} از {slides.length}
        </div>
        <button onClick={exportJSON} className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-muted hover:border-turquoise hover:text-turquoise">
          📤 برون‌بری
        </button>
        <label className="cursor-pointer rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-muted hover:border-sand hover:text-sand">
          📥 درون‌بری
          <input type="file" accept=".json" className="hidden" onChange={importJSON} />
        </label>
        <div className="h-6 w-px bg-app-border" />
        <span className="text-[10px] tracking-widest text-app-muted">{tpl.w}×{tpl.h}</span>
        <button
          disabled={!!busy}
          onClick={() => download("png")}
          className="rounded-lg bg-turquoise px-4 py-1.5 text-xs font-bold text-deep-ocean disabled:opacity-40"
        >
          {busy === "png" ? "⏳" : "⬇ PNG"}
        </button>
        <button
          disabled={!!busy}
          onClick={() => download("jpg")}
          className="rounded-lg bg-sand px-4 py-1.5 text-xs font-bold text-deep-ocean disabled:opacity-40"
        >
          {busy === "jpg" ? "⏳" : "⬇ JPEG"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[210px] flex-shrink-0 overflow-y-auto border-l border-app-border bg-app-sb p-2">
          {categories.map(([cat, tpls]) => (
            <div key={cat}>
              <span className="block px-2 pb-1 pt-3 text-[9px] font-bold uppercase tracking-widest text-app-muted">
                {cat}
              </span>
              {tpls.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTpl(t.id)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-right transition ${
                    t.id === slide.templateId
                      ? "border-turquoise bg-turquoise/10"
                      : "border-app-border bg-app-card hover:border-turquoise"
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span>
                    <div className="text-[11px] font-bold">{t.name}</div>
                    <div className="text-[8px] tracking-wide text-app-muted">{t.w}×{t.h}</div>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto bg-app-bg p-5">
          <span className="self-start text-[9px] uppercase tracking-widest text-app-muted">
            پیش‌نمایش زنده · روی متن کلیک کن و ویرایش کن، با دستگیره ⠿ جابجا کن
          </span>
          <div style={{ direction: "ltr" }}>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background: "#0A1520",
                borderRadius: 10,
                border: "1px solid var(--app-border)",
                width: dW,
                height: dH,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: tpl.w,
                  height: tpl.h,
                  transform: `scale(${scale})`,
                  transformOrigin: "0 0",
                }}
              >
                <Canvas
                  tpl={tpl}
                  fields={slide.fields}
                  positions={slide.positions}
                  bgImg={slide.bgImg}
                  opacity={slide.opacity}
                  onFieldChange={onFieldChange}
                  onPositionChange={onPositionChange}
                />
              </div>
            </div>
          </div>
          <div className="w-full max-w-[480px] rounded-lg border border-app-border bg-turquoise/5 p-2 text-center text-[11px] text-app-muted">
            {status}
          </div>

          {/* Slide filmstrip */}
          <div className="flex w-full max-w-[480px] flex-wrap items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveIndex(i)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-md border text-[11px] font-bold ${
                  i === activeIndex ? "border-turquoise bg-turquoise/10 text-turquoise" : "border-app-border bg-app-card text-app-muted"
                }`}
              >
                {i + 1}
                {slides.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(i);
                    }}
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] text-white"
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={addSlide}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-app-border text-turquoise hover:border-turquoise"
              title="افزودن اسلاید"
            >
              ＋
            </button>
          </div>
        </div>

        {/* Panel */}
        <div className="w-[272px] flex-shrink-0 overflow-y-auto border-l border-app-border bg-app-panel p-3.5">
          <span className="mb-2 block text-[8px] font-bold uppercase tracking-widest text-turquoise">تصویر پس‌زمینه</span>
          <label>
            <div className="mb-2 cursor-pointer rounded-lg border-2 border-dashed border-app-border p-3.5 text-center hover:border-turquoise">
              <span className="mb-1 block text-xl">{slide.bgImg ? "✅" : "🖼️"}</span>
              <p className="text-[10px] text-app-muted">
                {slide.bgImg ? "تصویر بارگذاری شد — کلیک برای تغییر" : "کلیک کنید و عکس انتخاب کنید"}
              </p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onBgUpload} />
          </label>

          {slide.bgImg && (
            <>
              <button
                onClick={removeBg}
                className="mb-2 w-full rounded-lg border border-coral/25 bg-coral/10 py-1.5 text-[10px] text-coral hover:bg-coral/20"
              >
                × حذف تصویر پس‌زمینه
              </button>
              <div className="mb-2">
                <label className="mb-1 flex justify-between text-[10px] text-app-muted">
                  <span>تیرگی overlay</span>
                  <span>{Math.round(slide.opacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={Math.round(slide.opacity * 100)}
                  onChange={(e) => updateSlide({ opacity: clamp(Number(e.target.value) / 100) })}
                  className="w-full accent-turquoise"
                />
              </div>
            </>
          )}

          <span className="mb-2 mt-4 block text-[8px] font-bold uppercase tracking-widest text-turquoise">محتوا و متون</span>
          <p className="mb-2 text-[10px] leading-relaxed text-app-muted">
            متن‌ها مستقیم روی پیش‌نمایش هم قابل ویرایش و جابجایی هستن.
          </p>
          {tpl.layers.map((l) => {
            const cur = slide.fields[l.fieldId] ?? l.defaultVal ?? "";
            return (
              <div key={l.id} className="mb-2">
                <label className="mb-1 block text-[10px] text-app-muted">{l.label}</label>
                {l.big ? (
                  <textarea
                    value={cur}
                    onChange={(e) => onFieldChange(l.fieldId, e.target.value)}
                    dir="rtl"
                    className="min-h-[54px] w-full rounded-md border border-app-border bg-app-card p-2 text-[11px] text-app-text outline-none focus:border-turquoise"
                  />
                ) : (
                  <input
                    value={cur}
                    onChange={(e) => onFieldChange(l.fieldId, e.target.value)}
                    dir="rtl"
                    className="w-full rounded-md border border-app-border bg-app-card p-2 text-[11px] text-app-text outline-none focus:border-turquoise"
                  />
                )}
              </div>
            );
          })}
          {tpl.configFields?.map((c) => (
            <div key={c.id} className="mb-2 flex items-center gap-2">
              <input
                type="color"
                value={slide.fields[c.id] ?? c.defaultVal}
                onChange={(e) => onFieldChange(c.id, e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border border-app-border bg-app-card p-0.5"
              />
              <label className="text-[10px] text-app-muted">{c.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
