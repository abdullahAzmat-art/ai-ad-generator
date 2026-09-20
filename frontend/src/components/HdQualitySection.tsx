import React from "react";
import { ArrowRight, MonitorPlay, Layers, Zap, Clock } from "lucide-react";

export default function HdQualitySection() {
  const qualities = [
    {
      icon: <MonitorPlay className="w-5 h-5 text-blue-400" />,
      title: "4K-Ready Resolution",
      desc: "Every ad is exported at ultra-high fidelity — crisp text, rich colors, and zero blur on Retina or mobile screens.",
    },
    {
      icon: <Layers className="w-5 h-5 text-blue-300" />,
      title: "All Formats & Ratios",
      desc: "9:16 Stories, 1:1 Feeds, 16:9 Landscape — generated simultaneously so you never have to re-crop.",
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      title: "Brand-Matched Styling",
      desc: "Fonts, color schemes, and visual aesthetics are pulled directly from your site for 100% brand consistency.",
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-300" />,
      title: "Rendered Under 60s",
      desc: "What takes an agency weeks happens in seconds. Test multiple creative directions at lightning speed.",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden border-t border-blue-100/80 bg-[#f8fafd]">
      
      {/* Background Ambient Tints */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#dbeafe] rounded-full blur-[190px] opacity-60" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[450px] h-[450px] bg-[#e0e7ff] rounded-full blur-[190px] opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading & Copy */}
          <div data-animate="fade-right">
            <span className="text-blue-800 font-semibold tracking-[0.22em] text-xs sm:text-sm uppercase mb-3.5 block">
              HD Quality Guarantee
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0a1945] tracking-tight leading-[1.05] mb-6">
              HD Ads That Make <br />
              <span className="text-blue-800">People Stop Scrolling</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              We never produce fuzzy, generic templates. Every visual is rendered at studio-level HD with custom typography and tailored branding — ready to plug straight into your ad campaigns.
            </p>
            <a
              href="#url-input"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white bg-[#0a1945] hover:bg-[#0f2873] transition-all duration-300 shadow-[0_8px_25px_rgba(10,25,70,0.2)] hover:shadow-[0_12px_30px_rgba(10,25,70,0.3)] hover:-translate-y-0.5 text-base border border-blue-900/20"
            >
              <span>See Sample Ads</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right Column: 2x2 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {qualities.map((item, idx) => (
              <div
                key={idx}
                data-animate="fade-up"
                style={{ transitionDelay: `${idx * 120}ms` }}
                className="bg-white border border-blue-100/80 hover:border-blue-300 rounded-2xl p-6 flex flex-col gap-3.5 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(10,25,70,0.08)] hover:-translate-y-1 shadow-[0_4px_20px_rgba(10,25,70,0.04)]"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
                  {item.icon}
                </div>
                <h3 className="text-[#0a1945] font-bold text-base sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
