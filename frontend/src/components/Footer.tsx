import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-blue-100 py-8 text-center text-slate-500 text-sm px-4 bg-[#f8fafd]">
      <p>© {new Date().getFullYear()} Vibe Studio · Built with AI · All rights reserved.</p>
    </footer>
  );
}
