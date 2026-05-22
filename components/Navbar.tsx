"use client";

import { usePackerStore } from "@/store/usePackerStore";

export default function Navbar() {
  const { unit, setUnit } = usePackerStore();

  return (
    <nav className="h-14 glass-panel border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 z-50 relative">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/20 shadow-lg shadow-accent/10">
          <svg className="w-[18px] h-[18px] text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <div className="absolute inset-0 rounded-xl bg-accent/5 animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">
            <span className="text-white">Box</span>
            <span className="text-white">Packer</span>
            <span className="gradient-text font-extrabold">Pro</span>
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Unit toggle */}
        <div className="flex items-center rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.03]">
          <button
            onClick={() => setUnit("cm")}
            className={`px-3 py-1.5 text-xs font-mono transition-all duration-300 ${
              unit === "cm"
                ? "bg-accent/15 text-accent shadow-inner shadow-accent/10"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            cm
          </button>
          <div className="w-px h-4 bg-white/[0.06]" />
          <button
            onClick={() => setUnit("inches")}
            className={`px-3 py-1.5 text-xs font-mono transition-all duration-300 ${
              unit === "inches"
                ? "bg-accent/15 text-accent shadow-inner shadow-accent/10"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            in
          </button>
        </div>

        {/* Status badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 border border-white/[0.06] bg-white/[0.02]">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-accent animate-ping opacity-40" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono tracking-wider">v1.0</span>
        </div>
      </div>
    </nav>
  );
}
