"use client";

import React, { useState } from "react";
import { ZoomIn, CheckCircle2, AlertCircle } from "lucide-react";

export function VectorComparisonSlider() {
  const [zoomLevel, setZoomLevel] = useState<number>(400); // 100% to 800%
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#12131a] p-6 lg:p-8 shadow-2xl overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold text-[#FF5C00]">
            Signature Recraft Engine
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Infinite Vector Scalability vs. Pixelated Raster
          </h3>
          <p className="text-sm text-gray-400">
            Zoom up to 800% without loss of quality. Export production-ready SVGs with editable control points.
          </p>
        </div>

        {/* Zoom Selector */}
        <div className="flex items-center gap-3 bg-[#181922] px-4 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
          <ZoomIn className="h-4 w-4 text-[#FF5C00]" />
          <span className="text-xs font-semibold text-gray-300">Zoom: {zoomLevel}%</span>
          <input
            type="range"
            min="100"
            max="800"
            step="50"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-24 accent-[#FF5C00] cursor-pointer"
          />
        </div>
      </div>

      {/* Comparison Visualizer Container */}
      <div className="relative mt-6 h-80 sm:h-96 w-full rounded-xl overflow-hidden border border-white/10 select-none bg-[#090A0E]">
        {/* Left Side: Recraft Clean Vector (Infinite resolution) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <div
            className="transition-transform duration-150"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* High fidelity pure vector SVG */}
            <svg width="220" height="220" viewBox="0 0 220 220">
              <defs>
                <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5C00" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <circle cx="110" cy="110" r="85" fill="url(#vGrad)" />
              <polygon points="110,40 170,160 50,160" fill="#00E5FF" opacity="0.9" />
              <circle cx="110" cy="120" r="30" fill="#FFFFFF" />
              <path d="M70,140 Q110,70 150,140" stroke="#111827" strokeWidth="8" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          {/* Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Recraft Vector (Crisp SVG)
          </div>
        </div>

        {/* Right Side: Standard AI Raster (Pixelated at zoom) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0F1015]"
          style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
        >
          <div
            className="transition-transform duration-150"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              imageRendering: zoomLevel > 200 ? "pixelated" : "auto",
              filter: zoomLevel > 200 ? "blur(1.5px) contrast(1.2)" : "none",
            }}
          >
            {/* Simulated raster image representation */}
            <div className="w-[220px] h-[220px] rounded-full bg-gradient-to-br from-[#FF5C00] to-[#8B5CF6] flex items-center justify-center relative overflow-hidden opacity-80">
              <div className="w-24 h-24 bg-[#00E5FF] rotate-45" />
              <div className="absolute w-14 h-14 bg-white rounded-full" />
            </div>
          </div>

          {/* Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-rose-500/20 backdrop-blur-md border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Standard AI (Blurry Raster JPEG)
          </div>
        </div>

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] cursor-ew-resize z-20"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
            ↔
          </div>
        </div>

        {/* Interactive Overlay to drag slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
        />
      </div>

      {/* Footer Specs */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <span className="block text-[11px] text-gray-400">File Format</span>
          <span className="text-xs font-bold text-white">Pure Scalable .SVG</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <span className="block text-[11px] text-gray-400">Compatibility</span>
          <span className="text-xs font-bold text-white">Figma, Illustrator, Web</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <span className="block text-[11px] text-gray-400">Resolution</span>
          <span className="text-xs font-bold text-emerald-400">Mathematically Infinite</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <span className="block text-[11px] text-gray-400">Security Proof</span>
          <span className="text-xs font-bold text-[#00E5FF]">Keccak-256 On-Chain</span>
        </div>
      </div>
    </div>
  );
}
