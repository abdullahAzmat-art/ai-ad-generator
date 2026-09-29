"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Check,
  Sparkles,
  RotateCcw,
  Wand2,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { readScrapeCache, writeScrapeCache } from "../../lib/scrapeCache";
import { applySceneEdits, generateAdOnce } from "../../lib/api";
import {
  currentRatio,
  DEFAULT_ASPECT_RATIO,
  getBrand,
  mapScenes,
  ratioOption,
  withAppliedRun,
  type AspectRatio,
  type SceneCard,
  type ScrapeData,
} from "../../lib/adScenes";
import { downloadVideo } from "../../lib/downloadVideo";
import AspectRatioPicker from "../../components/ads/AspectRatioPicker";
import SceneEditorCard from "../../components/ads/SceneEditorCard";

// ─── Loading / empty states ───────────────────────────────────────────────────

function CenteredMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="h-screen bg-[#f5f7fb] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-12 h-12 rounded-full border-[3px] border-blue-200 border-t-[#0a1945] animate-spin" />
      <p className="text-[#0a1945] text-sm font-bold tracking-widest uppercase">{title}</p>
      <p className="text-slate-500 text-sm max-w-md">{detail}</p>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function AdsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawUrl = searchParams.get("url") || "";
  let domain = "your-brand.com";
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    domain = parsed.hostname.replace("www.", "");
  } catch {
    domain = rawUrl.replace(/https?:\/\//, "").replace("www.", "").split("/")[0] || "your-brand.com";
  }

  const [run, setRun] = useState<ScrapeData | null>(null);
  const [scenes, setScenes] = useState<SceneCard[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const applyRun = (data: ScrapeData) => {
      if (!isMounted) return;
      setRun(data);
      setThreadId(data.thread_id ?? null);
      setVideoUrl(data.videoUrl ?? null);
      setScenes(mapScenes(data));
    };

    const fetchAds = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        if (!rawUrl) {
          setLoadError("No website was passed to this page. Generate an ad from the home page first.");
          return;
        }

        const cached = readScrapeCache<ScrapeData>(rawUrl);
        if (cached) {
          applyRun(cached);
          return;
        }

        // Nothing cached means the pipeline has to run for this URL.
        const data = await generateAdOnce(rawUrl);
        if (!isMounted) return;
        writeScrapeCache(rawUrl, data);
        applyRun(data);
      } catch (err) {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : "Unable to load this ad.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAds();
    return () => {
      isMounted = false;
    };
  }, [rawUrl]);

  const updateScene = (index: number, patch: Partial<SceneCard>) => {
    setScenes((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    setApplied(false);
    setNotices([]);
  };

  // Picking a frame size only queues it; the video changes on Apply Changes.
  const changeRatio = (value: AspectRatio) => {
    setAspectRatio(value);
    setApplied(false);
    setNotices([]);
  };

  const handleApplyChanges = async () => {
    if (!threadId || !run) return;
    setApplying(true);
    setActionError(null);
    setNotices([]);
    try {
      const resumed = await applySceneEdits(threadId, scenes, aspectRatio);
      const updatedRun = withAppliedRun(run, resumed);
      setRun(updatedRun);
      writeScrapeCache(rawUrl, updatedRun);
      // Re-read the cards from the server's script so the editor shows exactly
      // what was rendered, including anything the backend had to shorten.
      setScenes(mapScenes(updatedRun));
      setVideoUrl(updatedRun.videoUrl ?? null);
      setNotices(resumed.editWarnings ?? []);
      setApplied(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to apply these changes.");
    } finally {
      setApplying(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    setDownloading(true);
    setActionError(null);
    try {
      await downloadVideo(videoUrl, `${domain}-ad.mp4`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to download the video.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <CenteredMessage title="Loading your ad…" detail="Reading the scenes generated for this website." />;
  }

  if (loadError || scenes.length === 0) {
    return (
      <div className="h-screen bg-[#f5f7fb] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-700">
          <TriangleAlert className="w-7 h-7" />
        </div>
        <h1 className="text-[#0a1945] font-black text-xl">
          {loadError ? "This ad could not be loaded" : "This ad has no scenes yet"}
        </h1>
        <p className="text-slate-500 text-sm max-w-md">
          {loadError || "The generation run for this website did not produce a script, so there is nothing to edit."}
        </p>
        <button
          onClick={() => router.push("/")}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#0a1945] hover:bg-[#0f2873] transition-all duration-300 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          Generate a new ad
        </button>
      </div>
    );
  }

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);
  const brand = getBrand(run ?? {}, domain);
  // Ratio of the video that exists right now, versus the one about to be rendered.
  const renderedRatio = currentRatio(run);
  const ratioChanged = aspectRatio !== renderedRatio;

  return (
    <div className="h-screen flex flex-col bg-[#f5f7fb] overflow-hidden">
      {/* ── Top bar ── */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_2px_12px_rgba(10,25,70,0.05)] z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/")}
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-[#0a1945] hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-blue-700 uppercase bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 shrink-0">
              <Wand2 className="w-3 h-3" />
              <span className="hidden sm:inline">Edit Video</span>
            </div>
            <span className="text-[#0a1945] font-bold text-sm hidden sm:block truncate">{domain}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-400">
            {scenes.length} scenes · {totalDuration}s
          </span>
          <button
            onClick={() => router.push("/")}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#0a1945] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />New URL
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Scene editor cards */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-[#0a1945]" />
                <h2 className="text-[#0a1945] font-black text-lg">Scene Editor</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">
                {scenes.length} scenes · {aspectRatio} frame
              </span>
            </div>

            {actionError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
                <TriangleAlert className="w-4 h-4 shrink-0 mt-px" />
                <span>{actionError}</span>
              </div>
            )}

            {!threadId && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-800">
                <TriangleAlert className="w-4 h-4 shrink-0 mt-px" />
                <span>
                  This run is no longer active, so changes cannot be applied. Generate the ad again to keep editing.
                </span>
              </div>
            )}

            {notices.length > 0 && (
              <ul className="mb-5 flex flex-col gap-1.5 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3">
                {notices.map((notice) => (
                  <li key={notice} className="text-[12px] font-semibold text-sky-800 leading-snug">
                    {notice}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-5">
              {scenes.map((scene, i) => (
                <SceneEditorCard
                  key={scene.id}
                  scene={scene}
                  brand={brand}
                  isLast={i === scenes.length - 1}
                  aspectRatio={aspectRatio}
                  onChange={(patch) => updateScene(i, patch)}
                />
              ))}
            </div>

            {/* Bottom padding so the sticky bar never overlaps the last card */}
            <div className="h-28" />
          </div>
        </div>

        {/* RIGHT: Video preview panel (desktop) */}
        {videoUrl && (
          <aside className="hidden lg:flex flex-col w-[320px] xl:w-[380px] shrink-0 border-l border-slate-200 bg-white p-6 gap-5 overflow-y-auto">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#0a1945]">Generated Video</h3>
              <span className="text-[11px] font-semibold text-slate-400 ml-auto">
                {renderedRatio} · {totalDuration}s
              </span>
            </div>
            <div className={`relative rounded-2xl overflow-hidden border-[4px] border-slate-800 shadow-xl bg-black ${ratioOption(renderedRatio).frameClass} w-full`}>
              {/* The rendered MP4 is streamed from the video CDN, not this origin. */}
              <video src={videoUrl} controls autoPlay loop playsInline className="w-full h-full object-contain" />
            </div>
            {ratioChanged && (
              <p className="text-[11px] font-semibold text-slate-400">
                Applying your changes re-renders this ad at {aspectRatio}.
              </p>
            )}
          </aside>
        )}
      </div>

      {/* ── Sticky action bar ── */}
      <div className="shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(10,25,70,0.08)] px-5 py-4 z-20">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3">
         

          <AspectRatioPicker
            value={aspectRatio}
            renderedRatio={renderedRatio}
            onChange={changeRatio}
          />

          <button
            onClick={handleApplyChanges}
            disabled={applying || !threadId}
            type="button"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#0a1945] bg-white border-2 border-[#0a1945] hover:bg-[#0a1945] hover:text-white transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {applying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : applied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {applying
                ? "Re-rendering…"
                : applied
                  ? "Applied!"
                  : ratioChanged
                    ? `Apply & Re-render ${aspectRatio}`
                    : "Apply Changes"}
            </span>
          </button>

          {videoUrl && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              type="button"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#0a1945] hover:bg-[#0f2873] transition-all duration-300 shadow-[0_4px_16px_rgba(10,25,70,0.22)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{downloading ? "Saving…" : "Download Video"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense fallback={<CenteredMessage title="Loading…" detail="Preparing the scene editor." />}>
      <AdsContent />
    </Suspense>
  );
}
