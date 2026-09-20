"use client";

import React, { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import HdQualitySection from "@/components/HdQualitySection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  // IntersectionObserver hook for smooth scroll reveal across all sections
  useEffect(() => {
    const elements = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0a1945] flex flex-col font-sans selection:bg-blue-800 selection:text-white">
      {/* 1. Hero Section (Input form, moving ball, dark navy ambient smoke) */}
      <HeroSection />

      {/* 2. How It Works Section (01 -> 02 -> 03 Steps) */}
      <HowItWorksSection />

      {/* 3. HD Quality Ads Section */}
      <HdQualitySection />

      {/* 4. Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* 5. Call To Action (Bottom section) */}
      <CtaSection />

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}