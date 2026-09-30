"use client";

import { useEffect, type ReactNode } from "react";
import LocomotiveScroll from "locomotive-scroll";
import { setSmoothScroll } from "@/lib/smoothScroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const scroll = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.09,
      },
    });
    setSmoothScroll(scroll);

    return () => {
      setSmoothScroll(null);
      scroll.destroy();
    };
  }, []);

  return <>{children}</>;
}
