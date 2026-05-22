"use client";

import { create } from "zustand";
import {
  packBoxes,
  PackingResult,
  BoxInput,
  PlacedBox,
} from "@/lib/binPacking";
import { getBoxColor } from "@/lib/colors";

export type UnitType = "cm" | "inches";

export interface SmallBoxEntry {
  id: string;
  label: string;
  width: number;
  height: number;
  depth: number;
  quantity: number;
}

interface PackerState {
  // Container dimensions
  containerWidth: number;
  containerHeight: number;
  containerDepth: number;
  setContainerDimensions: (w: number, h: number, d: number) => void;

  // Unit
  unit: UnitType;
  setUnit: (unit: UnitType) => void;

  // Small boxes
  smallBoxes: SmallBoxEntry[];
  addSmallBox: (box: Omit<SmallBoxEntry, "id">) => void;
  updateSmallBox: (id: string, updates: Partial<Omit<SmallBoxEntry, "id">>) => void;
  removeSmallBox: (id: string) => void;
  clearSmallBoxes: () => void;

  // Packing result
  packingResult: PackingResult | null;
  isPacking: boolean;
  hasPacked: boolean;

  // Container opacity
  containerOpacity: number;
  setContainerOpacity: (opacity: number) => void;

  // Box packing tolerance (gap)
  boxGap: number;
  setBoxGap: (gap: number) => void;

  // Actions
  runPacking: () => void;
  resetPacking: () => void;
}

let boxIdCounter = 0;
function generateId(): string {
  boxIdCounter += 1;
  return `box-${Date.now()}-${boxIdCounter}`;
}

// Default demo data
const defaultSmallBoxes: SmallBoxEntry[] = [
  { id: "demo-1", label: "Box A", width: 20, height: 20, depth: 20, quantity: 4 },
  { id: "demo-2", label: "Box B", width: 30, height: 15, depth: 10, quantity: 3 },
  { id: "demo-3", label: "Box C", width: 10, height: 10, depth: 10, quantity: 6 },
];

export const usePackerStore = create<PackerState>((set, get) => ({
  // Default container
  containerWidth: 100,
  containerHeight: 80,
  containerDepth: 60,
  setContainerDimensions: (w, h, d) =>
    set({ containerWidth: w, containerHeight: h, containerDepth: d }),

  // Unit
  unit: "cm",
  setUnit: (unit) => set({ unit }),

  // Small boxes with demo data
  smallBoxes: defaultSmallBoxes,

  addSmallBox: (box) => {
    const newBox: SmallBoxEntry = { ...box, id: generateId() };
    set((state) => ({ smallBoxes: [...state.smallBoxes, newBox] }));
  },

  updateSmallBox: (id, updates) => {
    set((state) => ({
      smallBoxes: state.smallBoxes.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  },

  removeSmallBox: (id) => {
    set((state) => ({
      smallBoxes: state.smallBoxes.filter((b) => b.id !== id),
    }));
  },

  clearSmallBoxes: () => set({ smallBoxes: [] }),

  // Packing
  packingResult: null,
  isPacking: false,
  hasPacked: false,

  containerOpacity: 0.12,
  setContainerOpacity: (opacity) => set({ containerOpacity: opacity }),

  boxGap: 0,
  setBoxGap: (gap) => set({ boxGap: gap }),

  runPacking: () => {
    const state = get();
    set({ isPacking: true });

    // Small delay so the UI can show the spinner
    setTimeout(() => {
      // Expand quantities into individual BoxInput items
      const expandedBoxes: BoxInput[] = [];
      const labelColorMap = new Map<string, string>();
      let colorIndex = 0;

      state.smallBoxes.forEach((entry) => {
        if (!labelColorMap.has(entry.label)) {
          labelColorMap.set(entry.label, getBoxColor(colorIndex));
          colorIndex++;
        }
        const color = labelColorMap.get(entry.label)!;
        for (let i = 0; i < entry.quantity; i++) {
          expandedBoxes.push({
            id: `${entry.id}-${i}`,
            label: entry.label,
            width: entry.width,
            height: entry.height,
            depth: entry.depth,
            color,
          });
        }
      });

      const result = packBoxes(
        state.containerWidth,
        state.containerHeight,
        state.containerDepth,
        expandedBoxes,
        state.boxGap
      );

      set({
        packingResult: result,
        isPacking: false,
        hasPacked: true,
      });
    }, 100);
  },

  resetPacking: () =>
    set({
      packingResult: null,
      isPacking: false,
      hasPacked: false,
    }),
}));
