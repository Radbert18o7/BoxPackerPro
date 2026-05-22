"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges, RoundedBox } from "@react-three/drei";
import { usePackerStore } from "@/store/usePackerStore";

export default function ContainerBox() {
  const containerOpacity = usePackerStore((s) => s.containerOpacity);
  const packingResult = usePackerStore((s) => s.packingResult);

  if (!packingResult) return null;

  const { containerWidth, containerHeight, containerDepth } = packingResult;
  const meshRef = useRef<THREE.Mesh>(null);

  // Center the container so (0,0,0) is the bottom-left-back corner visually
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const cz = containerDepth / 2;

  return (
    <group position={[cx, cy, cz]}>
      {/* Semi-transparent fill with rounded edges */}
      <RoundedBox 
        ref={meshRef as any} 
        args={[containerWidth, containerHeight, containerDepth]}
        radius={0.3}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={containerOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </RoundedBox>

      {/* Wireframe edges always at full opacity */}
      <mesh>
        <boxGeometry args={[containerWidth, containerHeight, containerDepth]} />
        <meshBasicMaterial visible={false} />
        <Edges
          scale={1}
          threshold={15}
          color="#ffffff"
          lineWidth={1.5}
        />
      </mesh>
    </group>
  );
}
