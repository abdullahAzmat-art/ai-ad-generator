"use client";

import {
  AlertTriangle,
  ChevronRight,
  Film,
  ImageOff,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";
import { copyWarnings, getRoleStyle, type SceneCard } from "../../lib/adScenes";

interface Props {
  scene: SceneCard;
  isLast: boolean;
  onChange: (patch: Partial<SceneCard>) => void;
}

function Field({
  icon: Icon,
  label,
  value,
  rows,
  placeholder,
  strong,
  onChange,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string;
  rows?: number;
  placeholder: string;
  strong?: boolean;
  onChange: (value: string) => void;
}) {
  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a1945] focus:bg-white focus:ring-2 focus:ring-[#0a1945]/10 transition-all duration-200 placeholder:text-slate-300 " +
    (strong
      ? "text-sm font-semibold text-[#0a1945] leading-snug "
      : "text-sm text-slate-600 leading-relaxed ");

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={inputClass + "resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function SceneEditorCard({ scene, isLast, onChange }: Props) {
  const roleStyle = getRoleStyle(scene.role);
  const warnings = copyWarnings(scene);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(10,25,70,0.06)] overflow-hidden hover:shadow-[0_4px_24px_rgba(10,25,70,0.10)] transition-all duration-200">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0a1945] text-white text-xs font-black shrink-0">
            {scene.sceneNumber}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold truncate ${roleStyle.bg} ${roleStyle.text}`}>
            {roleStyle.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 shrink-0">
          <Film className="w-3.5 h-3.5" />
          <span>{scene.durationSec}s</span>
        </div>
      </div>

      {/* Visual that the scene composites over */}
      <div className="px-5 pt-5">
        {scene.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.imageUrl}
            alt={`Visual for scene ${scene.sceneNumber}`}
            className="w-full h-32 object-cover rounded-xl border border-slate-200"
          />
        ) : (
          <div className="w-full h-32 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
            <ImageOff className="w-5 h-5" />
            <span className="text-[11px] font-semibold">No visual sourced for this scene</span>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 p-5">
        <Field
          icon={MessageSquare}
          label="Headline"
          value={scene.headline}
          rows={2}
          placeholder="Scene headline..."
          strong
          onChange={(headline) => onChange({ headline })}
        />
        <Field
          icon={ChevronRight}
          label="Subtext"
          value={scene.subtext}
          rows={2}
          placeholder="Supporting text..."
          onChange={(subtext) => onChange({ subtext })}
        />
        <Field
          icon={Mic}
          label="Voiceover Script"
          value={scene.voiceover}
          rows={3}
          placeholder="Spoken voiceover text..."
          onChange={(voiceover) => onChange({ voiceover })}
        />
        {isLast && (
          <Field
            icon={Sparkles}
            label="CTA Button Text"
            value={scene.cta}
            placeholder="e.g. Shop Now"
            strong
            onChange={(cta) => onChange({ cta })}
          />
        )}

        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-3">
            {warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2 text-[11px] font-semibold text-amber-800 leading-snug">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
