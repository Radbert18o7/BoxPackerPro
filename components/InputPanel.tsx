"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePackerStore, SmallBoxEntry } from "@/store/usePackerStore";
import SummaryStats from "./SummaryStats";

export default function InputPanel() {
  const {
    containerWidth,
    containerHeight,
    containerDepth,
    setContainerDimensions,
    unit,
    smallBoxes,
    addSmallBox,
    updateSmallBox,
    removeSmallBox,
    clearSmallBoxes,
    runPacking,
    isPacking,
    hasPacked,
    resetPacking,
    containerOpacity,
    setContainerOpacity,
    boxGap,
    setBoxGap,
    packingResult,
  } = usePackerStore();

  const [cw, setCw] = useState(containerWidth.toString());
  const [ch, setCh] = useState(containerHeight.toString());
  const [cd, setCd] = useState(containerDepth.toString());

  const [label, setLabel] = useState("");
  const [bw, setBw] = useState("");
  const [bh, setBh] = useState("");
  const [bd, setBd] = useState("");
  const [qty, setQty] = useState("1");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editW, setEditW] = useState("");
  const [editH, setEditH] = useState("");
  const [editD, setEditD] = useState("");
  const [editQty, setEditQty] = useState("");

  const handleAddBox = () => {
    if (!label.trim() || !bw || !bh || !bd || !qty) return;
    addSmallBox({
      label: label.trim(),
      width: parseFloat(bw),
      height: parseFloat(bh),
      depth: parseFloat(bd),
      quantity: parseInt(qty, 10) || 1,
    });
    setLabel("");
    setBw("");
    setBh("");
    setBd("");
    setQty("1");
  };

  const handlePack = () => {
    const w = parseFloat(cw) || 0;
    const h = parseFloat(ch) || 0;
    const d = parseFloat(cd) || 0;
    if (w <= 0 || h <= 0 || d <= 0) return;
    if (smallBoxes.length === 0) return;
    setContainerDimensions(w, h, d);
    runPacking();
  };

  const handleReset = () => {
    resetPacking();
  };

  const startEditing = (box: SmallBoxEntry) => {
    setEditingId(box.id);
    setEditLabel(box.label);
    setEditW(box.width.toString());
    setEditH(box.height.toString());
    setEditD(box.depth.toString());
    setEditQty(box.quantity.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = () => {
    if (!editingId) return;
    const w = parseFloat(editW);
    const h = parseFloat(editH);
    const d = parseFloat(editD);
    const q = parseInt(editQty, 10);
    if (!editLabel.trim() || isNaN(w) || isNaN(h) || isNaN(d) || isNaN(q)) return;
    if (w <= 0 || h <= 0 || d <= 0 || q <= 0) return;
    updateSmallBox(editingId, {
      label: editLabel.trim(),
      width: w,
      height: h,
      depth: d,
      quantity: q,
    });
    setEditingId(null);
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 focus:bg-white/[0.05] transition-all duration-200";

  const editInputClass =
    "w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200";

  return (
    <div className="w-full lg:w-[400px] xl:w-[440px] h-auto lg:h-full glass-panel border-r-0 lg:border-r border-white/[0.06] flex flex-col overflow-hidden relative z-10 mobile-panel">
      {/* Decorative gradient line at top */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-purple-500" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.15em]">
            Configuration
          </h2>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.06]">
          {smallBoxes.length} items
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Container Dimensions */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-[11px] font-semibold text-accent/90 uppercase tracking-[0.12em] flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            Container ({unit})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">Width</label>
              <input type="number" value={cw} onChange={(e) => setCw(e.target.value)} placeholder="W" className={inputClass} min={1} />
            </div>
            <div>
              <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">Height</label>
              <input type="number" value={ch} onChange={(e) => setCh(e.target.value)} placeholder="H" className={inputClass} min={1} />
            </div>
            <div>
              <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">Depth</label>
              <input type="number" value={cd} onChange={(e) => setCd(e.target.value)} placeholder="D" className={inputClass} min={1} />
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Add Small Box Form */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-[11px] font-semibold text-accent/90 uppercase tracking-[0.12em] flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add Box ({unit})
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label / Name"
              className={inputClass}
            />
            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">W</label>
                <input type="number" value={bw} onChange={(e) => setBw(e.target.value)} placeholder="W" className={inputClass} min={1} />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">H</label>
                <input type="number" value={bh} onChange={(e) => setBh(e.target.value)} placeholder="H" className={inputClass} min={1} />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">D</label>
                <input type="number" value={bd} onChange={(e) => setBd(e.target.value)} placeholder="D" className={inputClass} min={1} />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 block font-medium">Qty</label>
                <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="#" className={inputClass} min={1} />
              </div>
            </div>
            <button
              onClick={handleAddBox}
              disabled={!label.trim() || !bw || !bh || !bd}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/[0.07] hover:border-accent/30 hover:text-accent transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Box
            </button>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Box List */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold text-accent/90 uppercase tracking-[0.12em] flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              Boxes ({smallBoxes.length})
            </h3>
            {smallBoxes.length > 0 && (
              <button
                onClick={clearSmallBoxes}
                className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border border-transparent hover:border-red-400/20 hover:bg-red-400/5"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[240px] lg:max-h-[280px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {smallBoxes.map((box, idx) => (
                <motion.div
                  key={box.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  layout
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all duration-300"
                >
                  {editingId === box.id ? (
                    /* ── Editing Mode ── */
                    <div className="p-3 space-y-2 bg-white/[0.02]">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Label"
                        className={editInputClass}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing();
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[8px] text-zinc-600 uppercase block mb-0.5 font-medium">W</label>
                          <input type="number" value={editW} onChange={(e) => setEditW(e.target.value)} className={editInputClass} min={1}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEditing(); if (e.key === "Escape") cancelEditing(); }} />
                        </div>
                        <div>
                          <label className="text-[8px] text-zinc-600 uppercase block mb-0.5 font-medium">H</label>
                          <input type="number" value={editH} onChange={(e) => setEditH(e.target.value)} className={editInputClass} min={1}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEditing(); if (e.key === "Escape") cancelEditing(); }} />
                        </div>
                        <div>
                          <label className="text-[8px] text-zinc-600 uppercase block mb-0.5 font-medium">D</label>
                          <input type="number" value={editD} onChange={(e) => setEditD(e.target.value)} className={editInputClass} min={1}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEditing(); if (e.key === "Escape") cancelEditing(); }} />
                        </div>
                        <div>
                          <label className="text-[8px] text-zinc-600 uppercase block mb-0.5 font-medium">Qty</label>
                          <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className={editInputClass} min={1}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEditing(); if (e.key === "Escape") cancelEditing(); }} />
                        </div>
                      </div>
                      <div className="flex gap-1.5 pt-0.5">
                        <button onClick={saveEditing}
                          className="flex-1 bg-accent/15 border border-accent/25 text-accent rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-accent/25 transition-all flex items-center justify-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </button>
                        <button onClick={cancelEditing}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] text-zinc-400 rounded-lg px-2 py-1.5 text-xs font-medium hover:text-zinc-200 hover:border-white/[0.12] transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Display Mode ── */
                    <div className="flex items-center justify-between px-3 py-2.5 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{
                          background: `linear-gradient(135deg, ${['#f472b6','#60a5fa','#facc15','#a78bfa','#fb923c','#34d399'][idx % 6]}, ${['#ec4899','#3b82f6','#eab308','#8b5cf6','#f97316','#10b981'][idx % 6]})`
                        }} />
                        <span className="text-sm text-zinc-200 truncate font-medium">
                          {box.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0 bg-white/[0.03] px-1.5 py-0.5 rounded-md">
                          {box.width}×{box.height}×{box.depth}
                        </span>
                        <span className="text-[10px] font-mono text-accent/60 flex-shrink-0">
                          ×{box.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button onClick={() => startEditing(box)}
                          className="text-zinc-600 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-accent/10" title="Edit box">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => removeSmallBox(box.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10" title="Delete box">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {smallBoxes.length === 0 && (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-zinc-600 text-xs">No boxes added yet</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Global Settings (Opacity & Gap) */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Opacity */}
          <div>
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-white/[0.05] flex items-center justify-center">
                <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              Opacity
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.01"
                value={containerOpacity}
                onChange={(e) => setContainerOpacity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] font-mono text-zinc-500 w-10 text-right bg-white/[0.03] px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                {Math.round(containerOpacity * 100)}%
              </span>
            </div>
          </div>

          {/* Tolerance/Gap */}
          <div>
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-2.5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-white/[0.05] flex items-center justify-center">
                <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              Box Tolerance ({unit})
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={boxGap}
                onChange={(e) => setBoxGap(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] font-mono text-zinc-500 w-12 text-right bg-white/[0.03] px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                {boxGap.toFixed(1)} {unit}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Summary Stats */}
        {hasPacked && packingResult && <SummaryStats result={packingResult} />}
      </div>

      {/* Bottom Actions */}
      <div className="px-5 py-4 border-t border-white/[0.06] space-y-2 bg-white/[0.01]">
        <button
          onClick={handlePack}
          disabled={isPacking || smallBoxes.length === 0}
          className="glow-btn w-full bg-gradient-to-r from-accent to-emerald-400 hover:from-accent hover:to-teal-300 text-[#0a0a0f] font-bold rounded-xl px-4 py-3 text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98]"
        >
          {isPacking ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#0a0a0f' }} />
              Packing...
            </>
          ) : (
            <>
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pack &amp; Visualize
            </>
          )}
        </button>
        {hasPacked && (
          <button
            onClick={handleReset}
            className="w-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 rounded-xl px-4 py-2.5 text-sm hover:text-zinc-200 hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
