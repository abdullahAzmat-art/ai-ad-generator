"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Wand2 } from "lucide-react";

export default function HeroSection() {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsGenerating(true);
    
    // Smooth transition: show spinner briefly then slide/navigate to the ads showcase page
    setTimeout(() => {
      router.push(`/ads?url=${encodeURIComponent(url)}`);
    }, 800);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 pt-16 pb-24">
      
      {/* Ambient Soft Navy Blue Cloud Background for Off-White Theme */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-[1100px] h-[650px] flex items-center justify-center">
          {/* Base light navy ambient tint */}
          <div className="absolute w-[800px] h-[420px] bg-[#dbeafe] rounded-[100%] blur-[130px] opacity-75 animate-smoke" />
          {/* Core soft blue cloud */}
          <div className="absolute w-[620px] h-[520px] bg-[#bfdbfe] rounded-[100%] blur-[150px] opacity-50 animate-smoke animation-delay-2000" />
          {/* Shifting inner cloud */}
          
          {/* Small Floating Navy/Blue Orb */}
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[1200px] text-center">
        
        {/* Small Label */}
        <span className="text-blue-800/80 font-semibold tracking-[0.22em] text-xs sm:text-sm md:text-base uppercase mb-6 md:mb-8 animate-fade-in-up">
          Vibe Studio
        </span>

        {/* Main Headline (Dark Navy Blue) */}
        <h1 className="text-[2.8rem] sm:text-[4rem] md:text-[85px] lg:text-[115px] font-black text-[#0a1945] tracking-tighter mb-10 md:mb-14 leading-[0.92] drop-shadow-sm animate-fade-in-up animation-delay-200 opacity-0 fill-mode-forwards">
          One Link &nbsp; <br className="hidden sm:inline" /> Instant Ads.
        </h1>

        {/* Glassy Input Bar Form (Crisp White) */}
        <form
          onSubmit={handleGenerate}
          className="w-full max-w-3xl relative flex items-center bg-white/90 backdrop-blur-2xl border border-blue-200/80 rounded-full p-2 sm:p-2.5 transition-all duration-300 focus-within:border-blue-600/70 focus-within:bg-white shadow-[0_10px_45px_rgba(10,25,70,0.08)] animate-fade-in-up animation-delay-400 opacity-0 fill-mode-forwards"
        >
          {/* Wand Icon */}
          <div className="pl-4 sm:pl-6 pr-2 sm:pr-3 text-blue-700 hidden sm:block">
            <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* URL Input */}
          <input
            id="url-input"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your website URL"
            className="flex-1 bg-transparent border-none outline-none text-[#0a1945] placeholder:text-slate-400 px-3 sm:px-4 py-3 md:py-4 text-base md:text-xl font-medium w-full"
          />

          {/* Generate Ads Button (Dark Navy Blue) */}
          <button
            disabled={isGenerating}
            type="submit"
            className="group relative px-6 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold text-white transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed ml-2 shrink-0 flex items-center justify-center min-w-[150px] sm:min-w-[190px] shadow-[0_10px_25px_rgba(10,25,70,0.25)] hover:shadow-[0_14px_30px_rgba(10,25,70,0.35)] hover:-translate-y-0.5 text-base sm:text-lg cursor-pointer"
          >
            {/* Navy Blue Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1945] via-[#0f2873] to-[#1e3a8a] transition-all duration-500" />

            {/* Hover Navy Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#071233] via-[#0a1945] to-[#152e6d] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Light Shimmer Beam */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite] skew-x-[-20deg]" />

            {/* Subtle Inner Glow Border */}
            <div className="absolute inset-0 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Button Label & Icon */}
            <span className="relative z-10 flex items-center gap-2.5 drop-shadow-sm">
              {isGenerating ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Generate Ads</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
          </button>
        </form>

      </div>
    </section>
  );
}
