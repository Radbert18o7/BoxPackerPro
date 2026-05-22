"use client";

import { motion } from "framer-motion";
import { PackingResult } from "@/lib/binPacking";
import { usePackerStore } from "@/store/usePackerStore";

interface SummaryStatsProps {
  result: PackingResult;
}

export default function SummaryStats({ result }: SummaryStatsProps) {
  const unit = usePackerStore((s) => s.unit);
  const totalBoxes = result.placed.length + result.unplaced.length;
  const wastedVolume = result.totalVolume - result.usedVolume;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent mb-5" />

      <h3 className="text-[11px] font-semibold text-accent/90 uppercase tracking-[0.12em] mb-3 flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center">
          <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        Results
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {/* Utilization */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
          <div className="relative">
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Utilization</div>
            <div className="text-xl font-mono font-bold gradient-text">
              {result.utilizationPercent.toFixed(1)}%
            </div>
            <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.utilizationPercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Boxes Packed */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
          <div className="relative">
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Packed</div>
            <div className="text-xl font-mono font-bold text-zinc-100">
              {result.placed.length}
              <span className="text-zinc-600 text-sm font-normal"> / {totalBoxes}</span>
            </div>
          </div>
        </div>

        {/* Used Volume */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Used Vol</div>
          <div className="text-sm font-mono text-zinc-300">
            {result.usedVolume.toLocaleString()}
            <span className="text-zinc-600 text-xs ml-1">{unit}³</span>
          </div>
        </div>

        {/* Wasted Space */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Wasted</div>
          <div className="text-sm font-mono text-zinc-500">
            {wastedVolume.toLocaleString()}
            <span className="text-zinc-600 text-xs ml-1">{unit}³</span>
          </div>
        </div>
      </div>

      {/* Unplaced Warning */}
      {result.unplaced.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3 backdrop-blur-sm"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-red-400 font-semibold">
                {result.unplaced.length} box{result.unplaced.length !== 1 ? "es" : ""} could not fit
              </div>
              <div className="text-[10px] text-red-400/60 mt-0.5">
                Container volume exceeded
              </div>
              <div className="mt-2 space-y-0.5">
                {result.unplaced.map((box) => (
                  <div key={box.id} className="text-[10px] font-mono text-red-400/50">
                    • {box.label} ({box.width}×{box.height}×{box.depth})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
