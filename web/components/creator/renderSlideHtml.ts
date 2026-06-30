import type { Template, TemplateFields } from "./layerTemplates";
import { layerStyleString, pillStyleString, type Pos } from "./layerStyle";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

/** Builds the full static HTML for a slide (chrome + positioned text layers),
 * used for the full-resolution html2canvas export — mirrors what <Canvas>
 * renders live, but as a plain string since export happens off-screen. */
export function renderSlideHtml(
  tpl: Template,
  fields: TemplateFields,
  positions: Record<string, Pos>,
  bgImg: string | null,
  opacity: number
): string {
  const chrome = tpl.chrome(fields, bgImg, opacity);
  const layers = tpl.layers
    .map((layer) => {
      const value = escapeHtml(fields[layer.fieldId] ?? layer.defaultVal);
      const style = layerStyleString(layer, positions[layer.id]);
      const inner = layer.pill ? `<span style="${pillStyleString(layer)}">${value}</span>` : value;
      return `<div style="${style}">${inner}</div>`;
    })
    .join("");
  return chrome + layers;
}
