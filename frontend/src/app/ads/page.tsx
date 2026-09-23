"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Check,
  Sparkles,
  RotateCcw,
  Type,
  Palette,
  Images,
  Smartphone,
  LayoutTemplate,
  MonitorPlay,
  PanelRightOpen,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdFormat = "story" | "square" | "banner";
type SidebarTab = "text" | "colors" | "gallery";

interface AdCreative {
  id: string;
  format: AdFormat;
  platform: string;
  resolution: string;
  badge: string;
  headline: string;
  body: string;
  cta: string;
  bgFrom: string;
  bgTo: string;
  textColor: string;
  ctaBg: string;
  ctaText: string;
}

// ─── Ad Canvas Preview ───────────────────────────────────────────────────────

function AdCanvas({ ad, domain }: { ad: AdCreative; domain: string }) {
  const isStory = ad.format === "story";
  const isBanner = ad.format === "banner";

  if (isStory) {
    return (
      <div className="flex items-center justify-center w-full h-full p-6">
        <div className="relative flex flex-col items-center">
          <div
            className="relative rounded-[36px] border-[6px] border-slate-700 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden"
            style={{ width: 212, height: 368 }}
          >
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
            <div
              className="absolute inset-0 flex flex-col justify-between p-4"
              style={{ background: `linear-gradient(135deg, ${ad.bgFrom}, ${ad.bgTo})` }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: ad.ctaBg }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-15 bg-white" />
              </div>
              <p className="relative z-10 text-[9px] uppercase font-black tracking-[0.22em] mt-7 opacity-60" style={{ color: ad.textColor }}>{domain}</p>
              <div className="relative z-10 flex-1 flex flex-col justify-center py-3">
                <p className="font-black text-sm leading-snug line-clamp-5 drop-shadow" style={{ color: ad.textColor }}>{ad.headline}</p>
                <p className="text-[10px] mt-2 leading-relaxed line-clamp-3 opacity-70" style={{ color: ad.textColor }}>{ad.body}</p>
              </div>
              <div className="relative z-10 mb-2">
                <span className="inline-block text-[9px] font-black px-3 py-1.5 rounded-full shadow-md" style={{ background: ad.ctaBg, color: ad.ctaText }}>{ad.cta} →</span>
              </div>
            </div>
          </div>
          <div className="mt-3 w-20 h-1 rounded-full bg-slate-400/40" />
        </div>
      </div>
    );
  }

  if (isBanner) {
    return (
      <div className="flex items-center justify-center w-full h-full p-6">
        <div className="w-full max-w-[600px]">
          <div className="relative rounded-xl border-[5px] border-slate-700 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 border-b border-slate-700">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <div className="ml-2 flex-1 bg-slate-700 rounded text-[8px] text-slate-400 px-2 py-0.5 font-mono truncate">{domain}</div>
            </div>
            <div className="flex flex-col justify-between p-5 h-[calc(100%-28px)] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ad.bgFrom}, ${ad.bgTo})` }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: ad.ctaBg }} />
              <p className="relative z-10 text-[9px] uppercase font-black tracking-widest opacity-60" style={{ color: ad.textColor }}>{domain}</p>
              <div className="relative z-10">
                <p className="font-black text-base sm:text-lg leading-snug drop-shadow" style={{ color: ad.textColor }}>{ad.headline}</p>
                <p className="text-xs mt-1.5 opacity-70 leading-relaxed" style={{ color: ad.textColor }}>{ad.body}</p>
              </div>
              <div className="relative z-10">
                <span className="inline-block text-xs font-black px-4 py-1.5 rounded-full shadow-md" style={{ background: ad.ctaBg, color: ad.ctaText }}>{ad.cta} →</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-4 bg-slate-600 mx-auto" style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />
            <div className="w-24 h-1.5 bg-slate-500 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Square
  return (
    <div className="flex items-center justify-center w-full h-full p-6">
      <div className="relative rounded-2xl border-[5px] border-slate-700 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden" style={{ width: 300, height: 300 }}>
        <div className="absolute inset-0 flex flex-col justify-between p-5" style={{ background: `linear-gradient(135deg, ${ad.bgFrom}, ${ad.bgTo})` }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15" style={{ background: ad.ctaBg }} />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full blur-3xl opacity-10 bg-white" />
          </div>
          <p className="relative z-10 text-[9px] uppercase font-black tracking-widest opacity-60" style={{ color: ad.textColor }}>{domain}</p>
          <div className="relative z-10 flex-1 flex flex-col justify-center py-2">
            <p className="font-black text-sm leading-snug drop-shadow line-clamp-4" style={{ color: ad.textColor }}>{ad.headline}</p>
            <p className="text-[10px] mt-2 leading-relaxed opacity-70 line-clamp-3" style={{ color: ad.textColor }}>{ad.body}</p>
          </div>
          <div className="relative z-10">
            <span className="inline-block text-[10px] font-black px-3 py-1.5 rounded-full shadow-md" style={{ background: ad.ctaBg, color: ad.ctaText }}>{ad.cta} →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({ label, value, onChange, description }: { label: string; value: string; onChange: (v: string) => void; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-[#0a1945]">{label}</p>
        {description && <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <label className="relative cursor-pointer shrink-0 group">
        <div className="w-9 h-9 rounded-xl border-2 border-slate-200 shadow-sm group-hover:border-blue-400 transition-all duration-200 overflow-hidden" style={{ background: value }} />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
      </label>
    </div>
  );
}

// ─── Gallery Thumb ───────────────────────────────────────────────────────────

function GalleryThumb({ ad, isActive, onClick }: { ad: AdCreative; isActive: boolean; onClick: () => void }) {
  const icon = ad.format === "story" ? <Smartphone className="w-3.5 h-3.5" /> : ad.format === "square" ? <LayoutTemplate className="w-3.5 h-3.5" /> : <MonitorPlay className="w-3.5 h-3.5" />;
  const aspectClass = ad.format === "story" ? "aspect-[9/16]" : ad.format === "square" ? "aspect-square" : "aspect-[16/9]";
  return (
    <button onClick={onClick} type="button" className={`group relative flex flex-col gap-2 p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isActive ? "border-blue-600 bg-blue-50 shadow-[0_4px_16px_rgba(10,25,70,0.15)]" : "border-slate-200 bg-white hover:border-blue-300"}`}>
      <div className={`${aspectClass} w-full rounded-lg overflow-hidden`} style={{ background: `linear-gradient(135deg, ${ad.bgFrom}, ${ad.bgTo})` }}>
        <div className="flex flex-col h-full justify-between p-1.5">
          <span className="text-[6px] uppercase tracking-widest opacity-60 font-bold" style={{ color: ad.textColor }}>Ad</span>
          <span className="text-[7px] font-bold leading-tight line-clamp-3" style={{ color: ad.textColor }}>{ad.headline}</span>
          <span className="text-[6px] font-black px-1.5 py-0.5 rounded-full inline-block" style={{ background: ad.ctaBg, color: ad.ctaText }}>{ad.cta}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 justify-center text-[10px] font-semibold text-slate-500">{icon}<span>{ad.resolution}</span></div>
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
          <Check className="w-2 h-2 text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function AdsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawUrl = searchParams.get("url") || "https://example.com";
  let domain = "your-brand.com";
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    domain = parsed.hostname.replace("www.", "");
  } catch {
    domain = rawUrl.replace(/https?:\/\//, "").replace("www.", "").split("/")[0] || "your-brand.com";
  }

  const initialAds: AdCreative[] = [
    { id: "ad-1", format: "story",  platform: "Instagram & TikTok Stories", resolution: "1080×1920", badge: "Hook Angle",     headline: `Stop wasting hours designing ads. Let AI do it for ${domain}.`, body: "Generate scroll-stopping creatives in 60 seconds with verified high CTR.", cta: "Try Free Today",    bgFrom: "#0a1945", bgTo: "#040a1d", textColor: "#ffffff", ctaBg: "#ffffff", ctaText: "#0a1945" },
    { id: "ad-2", format: "square", platform: "Meta Feed & Carousel",        resolution: "1080×1080", badge: "Social Proof",   headline: "The #1 tool top brands use to 10x their ROAS in 60 seconds.", body: "Instant brand extraction. Professional typography. Multi-channel ready.", cta: "Get Started Free", bgFrom: "#0b2160", bgTo: "#02050f", textColor: "#ffffff", ctaBg: "#3b82f6", ctaText: "#ffffff" },
    { id: "ad-3", format: "banner", platform: "Google Display & YouTube",    resolution: "1200×628",  badge: "Direct Response", headline: "Turn any URL into live, ready-to-run HD ads — instantly.", body: "No Figma. No agencies. Test dozens of angles effortlessly.", cta: "Explore Platform",  bgFrom: "#0d2870", bgTo: "#03081a", textColor: "#ffffff", ctaBg: "#60a5fa", ctaText: "#0a1945" },
    { id: "ad-4", format: "story",  platform: "TikTok & YouTube Shorts",     resolution: "1080×1920", badge: "Pain Point",     headline: "Still paying $5k/mo for basic ad creatives? There's a smarter way.", body: "Switch to AI-powered production and launch 10x faster today.", cta: "Start in Seconds", bgFrom: "#07194a", bgTo: "#020614", textColor: "#ffffff", ctaBg: "#a5f3fc", ctaText: "#0a1945" },
    { id: "ad-5", format: "square", platform: "LinkedIn & Meta Square",       resolution: "1080×1080", badge: "Feature Focus",  headline: "Instant 4K ads perfectly matched to your brand colors & fonts.", body: "Every creative is tuned to your audience and ready to publish.", cta: "See Live Demo",     bgFrom: "#0a1e5c", bgTo: "#01030a", textColor: "#ffffff", ctaBg: "#818cf8", ctaText: "#ffffff" },
    { id: "ad-6", format: "banner", platform: "Google Ads & Retargeting",    resolution: "1200×628",  badge: "Urgency",        headline: "Limited spots: Upgrade your entire ad creative stack today.", body: "One link generates infinite high-converting variations in seconds.", cta: "Claim Your Spot",  bgFrom: "#0b246b", bgTo: "#01040f", textColor: "#ffffff", ctaBg: "#fbbf24", ctaText: "#0a1945" },
  ];

  const [ads, setAds] = useState<AdCreative[]>(initialAds);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SidebarTab>("text");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4000/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: rawUrl, aspectRatio: "9:16" }),
        });
        const data = await res.json();
        
        if (!isMounted) return;
        
        if (data.error) {
          console.error(data.error);
          setLoading(false);
          return;
        }

        setThreadId(data.thread_id);
        setVideoUrl(data.videoUrl);

        if (data.script && data.script.scenes) {
          const mappedAds: AdCreative[] = data.script.scenes.map((scene: any, i: number) => ({
            id: scene.id || `ad-${i}`,
            format: data.script.format || "story",
            platform: "Generated Ad",
            resolution: "1080×1920",
            badge: scene.angle || "Variation",
            headline: scene.headline,
            body: scene.body,
            cta: scene.cta,
            bgFrom: scene.bgFrom,
            bgTo: scene.bgTo,
            textColor: scene.textColor,
            ctaBg: scene.ctaBg,
            ctaText: scene.ctaText,
          }));
          setAds(mappedAds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAds();
    return () => { isMounted = false; };
  }, [rawUrl]);

  const currentAd = ads[activeIndex];
  const updateAd = (patch: Partial<AdCreative>) => setAds((prev) => prev.map((a, i) => (i === activeIndex ? { ...a, ...patch } : a)));
  
  const handleApplyEdits = async () => {
    if (!threadId) return;
    setDownloading(true);
    try {
      // Re-map the Ads array back into the backend scene format
      const scenes = ads.map(a => ({
        id: a.id,
        angle: a.badge,
        headline: a.headline,
        body: a.body,
        cta: a.cta,
        imageIndex: 0, // Simplified for now
        durationSec: 4,
        voiceover: "",
        bgFrom: a.bgFrom,
        bgTo: a.bgTo,
        textColor: a.textColor,
        ctaBg: a.ctaBg,
        ctaText: a.ctaText,
      }));

      const res = await fetch("http://localhost:4000/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          decision: { action: "edit", edits: { scenes } }
        }),
      });
      const data = await res.json();
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = () => {
    if (!threadId) {
      setDownloading(true);
      setTimeout(() => { setDownloading(false); setDownloaded(true); setTimeout(() => setDownloaded(false), 2500); }, 1400);
      return;
    }
    handleApplyEdits();
  };

  const formatIcon = currentAd.format === "story" ? <Smartphone className="w-3.5 h-3.5" /> : currentAd.format === "square" ? <LayoutTemplate className="w-3.5 h-3.5" /> : <MonitorPlay className="w-3.5 h-3.5" />;

  const tabs: { key: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { key: "text",    label: "Text",    icon: <Type className="w-4 h-4" /> },
    { key: "colors",  label: "Colors",  icon: <Palette className="w-4 h-4" /> },
    { key: "gallery", label: "Gallery", icon: <Images className="w-4 h-4" /> },
  ];

  const SidebarPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-white shrink-0">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} type="button"
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-all duration-200 cursor-pointer border-b-2 ${activeTab === t.key ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 bg-white">
        {activeTab === "text" && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Headline</label>
              <textarea value={currentAd.headline} onChange={(e) => updateAd({ headline: e.target.value })} rows={3} className="w-full text-sm font-semibold text-[#0a1945] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 resize-none outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 leading-snug" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Body / Subheadline</label>
              <textarea value={currentAd.body} onChange={(e) => updateAd({ body: e.target.value })} rows={3} className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 resize-none outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 leading-relaxed" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">CTA Button Text</label>
              <input type="text" value={currentAd.cta} onChange={(e) => updateAd({ cta: e.target.value })} className="w-full text-sm font-bold text-[#0a1945] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all duration-200" />
            </div>
            <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[11px] text-blue-700 font-semibold leading-relaxed">✦ Changes reflect instantly in the preview canvas.</p>
            </div>
          </div>
        )}
        {activeTab === "colors" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <ColorPicker label="Background — Start" value={currentAd.bgFrom} onChange={(v) => updateAd({ bgFrom: v })} description="Gradient start color" />
              <ColorPicker label="Background — End"   value={currentAd.bgTo}   onChange={(v) => updateAd({ bgTo: v })}   description="Gradient end color" />
              <div className="border-t border-slate-100 pt-4">
                <ColorPicker label="Text Color" value={currentAd.textColor} onChange={(v) => updateAd({ textColor: v })} description="Headline & body text" />
              </div>
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                <ColorPicker label="CTA Background" value={currentAd.ctaBg}   onChange={(v) => updateAd({ ctaBg: v })}   description="Button fill color" />
                <ColorPicker label="CTA Text"       value={currentAd.ctaText} onChange={(v) => updateAd({ ctaText: v })} description="Button label color" />
              </div>
            </div>
            <div className="mt-2 rounded-xl overflow-hidden h-16 shadow-inner border border-slate-200" style={{ background: `linear-gradient(135deg, ${currentAd.bgFrom}, ${currentAd.bgTo})` }} />
            <button onClick={() => updateAd({ bgFrom: initialAds[activeIndex].bgFrom, bgTo: initialAds[activeIndex].bgTo, textColor: "#ffffff", ctaBg: initialAds[activeIndex].ctaBg, ctaText: initialAds[activeIndex].ctaText })} type="button" className="w-full text-xs font-bold text-slate-500 border border-slate-200 rounded-xl py-2 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 cursor-pointer">
              ↺ Reset to Default
            </button>
          </div>
        )}
        {activeTab === "gallery" && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Select a Variant</p>
            <div className="grid grid-cols-2 gap-3">
              {ads.map((ad, i) => (
                <GalleryThumb key={ad.id} ad={ad} isActive={i === activeIndex} onClick={() => { setActiveIndex(i); setActiveTab("text"); }} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Download — sticky footer */}
      <div className="shrink-0 p-4 border-t border-slate-200 bg-white">
        <button onClick={handleDownload} disabled={downloading || loading} type="button" className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm text-white bg-[#0a1945] hover:bg-[#0f2873] transition-all duration-300 shadow-[0_6px_20px_rgba(10,25,70,0.22)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
          {downloading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : downloaded ? (
            <><Check className="w-4 h-4 text-emerald-300" /><span className="text-emerald-200">Success!</span></>
          ) : (
            <><Download className="w-4 h-4" /><span>{videoUrl ? "Apply Edits & Re-render" : "Render Video"}</span></>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#f5f7fb] overflow-hidden animate-slide-left">
      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-5 py-3 bg-white border-b border-slate-200 shadow-[0_2px_12px_rgba(10,25,70,0.05)] z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push("/")} type="button" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-[#0a1945] hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-blue-700 uppercase bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 shrink-0">
              <Sparkles className="w-3 h-3" /><span className="hidden sm:inline">AI Complete</span>
            </div>
            <span className="text-[#0a1945] font-bold text-sm hidden sm:block truncate">{domain}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
          {formatIcon}
          <span>{currentAd.platform}</span>
          <span className="text-slate-300">·</span>
          <span className="font-bold text-[#0a1945]">{currentAd.resolution}</span>
          <span className="ml-2 text-[10px] uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 font-bold">{currentAd.badge}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => router.push("/")} type="button" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#0a1945] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-sm">
            <RotateCcw className="w-3.5 h-3.5" />New URL
          </button>
          <button onClick={() => setDrawerOpen(true)} type="button" className="flex lg:hidden items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#0a1945] text-white transition-all duration-200 cursor-pointer shadow-sm">
            <PanelRightOpen className="w-3.5 h-3.5" />Edit
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f7fb] relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#dbeafe] rounded-full blur-[180px] opacity-40" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
            
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-blue-200 border-t-[#0a1945] animate-spin" />
                <p className="text-[#0a1945] text-sm font-semibold tracking-widest uppercase">Generating your ads…</p>
              </div>
            ) : videoUrl ? (
              <div className="w-full max-w-[400px] flex flex-col items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Final Rendered Video</span>
                <video src={videoUrl} controls autoPlay loop className="w-full rounded-2xl shadow-xl border-4 border-slate-700 bg-black" />
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Canvas</span>
                  <div className="flex gap-1.5">
                    {ads.map((_, i) => (
                      <button key={i} onClick={() => setActiveIndex(i)} type="button" className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${i === activeIndex ? "bg-[#0a1945] scale-125" : "bg-slate-300 hover:bg-slate-400"}`} />
                    ))}
                  </div>
                </div>
                <div className="w-full max-w-[640px] max-h-[calc(100vh-160px)] flex items-center justify-center">
                  <AdCanvas ad={currentAd} domain={domain} />
                </div>
              </>
            )}
          </div>
          <div className="relative z-10 shrink-0 flex items-center justify-center gap-3 pb-5">
            <button onClick={() => setActiveIndex((i) => Math.max(0, i - 1))} disabled={activeIndex === 0} type="button" className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white text-[#0a1945] hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm">← Prev</button>
            <span className="text-xs text-slate-400 font-semibold">{activeIndex + 1} / {ads.length}</span>
            <button onClick={() => setActiveIndex((i) => Math.min(ads.length - 1, i + 1))} disabled={activeIndex === ads.length - 1} type="button" className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white text-[#0a1945] hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm">Next →</button>
          </div>
        </div>

        {/* RIGHT: Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[320px] xl:w-[360px] shrink-0 border-l border-slate-200 bg-white">
          <SidebarPanel />
        </aside>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-overlay lg:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 h-[82vh] rounded-t-3xl overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.25)] flex flex-col animate-slide-up-drawer lg:hidden">
            <div className="bg-white flex justify-between items-center px-5 py-3 border-b border-slate-200 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <span className="text-sm font-bold text-[#0a1945] pt-1">Edit Ad</span>
              <button onClick={() => setDrawerOpen(false)} type="button" className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden"><SidebarPanel /></div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb] flex flex-col items-center justify-center gap-4"><div className="w-10 h-10 rounded-full border-[3px] border-blue-200 border-t-[#0a1945] animate-spin" /><p className="text-[#0a1945] text-sm font-semibold tracking-widest uppercase">Generating your ads…</p></div>}>
      <AdsContent />
    </Suspense>
  );
}
