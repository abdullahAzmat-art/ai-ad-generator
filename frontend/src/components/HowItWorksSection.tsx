import React from "react";
import { Link2, Cpu, ImagePlay } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: <Link2 className="w-6 h-6 text-blue-400" />,
      title: "Paste Your URL",
      desc: "Drop in any product or landing page link. Our AI instantly crawls your site and extracts your core brand identity.",
    },
    {
      step: "02",
      icon: <Cpu className="w-6 h-6 text-blue-300" />,
      title: "AI Analyzes & Crafts",
      desc: "Our engine synthesizes your visuals, copy hooks, and tone to generate scroll-stopping ad creatives in seconds.",
    },
    {
      step: "03",
      icon: <ImagePlay className="w-6 h-6 text-blue-400" />,
      title: "Download & Launch",
      desc: "Export ready-to-run HD ads sized for Meta, Google, TikTok, and YouTube in a single click.",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden border-t border-blue-100/80 bg-[#f8fafd]">
      {/* Background Ambient Tint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#dbeafe] rounded-full blur-[180px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20" data-animate="fade-up">
          <span className="text-blue-800 font-semibold tracking-[0.22em] text-xs sm:text-sm uppercase mb-3 block">
            The Process
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0a1945] tracking-tight leading-tight">
            How It <span className="text-blue-800">Works</span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Three simple steps. Zero complexity. High-converting ads every time.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[64px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-[1px] bg-gradient-to-r from-transparent via-blue-300 to-transparent pointer-events-none" />

          {steps.map((s, idx) => (
            <div
              key={idx}
              data-animate="fade-up"
              style={{ transitionDelay: `${idx * 150}ms` }}
              className="relative group bg-white border border-blue-100/80 hover:border-blue-300 rounded-3xl p-7 sm:p-8 flex flex-col items-start gap-6 transition-all duration-400 hover:shadow-[0_12px_35px_rgba(10,25,70,0.1)] hover:-translate-y-1.5 shadow-[0_4px_25px_rgba(10,25,70,0.04)]"
            >
              {/* Giant Background Step Number */}
              <span className="absolute top-6 right-6 text-5xl sm:text-6xl font-black text-blue-100/80 group-hover:text-blue-200 transition-colors duration-400 select-none leading-none">
                {s.step}
              </span>

              {/* Icon Container (Soft Blue Tint) */}
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center group-hover:scale-105 group-hover:border-blue-400 transition-all duration-300 shadow-sm text-blue-700">
                {s.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-[#0a1945] font-bold text-xl sm:text-2xl mb-2.5">
                  {s.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
