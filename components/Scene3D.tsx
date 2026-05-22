"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { usePackerStore } from "@/store/usePackerStore";
import ContainerBox from "./ContainerBox";
import SmallBox from "./SmallBox";
import ViewControls from "./ViewControls";
import { PlacedBox } from "@/lib/binPacking";

/** Smooth camera controller that listens for "camera-move" events */
function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);
  const lerpProgress = useRef(1);

  const packingResult = usePackerStore((s) => s.packingResult);

  useEffect(() => {
    const handleMove = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      targetPos.current = new THREE.Vector3(...detail.position);
      targetLookAt.current = new THREE.Vector3(...detail.lookAt);
      lerpProgress.current = 0;
    };

    const handleZoomSet = (e: Event) => {
      if (!controlsRef.current || !packingResult) return;
      const targetZoom = (e as CustomEvent).detail;
      const { containerWidth, containerHeight, containerDepth } = packingResult;
      const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
      const baseDist = maxDim * Math.sqrt(3.52);
      
      const targetDist = Math.max(10, Math.min(500, baseDist / (targetZoom / 100)));
      
      const direction = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target).normalize();
      const newPos = new THREE.Vector3().copy(controlsRef.current.target).add(direction.multiplyScalar(targetDist));
      camera.position.copy(newPos);
      controlsRef.current.update();
      lerpProgress.current = 1; // cancel any ongoing lerps
    };

    window.addEventListener("camera-move", handleMove);
    window.addEventListener("zoom-set", handleZoomSet);
    return () => {
      window.removeEventListener("camera-move", handleMove);
      window.removeEventListener("zoom-set", handleZoomSet);
    };
  }, [camera, packingResult]);

  useFrame((_, delta) => {
    if (
      !targetPos.current ||
      !targetLookAt.current ||
      lerpProgress.current >= 1
    )
      return;

    lerpProgress.current = Math.min(lerpProgress.current + delta * 2, 1);
    const t = easeInOutCubic(lerpProgress.current);

    camera.position.lerp(targetPos.current, t * 0.1 + 0.02);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, t * 0.1 + 0.02);
      controlsRef.current.update();
    }
  });

  // Set initial camera position when packing result changes
  useEffect(() => {
    if (!packingResult) return;
    const { containerWidth, containerHeight, containerDepth } = packingResult;
    const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
    const cx = containerWidth / 2;
    const cy = containerHeight / 2;
    const cz = containerDepth / 2;

    camera.position.set(
      cx + maxDim * 1.2,
      cy + maxDim * 0.8,
      cz + maxDim * 1.2
    );
    camera.lookAt(cx, cy, cz);

    if (controlsRef.current) {
      controlsRef.current.target.set(cx, cy, cz);
      controlsRef.current.update();
    }
  }, [packingResult, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={10}
      maxDistance={500}
      makeDefault
      onChange={() => {
        if (!controlsRef.current || !packingResult) return;
        const dist = controlsRef.current.getDistance();
        const { containerWidth, containerHeight, containerDepth } = packingResult;
        const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
        const baseDist = maxDim * Math.sqrt(3.52);
        const zoom = Math.round((baseDist / dist) * 100);
        window.dispatchEvent(new CustomEvent("zoom-change", { detail: zoom }));
      }}
    />
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Grid floor */
function FloorGrid() {
  const packingResult = usePackerStore((s) => s.packingResult);
  if (!packingResult) return null;
  const { containerWidth, containerDepth } = packingResult;
  const maxDim = Math.max(containerWidth, containerDepth);

  return (
    <Grid
      position={[containerWidth / 2, -0.1, containerDepth / 2]}
      args={[maxDim * 3, maxDim * 3]}
      cellSize={10}
      cellThickness={0.4}
      cellColor="#151525"
      sectionSize={50}
      sectionThickness={0.8}
      sectionColor="#1e1e35"
      fadeDistance={maxDim * 4}
      fadeStrength={1}
      infiniteGrid
    />
  );
}

/** Lights */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[100, 200, 100]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-80, 120, -60]} intensity={0.25} color="#c4b5fd" />
      <pointLight position={[0, 150, 0]} intensity={0.3} color="#6ee7b7" distance={400} />
      <pointLight position={[100, 50, 100]} intensity={0.15} color="#38bdf8" distance={300} />
    </>
  );
}

export default function Scene3D() {
  const packingResult = usePackerStore((s) => s.packingResult);
  const hasPacked = usePackerStore((s) => s.hasPacked);
  const [hoveredBox, setHoveredBox] = useState<PlacedBox | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleBoxHover = useCallback(
    (box: PlacedBox | null, event: { clientX: number; clientY: number } | null) => {
      setHoveredBox(box);
      if (event) {
        setTooltipPos({ x: event.clientX, y: event.clientY });
      } else {
        setTooltipPos(null);
      }
    },
    []
  );

  return (
    <div className="flex-1 relative min-h-[300px] lg:min-h-0">
      {/* Subtle gradient overlay at edges */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#08080c]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#08080c]/60 to-transparent" />
      </div>

      {!hasPacked ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center relative">
            {/* Glow backdrop */}
            <div className="absolute inset-0 -m-20 bg-gradient-radial from-accent/[0.03] to-transparent rounded-full blur-3xl" />

            <div className="relative">
              <div className="mb-5 animate-float">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto backdrop-blur-sm shadow-2xl">
                  <svg className="w-9 h-9 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-zinc-400 text-lg font-semibold mb-2">No Visualization Yet</h3>
              <p className="text-zinc-600 text-sm max-w-[280px] leading-relaxed">
                Configure your container and boxes, then click{" "}
                <span className="text-accent font-semibold">&ldquo;Pack &amp; Visualize&rdquo;</span>{" "}
                to see the 3D result.
              </p>

              {/* Decorative dots */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                <div className="w-1 h-1 rounded-full bg-accent/30" />
                <div className="w-1 h-1 rounded-full bg-purple-400/30" />
                <div className="w-1 h-1 rounded-full bg-sky-400/30" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Canvas
            className="canvas-container"
            camera={{ fov: 50, near: 0.1, far: 2000 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor("#08080c");
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.2;
            }}
          >
            <Suspense fallback={null}>
              <CameraController />
              <Lights />
              <FloorGrid />
              <ContainerBox />
              {packingResult?.placed.map((box, i) => (
                <SmallBox
                  key={box.id}
                  box={box}
                  index={i}
                  onHover={handleBoxHover}
                />
              ))}
            </Suspense>
          </Canvas>

          {/* View Controls */}
          {packingResult && (
            <ViewControls
              containerWidth={packingResult.containerWidth}
              containerHeight={packingResult.containerHeight}
              containerDepth={packingResult.containerDepth}
            />
          )}

          {/* Tooltip */}
          {hoveredBox && tooltipPos && (
            <div
              className="tooltip-3d"
              style={{
                left: tooltipPos.x + 14,
                top: tooltipPos.y - 30,
              }}
            >
              <div className="font-sans text-zinc-200 text-xs font-semibold mb-0.5">
                {hoveredBox.label}
              </div>
              <div className="text-accent">
                {hoveredBox.width}×{hoveredBox.height}×{hoveredBox.depth}
              </div>
              <div className="text-zinc-500 text-[10px] mt-0.5">
                pos ({hoveredBox.x.toFixed(0)}, {hoveredBox.y.toFixed(0)}, {hoveredBox.z.toFixed(0)})
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
