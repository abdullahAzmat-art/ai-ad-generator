"use client";

import { RectangleHorizontal, Smartphone, Square } from "lucide-react";
import { ASPECT_RATIOS, type AspectRatio } from "../../lib/adScenes";

const ICONS: Record<AspectRatio, typeof Square> = {
  "9:16": Smartphone,
  "1:1": Square,
  "16:9": RectangleHorizontal,
};

interface Props {
  value: AspectRatio;
  /** Ratio the video on screen was rendered at, so the change is visible. */
  renderedRatio: AspectRatio;
  onChange: (value: AspectRatio) => void;
}

/**
 * Frame size the next render will use. Choosing one does nothing until the
 * changes are applied, which is when the video is re-rendered.
 */
export default function AspectRatioPicker({ value, renderedRatio, onChange }: Props) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Aspect ratio</span>
      <div
        role="radiogroup"
        aria-label="Aspect ratio for the next render"
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
      >
        {ASPECT_RATIOS.map((option) => {
          const Icon = ICONS[option.value];
          const active = option.value === value;
          const isRendered = option.value === renderedRatio;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              title={isRendered ? `${option.hint} — the current video` : `${option.hint} — re-renders on apply`}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
                active
                  ? "bg-[#0a1945] text-white shadow-sm"
                  : "text-[#0a1945] hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
              {isRendered && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
