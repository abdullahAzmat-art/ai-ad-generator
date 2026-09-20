"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = document.getElementById("url-input");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-28 sm:py-36 px-4 text-center overflow-hidden border-t border-blue-100/80 bg-[#f8fafd]">
      
      {/* Background Ambient Tint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[750px] h-[360px] bg-[#dbeafe] rounded-full blur-[180px] opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto" data-animate="fade-up">
        
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0a1945] tracking-tight leading-[1.08] mb-6">
          Ready to generate your <br />
          <span className="text-blue-800">first HD ad campaign?</span>
        </h2>
        
        <p className="text-slate-600 text-base sm:text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Paste your website URL above and preview your brand transformed into production-ready HD ads in under 60 seconds.
        </p>

        <button
          onClick={scrollToTop}
          type="button"
          className="inline-flex items-center gap-3 px-9 sm:px-11 py-4 sm:py-5 rounded-full font-bold text-white text-base sm:text-lg bg-[#0a1945] hover:bg-[#0f2873] transition-all duration-300 shadow-[0_10px_30px_rgba(10,25,70,0.25)] hover:shadow-[0_14px_35px_rgba(10,25,70,0.35)] hover:-translate-y-1 border border-blue-900/20 cursor-pointer"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </section>
  );
}
