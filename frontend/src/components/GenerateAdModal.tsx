"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Clapperboard,
  Download,
  FileText,
  Globe,
  Images,
  LoaderCircle,
  Palette,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wand2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { writeScrapeCache } from "../lib/scrapeCache";

interface Stage {
  icon: LucideIcon;
  title: string;
  desc: string;
  logs: string[];
}

const STAGES: Stage[] = [
  {
    icon: Globe,
    title: "Scraping your website",
    desc: "Crawling the page for copy, images & brand signals",
    logs: ["GET / → 200 OK", "extracting text blocks", "logo & meta pulled"],
  },
  {
    icon: Palette,
    title: "Analyzing brand identity",
    desc: "Detecting colors, logo, tone & audience",
    logs: ["classifying product images", "brand palette locked", "tone: confident"],
  },
  {
    icon: Images,
    title: "Sourcing visuals",
    desc: "Filling gaps with matching HD stock footage",
    logs: ["scanning stock library", "3 HD visuals matched", "assets downloaded"],
  },
  {
    icon: FileText,
    title: "LLM drafting the script",
    desc: "AI copywriter writing hooks & scene-by-scene storyboard",
    logs: ["writing hook variations", "scenes storyboarded", "CTA copy generated"],
  },
  {
    icon: ShieldCheck,
    title: "LLM refining creative",
    desc: "Critic validates clarity, CTA strength & brand safety",
    logs: ["critic review pass", "headline clarity 98/100", "brand safety passed"],
  },
  {
    icon: Clapperboard,
    title: "Rendering HD video",
    desc: "Compositing scenes into a 1080×1920 vertical ad",
    logs: ["compositing scenes", "encoding H.264", "finalizing audio track"],
  },
];

const STAGE_MS = 2000;
const STAGE_MS_FAST = 340;

type Phase = "working" | "done" | "error";

interface ScrapeResult {
  videoUrl?: string | null;
  script?: { scenes?: unknown[] } | null;
  error?: string;
}

export default function GenerateAdModal({ url, onClose }: { url: string; onClose: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("working");
  const [stageIdx, setStageIdx] = useState(0);
  const [logTick, setLogTick] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fetchDone, setFetchDone] = useState(false);
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  let domain = "your-brand.com";
  try {
    domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "");
  } catch {
    domain = url.replace(/https?:\/\//, "").replace("www.", "").split("/")[0] || "your-brand.com";
  }

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, aspectRatio: "9:16" }),
          signal: ctrl.signal,
        });
        const data: ScrapeResult = await res.json();
        if (cancelled) return;
        if (!res.ok || data.error) throw new Error(data.error || "The generation pipeline failed. Please try again.");
        setResult(data);
        writeScrapeCache(url, data);
        setFetchDone(true);
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) return;
        setError(e instanceof Error ? e.message : "The generation pipeline failed. Please try again.");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [runId, url]);

  const retry = () => {
    setPhase("working");
    setStageIdx(0);
    setLogTick(0);
    setElapsed(0);
    setFetchDone(false);
    setError(null);
    setResult(null);
    setRunId((n) => n + 1);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (phase !== "working") return;
    const t = setTimeout(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
    }, fetchDone ? STAGE_MS_FAST : STAGE_MS);
    return () => clearTimeout(t);
  }, [phase, stageIdx, fetchDone]);

  useEffect(() => {
    if (phase !== "working") return;
    const t = setInterval(() => setLogTick((n) => n + 1), 1200);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "working" && fetchDone && stageIdx === STAGES.length - 1) {
      const t = setTimeout(() => setPhase("done"), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, fetchDone, stageIdx]);

  useEffect(() => {
    if (phase !== "working") return;
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const videoUrl: string | null = result?.videoUrl ?? null;
  const stage = STAGES[stageIdx];
  const StageIcon = stage.icon;
  const currentLog = stage.logs[logTick % stage.logs.length];
  const progress = phase === "done" ? 100 : ((stageIdx + 1) / STAGES.length) * 100;
  const sceneCount: number = result?.script?.scenes?.length ?? 0;

  const handleEdit = () => router.push(`/ads?url=${encodeURIComponent(url)}`);
  const handleDownload = () => {
    if (videoUrl) window.open(videoUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#0a1945]/25 backdrop-blur-sm animate-fade-overlay"
        onClick={phase === "working" ? undefined : onClose}
      />

      <div className="relative w-full max-w-[980px] max-h-[92vh] flex flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-[#f8fafd] shadow-[0_30px_90px_rgba(10,25,70,0.16)] animate-modal-pop">
       

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
          {/* LEFT — stage area */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 min-h-[400px]">
            {phase === "error" ? (
              <div className="flex flex-col items-center text-center gap-4 animate-modal-pop max-w-[320px]">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <TriangleAlert className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="text-[#0a1945] font-bold text-lg">Generation failed</p>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={retry}
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white bg-[#0a1945] hover:bg-[#0f2873] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-[0_10px_25px_rgba(10,25,70,0.25)]"
                >
                  <LoaderCircle className="w-4 h-4" /> Try Again
                </button>
              </div>
            ) : phase === "working" ? (
              <div className="relative flex flex-col items-center">
                {/* Phone frame with generation animation */}
                <div className="relative rounded-[36px] border-[6px] border-slate-700/90 bg-[#060d24] shadow-[0_30px_80px_rgba(10,25,70,0.35)] overflow-hidden animate-float-y" style={{ width: 214, height: 368 }}>
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 z-10" />

                  {/* inner skeleton scene */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5">
                    <div className="w-4/5 h-3 rounded bg-white/10 overflow-hidden relative">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.6s_infinite]" />
                    </div>
                    <div className="w-3/5 h-3 rounded bg-white/10 overflow-hidden relative">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.6s_infinite] animation-delay-400" />
                    </div>

                    {/* active stage icon with pulse rings */}
                    <div className="relative my-4 flex items-center justify-center">
                      <span className="absolute w-[72px] h-[72px] rounded-full border-2 border-blue-400/40 animate-pulse-ring" />
                      <span className="absolute w-[72px] h-[72px] rounded-full border border-cyan-300/30 animate-pulse-ring animation-delay-600" />
                      <div className="w-[72px] h-[72px] rounded-3xl bg-gradient-to-br from-blue-500/30 to-cyan-400/20 border border-blue-300/30 flex items-center justify-center">
                        <StageIcon className="w-8 h-8 text-blue-100 animate-soft-blink" />
                      </div>
                    </div>

                    <div className="w-2/3 h-8 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                    <div className="w-1/2 h-2 rounded bg-white/5" />
                  </div>

                  {/* scanning laser */}
                  <div
                    className="absolute left-2 right-2 h-12 animate-scan-y pointer-events-none z-10"
                    style={{ background: "linear-gradient(to bottom, transparent, rgba(96,165,250,0.18), rgba(147,197,253,0.38), rgba(96,165,250,0.18), transparent)" }}
                  />
                </div>

                {/* cycling status log */}
                <div className="mt-6 h-7 flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-white border border-slate-200 shadow-sm rounded-full px-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-soft-blink shrink-0" />
                  <span key={`${stageIdx}-${logTick}`} className="animate-fade-in-up whitespace-nowrap">{currentLog}</span>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="flex flex-col items-center">
                <div className="relative animate-video-reveal">
                  <div className="absolute -inset-10 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative w-[220px] sm:w-[258px] rounded-[32px] border-[6px] border-slate-700/90 shadow-[0_30px_90px_rgba(10,25,70,0.35)] bg-black"
                  />
                  <div className="absolute -top-3 -right-3 z-10 flex items-center gap-1 rounded-full bg-emerald-400 text-[#04122b] text-[10px] font-black px-2.5 py-1 shadow-lg animate-video-reveal">
                    <BadgeCheck className="w-3.5 h-3.5" /> HD READY
                  </div>
                </div>
                <p className="mt-6 text-slate-400 text-xs font-semibold tracking-wide">1080×1920 · Vertical · Preview playing muted</p>
              </div>
            ) : (
              <div className="animate-video-reveal flex flex-col items-center text-center gap-4 max-w-[300px]">
                <div className="relative">
                  <span className="absolute inset-0 rounded-3xl border-2 border-blue-200 animate-pulse-ring" />
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-[#0a1945] font-bold text-lg">Your ad concepts are ready</p>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">Open the editor to review the AI-written scenes and render your video.</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — pipeline / actions panel */}
          <div className="md:w-[330px] shrink-0 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-5 sm:p-6 flex flex-col gap-5">
            {phase === "error" ? (
              <div className="flex flex-col gap-3 animate-fade-in-up">
                <p className="text-[#0a1945] font-bold text-sm">Pipeline interrupted</p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  The AI hit a snag while generating your ad. You can retry — your URL is kept.
                </p>
                <button
                  onClick={retry}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white bg-[#0a1945] hover:bg-[#0f2873] transition-all duration-300 cursor-pointer"
                >
                  <LoaderCircle className="w-4 h-4" /> Retry Generation
                </button>
              </div>
            ) : phase === "working" ? (
              <>
                <div className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">AI Pipeline</p>
                    <p className="text-[11px] font-mono text-blue-600">{Math.round(progress)}%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_100%] animate-bg-pan transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {STAGES.map((s, i) => {
                    const status = i < stageIdx ? "done" : i === stageIdx ? "active" : "waiting";
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.title}
                        className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-500 animate-fade-in-up ${status === "active" ? "bg-blue-50/80 border border-blue-100" : "border border-transparent"}`}
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        <div
                          className={`relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                            status === "done"
                              ? "bg-blue-100/70 border-blue-200"
                              : status === "active"
                                ? "bg-white border-blue-200 shadow-sm"
                                : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          {status === "active" && <span className="absolute inset-0 rounded-xl border border-blue-300 animate-pulse-ring" />}
                          {status === "done" ? (
                            <Check className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Icon className={`w-4 h-4 ${status === "active" ? "text-blue-600 animate-soft-blink" : "text-slate-400"}`} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[13px] font-bold leading-tight ${status === "active" ? "text-[#0a1945]" : status === "done" ? "text-slate-700" : "text-slate-400"}`}>
                            {s.title}
                          </p>
                          <p className={`text-[11px] leading-snug mt-0.5 ${status === "waiting" ? "text-slate-300" : "text-slate-500"}`}>{s.desc}</p>
                        </div>
                        {status === "active" && <LoaderCircle className="w-3.5 h-3.5 animate-spin text-blue-600 ml-auto shrink-0 mt-1" />}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-2">
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
                  <span>elapsed {elapsed}s · hang tight, AI is working</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-5 h-full animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0a1945] font-bold text-base leading-tight">{videoUrl ? "Your ad is ready" : "Concepts ready"}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 truncate">{domain}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Format</p>
                    <p className="text-[#0a1945] font-bold mt-1">1080×1920</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Scenes</p>
                    <p className="text-[#0a1945] font-bold mt-1">{sceneCount || "—"}</p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-2.5">
                  <button
                    onClick={handleEdit}
                    type="button"
                    className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#0a1945] hover:bg-[#0f2873] shadow-[0_10px_25px_rgba(10,25,70,0.25)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" /> Edit Video
                  </button>
                  {videoUrl && (
                    <button
                      onClick={handleDownload}
                      type="button"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-[#0a1945] bg-white border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Video
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    type="button"
                    className="text-slate-400 hover:text-[#0a1945] text-xs font-semibold py-1.5 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
