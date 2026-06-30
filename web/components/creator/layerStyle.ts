import type { CSSProperties } from "react";
import type { TextLayer } from "./layerTemplates";

export interface Pos {
  x: number;
  y: number;
}

export function layerStyleObject(layer: TextLayer, pos: Pos | undefined): CSSProperties {
  return {
    position: "absolute",
    left: `${pos?.x ?? layer.x}%`,
    top: `${pos?.y ?? layer.y}%`,
    width: `${layer.w}%`,
    fontFamily: "'PelakFA','Pelak',sans-serif",
    fontSize: layer.fontSize,
    fontWeight: layer.fontWeight,
    color: layer.color,
    textAlign: layer.align,
    lineHeight: layer.lineHeight ?? 1.3,
    letterSpacing: layer.letterSpacing,
    direction: "rtl",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
}

export function layerStyleString(layer: TextLayer, pos: Pos | undefined): string {
  const s = layerStyleObject(layer, pos);
  const parts: string[] = [
    "position:absolute",
    `left:${s.left}`,
    `top:${s.top}`,
    `width:${s.width}`,
    `font-family:${s.fontFamily}`,
    `font-size:${s.fontSize}px`,
    `font-weight:${s.fontWeight}`,
    `color:${s.color}`,
    `text-align:${s.textAlign}`,
    `line-height:${s.lineHeight}`,
    "direction:rtl",
    "white-space:pre-wrap",
    "word-break:break-word",
  ];
  if (s.letterSpacing) parts.push(`letter-spacing:${s.letterSpacing}px`);
  return parts.join(";");
}

export function pillStyleString(layer: TextLayer): string {
  if (!layer.pill) return "";
  return `display:inline-block;padding:8px 20px;border-radius:6px;background:${layer.pill.bg};color:${layer.pill.color}`;
}
