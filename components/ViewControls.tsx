"use client";

import { useEffect, useState } from "react";

interface ViewControlsProps {
  containerWidth: number;
  containerHeight: number;
  containerDepth: number;
}

export default function ViewControls({
  containerWidth,
  containerHeight,
  containerDepth,
}: ViewControlsProps) {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const handler = (e: Event) => setZoom((e as CustomEvent).detail);
    window.addEventListener("zoom-change", handler);
    return () => window.removeEventListener("zoom-change", handler);
  }, []);

  const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const centerZ = containerDepth / 2;

  const views = [
    {
      label: "Iso",
      title: "Isometric View",
      position: [centerX + maxDim * 1.2, centerY + maxDim * 0.8, centerZ + maxDim * 1.2],
    },
    {
      label: "Front",
      title: "Front View",
      position: [centerX, centerY, centerZ + maxDim * 2],
    },
    {
      label: "Top",
      title: "Top View",
      position: [centerX, centerY + maxDim * 2, centerZ + 0.01],
    },
    {
      label: "Side",
      title: "Side View",
      position: [centerX + maxDim * 2, centerY, centerZ],
    },
  ];

  const emitCameraMove = (position: number[], lookAt: number[]) => {
    window.dispatchEvent(
      new CustomEvent("camera-move", {
        detail: { position, lookAt },
      })
    );
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 bg-[#0a0a10]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-2 py-1.5 shadow-2xl">
      {views.map((view) => (
        <button
          key={view.label}
          title={view.title}
          onClick={() =>
            emitCameraMove(view.position, [centerX, centerY, centerZ])
          }
          className="text-zinc-500 hover:text-accent hover:bg-accent/10 rounded-xl px-3 py-1.5 text-[11px] font-mono font-medium transition-all duration-200 active:scale-95"
        >
          {view.label}
        </button>
      ))}
      <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
      <button
        title="Reset Camera"
        onClick={() =>
          emitCameraMove(
            [centerX + maxDim * 1.2, centerY + maxDim * 0.8, centerZ + maxDim * 1.2],
            [centerX, centerY, centerZ]
          )
        }
        className="text-zinc-500 hover:text-accent hover:bg-accent/10 rounded-xl p-1.5 transition-all duration-200 active:scale-95"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
      <div className="flex items-center gap-1.5 px-1 group">
        <input
          type="range"
          min="20"
          max="300"
          value={zoom}
          onChange={(e) => {
            const newZoom = parseInt(e.target.value, 10);
            window.dispatchEvent(new CustomEvent("zoom-set", { detail: newZoom }));
          }}
          className="w-16 h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all opacity-70 group-hover:opacity-100"
        />
        <div className="text-[10px] font-mono text-zinc-400 min-w-[32px] text-right select-none font-medium">
          {zoom}%
        </div>
      </div>
    </div>
  );
}
