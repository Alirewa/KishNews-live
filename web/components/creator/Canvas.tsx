"use client";

import { useRef, useState } from "react";
import type { Template, TemplateFields } from "./layerTemplates";
import { layerStyleObject, type Pos } from "./layerStyle";

interface CanvasProps {
  tpl: Template;
  fields: TemplateFields;
  positions: Record<string, Pos>;
  bgImg: string | null;
  opacity: number;
  /** rendered pixel size on screen; layers use %, so drag math just needs this rect */
  onFieldChange: (fieldId: string, val: string) => void;
  onPositionChange: (layerId: string, pos: Pos) => void;
}

export function Canvas({ tpl, fields, positions, bgImg, opacity, onFieldChange, onPositionChange }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const dragState = useRef<{ layerId: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const startDrag = (e: React.PointerEvent, layerId: string, base: Pos) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(layerId);
    dragState.current = { layerId, startX: e.clientX, startY: e.clientY, baseX: base.x, baseY: base.y };

    const onMove = (ev: PointerEvent) => {
      const drag = dragState.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!drag || !rect) return;
      const dxPct = ((ev.clientX - drag.startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - drag.startY) / rect.height) * 100;
      onPositionChange(drag.layerId, {
        x: Math.max(0, Math.min(95, drag.baseX + dxPct)),
        y: Math.max(0, Math.min(95, drag.baseY + dyPct)),
      });
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0 }}
      onClick={() => setSelected(null)}
    >
      <div
        style={{ position: "absolute", inset: 0 }}
        dangerouslySetInnerHTML={{ __html: tpl.chrome(fields, bgImg, opacity) }}
      />
      {tpl.layers.map((layer) => {
        const pos = positions[layer.id];
        const value = fields[layer.fieldId] ?? layer.defaultVal;
        const style = layerStyleObject(layer, pos);
        const isSelected = selected === layer.id;
        return (
          <div
            key={layer.id}
            style={{
              ...style,
              outline: isSelected ? "2px dashed #2EC4D9" : "none",
              outlineOffset: 4,
              cursor: "text",
              minHeight: 20,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(layer.id);
            }}
            suppressContentEditableWarning
            contentEditable
            onBlur={(e) => onFieldChange(layer.fieldId, e.currentTarget.innerText)}
          >
            {layer.pill ? (
              <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: 6, background: layer.pill.bg, color: layer.pill.color }}>
                {value}
              </span>
            ) : (
              value
            )}
            {isSelected && (
              <span
                onPointerDown={(e) => startDrag(e, layer.id, pos ?? { x: layer.x, y: layer.y })}
                contentEditable={false}
                style={{
                  position: "absolute",
                  top: -28,
                  right: 0,
                  background: "#2EC4D9",
                  color: "#0B3B5C",
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 4,
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
                ⠿ جابجایی
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
