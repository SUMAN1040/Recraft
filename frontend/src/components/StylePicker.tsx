"use client";

import React from "react";
import { Sparkles, Box, Compass, Layers, Camera, Grid, PenTool } from "lucide-react";

export interface StyleItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  palette: string[];
  gradient: string;
}

export const RECRAFT_STYLES: StyleItem[] = [
  {
    id: "vector_art",
    name: "Vector Art",
    description: "Crisp editable curves, flat & 2.5D vectors, pure SVG",
    icon: Compass,
    palette: ["#FF5C00", "#FFB800", "#1A1A24", "#4E54C8"],
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "3d_render",
    name: "3D Render",
    description: "Isometric perspective, raytraced highlights, clay & glass",
    icon: Box,
    palette: ["#3B82F6", "#8B5CF6", "#EC4899", "#1E1B4B"],
    gradient: "from-blue-500 to-purple-600",
  },
  {
    id: "digital_illustration",
    name: "Digital Illustration",
    description: "Rich gradients, expressive textures, concept art",
    icon: Sparkles,
    palette: ["#8A2387", "#E94057", "#F27121", "#06B6D4"],
    gradient: "from-fuchsia-500 to-rose-500",
  },
  {
    id: "icon_set",
    name: "Icon Set",
    description: "Cohesive app & web glyphs, clean stroke weights",
    icon: Layers,
    palette: ["#10B981", "#065F46", "#ECFDF5", "#34D399"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "realistic_image",
    name: "Photorealism",
    description: "Studio lighting, depth of field, realistic textures",
    icon: Camera,
    palette: ["#1F2937", "#4B5563", "#9CA3AF", "#F3F4F6"],
    gradient: "from-gray-500 to-slate-400",
  },
  {
    id: "pixel_art",
    name: "Pixel Art",
    description: "Crisp retro gaming aesthetic with dynamic lighting",
    icon: Grid,
    palette: ["#EF4444", "#10B981", "#3B82F6", "#F59E0B"],
    gradient: "from-red-500 to-yellow-500",
  },
  {
    id: "line_art",
    name: "Line Art",
    description: "Single-stroke elegance, minimal black & white",
    icon: PenTool,
    palette: ["#09090B", "#27272A", "#FAFAFA", "#71717A"],
    gradient: "from-zinc-400 to-zinc-600",
  },
];

interface StylePickerProps {
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
  compact?: boolean;
}

export function StylePicker({ selectedStyle, onSelectStyle, compact = false }: StylePickerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {RECRAFT_STYLES.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/30"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {style.name}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {RECRAFT_STYLES.map((style) => {
        const Icon = style.icon;
        const isSelected = selectedStyle === style.id;
        return (
          <div
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
              isSelected
                ? "border-[#FF5C00] bg-[#FF5C00]/10 shadow-lg shadow-[#FF5C00]/15"
                : "border-white/10 bg-[#14151e] hover:border-white/20 hover:bg-[#1a1b26]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${style.gradient} text-white shadow-md`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {/* Palette dots */}
              <div className="flex -space-x-1">
                {style.palette.slice(0, 3).map((col, idx) => (
                  <div
                    key={idx}
                    className="h-3.5 w-3.5 rounded-full border border-black/40"
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <h4 className="mt-3 text-sm font-bold text-white group-hover:text-[#FF5C00] transition-colors">
              {style.name}
            </h4>
            <p className="mt-1 text-xs text-gray-400 line-clamp-2">
              {style.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
