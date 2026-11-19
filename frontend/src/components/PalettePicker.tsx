"use client";

import React, { useState } from "react";
import { Palette, Check, Plus, Trash2 } from "lucide-react";

export const PRESET_PALETTES = [
  { name: "Recraft Blaze", colors: ["#FF5C00", "#FFB800", "#1A1A24", "#00E5FF"] },
  { name: "Cyber Neon", colors: ["#00F5D4", "#7B2CBF", "#F72585", "#0F1015"] },
  { name: "Emerald Tech", colors: ["#10B981", "#064E3B", "#6EE7B7", "#0F172A"] },
  { name: "Sunset Gold", colors: ["#F97316", "#FB7185", "#FBBF24", "#1E1B4B"] },
  { name: "Minimal Mono", colors: ["#09090B", "#27272A", "#71717A", "#FFFFFF"] },
];

interface PalettePickerProps {
  currentPalette: string[];
  onChangePalette: (colors: string[]) => void;
}

export function PalettePicker({ currentPalette, onChangePalette }: PalettePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newColor, setNewColor] = useState("#FF5C00");

  function handleAddColor() {
    if (currentPalette.length < 6 && !currentPalette.includes(newColor)) {
      onChangePalette([...currentPalette, newColor]);
    }
  }

  function handleRemoveColor(index: number) {
    if (currentPalette.length > 2) {
      onChangePalette(currentPalette.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-white/10 transition-all"
      >
        <Palette className="h-3.5 w-3.5 text-[#FF5C00]" />
        <span>Palette</span>
        <div className="flex -space-x-1">
          {currentPalette.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full border border-black/40"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl border border-white/10 bg-[#161720] p-4 shadow-2xl z-50">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-[#FF5C00]" /> Brand Palette
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Current Swatches */}
          <div className="mt-3">
            <span className="text-[11px] text-gray-400">Active Colors ({currentPalette.length}/6)</span>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {currentPalette.map((color, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className="h-7 w-7 rounded-lg border border-white/20 shadow-sm cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                  {currentPalette.length > 2 && (
                    <button
                      onClick={() => handleRemoveColor(idx)}
                      className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="mt-4">
            <span className="text-[11px] text-gray-400">Curated Presets</span>
            <div className="space-y-1.5 mt-1.5">
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onChangePalette(preset.colors)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition-colors"
                >
                  <span className="text-gray-300 font-medium">{preset.name}</span>
                  <div className="flex -space-x-1">
                    {preset.colors.map((c, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Hex Picker */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-7 w-7 rounded border-0 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white uppercase font-mono"
            />
            <button
              onClick={handleAddColor}
              disabled={currentPalette.length >= 6}
              className="px-2.5 py-1 rounded-lg bg-[#FF5C00] text-white text-xs font-bold hover:brightness-110 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
