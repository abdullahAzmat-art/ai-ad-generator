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
import {
  brandInitials,
  copyWarnings,
  getRoleStyle,
  ratioOption,
  type AdBrand,
  type AspectRatio,
  type RatioOption,
  type SceneCard,
} from "../../lib/adScenes";

interface Props {
  scene: SceneCard;
  brand: AdBrand;
  isLast: boolean;
  /** Frame the next render will use; the preview is drawn to match it. */
  aspectRatio: AspectRatio;
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

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{children}</p>
  );
}

/**
 * The scene as the renderer composes it, drawn at the shape it will be
 * rendered in: full visual, caption text under it, then the brand strip that
 * stays on every frame.
 */
function SceneFrame({ scene, brand, ratio }: { scene: SceneCard; brand: AdBrand; ratio: RatioOption }) {
  return (
    <div
      className={`${ratio.widthClass} ${ratio.frameClass} w-full mx-auto flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_6px_20px_rgba(10,25,70,0.10)]`}
    >
      {/* 1. Visual */}
      {scene.hasVisual ? (
        scene.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.imageUrl}
            alt={`Visual of scene ${scene.sceneNumber}`}
            className="flex-1 min-h-0 w-full object-cover"
          />
        ) : (
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-1.5 border-b border-dashed border-slate-200 bg-slate-50 text-slate-400">
            <ImageOff className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Visual sourced at render</span>
          </div>
        )
      ) : (
        <div
          className="flex-1 min-h-0 w-full flex items-center justify-center px-4 text-center"
          style={{ background: `linear-gradient(160deg,#FFFFFF 0%,${brand.color}26 100%)` }}
        >
          <span className="text-2xl font-black tracking-tight text-[#0a1945] leading-none">
            {brand.name}
          </span>
        </div>
      )}

      {/* 2. On-screen text */}
      <div className="shrink-0 min-h-[62px] px-3 py-2.5 flex flex-col items-center justify-center text-center bg-white">
        <p className="text-[15px] font-extrabold leading-tight text-[#111827] tracking-tight">
          {scene.headline || "Headline appears here"}
        </p>
        {scene.subtext && (
          <p className="mt-1 text-[11px] font-medium leading-snug text-slate-500">{scene.subtext}</p>
        )}
        {scene.cta && (
          <span
            className="mt-2 inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: brand.color }}
          >
            {scene.cta}
          </span>
        )}
      </div>

      {/* 3. Brand footer, present on every frame of the video */}
      <div
        className="shrink-0 flex items-center justify-center gap-2 px-3 py-2 bg-white"
        style={{ borderTop: `3px solid ${brand.color}` }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full overflow-hidden shrink-0 border border-black/5"
          style={{ backgroundColor: brand.logo ? "#F9FAFB" : brand.color }}
        >
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[10px] font-black text-white">{brandInitials(brand.name)}</span>
          )}
        </span>
        <span className="flex flex-col items-center leading-tight min-w-0">
          <span className="text-[12px] font-black text-[#111827] truncate max-w-[150px]">
            {brand.name}
          </span>
          <span className="text-[10px] font-semibold truncate max-w-[150px]" style={{ color: brand.color }}>
            {brand.website}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function SceneEditorCard({ scene, brand, isLast, aspectRatio, onChange }: Props) {
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

      {/* How the scene looks in the video */}
      <div className="px-5 pt-5 pb-4 bg-[#f8fafd] border-b border-slate-200">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <SectionLabel>Scene preview</SectionLabel>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {aspectRatio} frame
          </span>
        </div>
        <SceneFrame scene={scene} brand={brand} ratio={ratioOption(aspectRatio)} />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-3">
          <SectionLabel>On-screen text</SectionLabel>
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
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <SectionLabel>Voiceover</SectionLabel>
          <Field
            icon={Mic}
            label="Spoken script"
            value={scene.voiceover}
            rows={3}
            placeholder="Spoken voiceover text..."
            onChange={(voiceover) => onChange({ voiceover })}
          />
        </div>

        {isLast && (
          <div className="flex flex-col gap-3 pt-1">
            <SectionLabel>Footer call to action</SectionLabel>
            <Field
              icon={Sparkles}
              label="CTA Button Text"
              value={scene.cta}
              placeholder="e.g. Shop Now"
              strong
              onChange={(cta) => onChange({ cta })}
            />
          </div>
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
