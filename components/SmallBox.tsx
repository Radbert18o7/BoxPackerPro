"use client";

import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text, Edges, Billboard, RoundedBox } from "@react-three/drei";
import { PlacedBox } from "@/lib/binPacking";
import { usePackerStore } from "@/store/usePackerStore";

interface SmallBoxProps {
  box: PlacedBox;
  index: number;
  onHover?: (box: PlacedBox | null, event: { clientX: number; clientY: number } | null) => void;
}

export default function SmallBox({ box, index, onHover }: SmallBoxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isPopped, setIsPopped] = useState(false);
  const containerDepth = usePackerStore((s) => s.packingResult?.containerDepth || 100);

  // Animation state
  const isEntering = useRef(true);
  const animProgress = useRef(0);
  const startDelay = index * 0.08; // 80ms stagger
  const animDuration = 0.6;
  
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const cz = box.z + box.depth / 2;

  const startY = cy + 30; // Start 30 units above final position
  const targetVec = useMemo(() => new THREE.Vector3(), []);

  // Ease-out cubic
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isEntering.current) {
      animProgress.current += delta;
      const elapsed = animProgress.current - startDelay;
      if (elapsed < 0) {
        groupRef.current.position.set(cx, startY, cz);
        groupRef.current.scale.setScalar(0);
        return;
      }

      const t = Math.min(elapsed / animDuration, 1);
      const eased = easeOutCubic(t);

      groupRef.current.position.set(cx, startY + (cy - startY) * eased, cz);
      groupRef.current.scale.setScalar(eased);

      if (t >= 1) isEntering.current = false;
    } else {
      // Normal / Popped out state
      const popZ = Math.max(containerDepth + 30, cz + 40);
      targetVec.set(cx, cy, isPopped ? popZ : cz);
      groupRef.current.position.lerp(targetVec, 8 * delta);
    }
  });

  // Darken color slightly for edge highlight
  const edgeColor = useMemo(() => {
    const c = new THREE.Color(box.color);
    c.multiplyScalar(0.6);
    return `#${c.getHexString()}`;
  }, [box.color]);

  return (
    <group ref={groupRef}>
      <RoundedBox
        args={[box.renderWidth, box.renderHeight, box.renderDepth]}
        radius={0.2}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          setIsPopped(!isPopped);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
          if (onHover) {
            onHover(box, { clientX: (e as any).clientX ?? 0, clientY: (e as any).clientY ?? 0 });
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
          if (onHover) onHover(null, null);
        }}
        onPointerMove={(e) => {
          if (hovered && onHover) {
            onHover(box, { clientX: (e as any).clientX ?? 0, clientY: (e as any).clientY ?? 0 });
          }
        }}
      >
        <meshStandardMaterial
          color={box.color}
          roughness={0.65}
          metalness={0.1}
          emissive={hovered || isPopped ? box.color : "#000000"}
          emissiveIntensity={isPopped ? 0.3 : hovered ? 0.15 : 0}
        />
        <Edges
          scale={1.001}
          threshold={15}
          color={edgeColor}
          lineWidth={1}
        />
      </RoundedBox>

      {/* Billboard Label relative to the group center */}
      <Billboard position={[0, box.height / 2 + 3, 0]}>
        <Text
          fontSize={3.5}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineColor="#000000"
          outlineWidth={0.3}
        >
          {box.label}
        </Text>
      </Billboard>
    </group>
  );
}
