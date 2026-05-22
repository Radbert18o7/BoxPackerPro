"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import InputPanel from "@/components/InputPanel";

// Dynamically import Scene3D with SSR disabled (Three.js needs the DOM)
const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#08080c] min-h-[300px]">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-zinc-600 text-xs font-mono tracking-wider uppercase">Initializing 3D Engine</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <InputPanel />
        <Scene3D />
      </div>
    </div>
  );
}
