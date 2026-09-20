import React from "react";
import { Star, Shield, Zap, CheckCircle2, Layers, MonitorPlay } from "lucide-react";

export default function WhyChooseUsSection() {
  const reasons = [
    {
      icon: <Star className="w-5 h-5 text-blue-400" />,
      title: "No Design Skills Needed",
      desc: "Produce agency-quality banners, carousels, and videos without touching Figma or Photoshop.",
    },
    {
      icon: <Shield className="w-5 h-5 text-blue-300" />,
      title: "Privacy & Safe Extraction",
      desc: "We solely scrape public metadata and media from your website link. No passwords or account access required.",
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      title: "10x Faster Than Agencies",
      desc: "Avoid lengthy creative briefs and week-long turnaround times. Ship creative variations in under two minutes.",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-blue-300" />,
      title: "Engineered for High CTR",
      desc: "Layout structures and hooks are calibrated around modern high-performing direct-response advertising standards.",
    },
    {
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      title: "Multi-Channel Ready",
      desc: "Instant export sets formatted for Meta Ads, TikTok Ads Manager, Google Display, and LinkedIn sponsored posts.",
    },
    {
      icon: <MonitorPlay className="w-5 h-5 text-blue-300" />,
      title: "Rapid A/B Testing",
      desc: "Generate dozens of angle tests at once to quickly identify your top-performing marketing angles.",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden border-t border-blue-100/80 bg-[#f8fafd]">
      
      {/* Centered Ambient Tint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-[#dbeafe] rounded-full blur-[200px] opacity-45 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20" data-animate="fade-up">
          <span className="text-blue-800 font-semibold tracking-[0.22em] text-xs sm:text-sm uppercase mb-3 block">
            Why Vibe Studio
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0a1945] tracking-tight leading-tight">
            Why <span className="text-blue-800">Choose Us?</span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            The fastest, cleanest, and most reliable bridge from website URL to high-performing ads.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {reasons.map((r, idx) => (
            <div
              key={idx}
              data-animate="fade-up"
              style={{ transitionDelay: `${idx * 90}ms` }}
              className="group bg-white border border-blue-100/80 hover:border-blue-300 rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(10,25,70,0.1)] hover:-translate-y-1 shadow-[0_4px_20px_rgba(10,25,70,0.04)]"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 group-hover:scale-110 group-hover:border-blue-400 transition-all duration-300">
                {r.icon}
              </div>
              <h3 className="text-[#0a1945] font-bold text-lg sm:text-xl">
                {r.title}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
