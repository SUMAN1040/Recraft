"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StylePicker, RECRAFT_STYLES } from "@/components/StylePicker";
import { PalettePicker, PRESET_PALETTES } from "@/components/PalettePicker";
import { Web3SecurityModal } from "@/components/Web3SecurityModal";
import { api, GenerationResponse } from "@/lib/api";
import {
  Sparkles,
  MousePointer,
  Hand,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  Shield,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  Lock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  FolderOpen,
  Sliders,
  Code,
} from "lucide-react";

interface CanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  svgData: string;
  imageUrl?: string;
  prompt: string;
  stylePreset: string;
  contentHash: string;
  promptHash: string;
  isMinted?: boolean;
}

export default function StudioCanvasPage() {
  // Canvas viewport navigation
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<"select" | "pan">("select");
  const [startPanPos, setStartPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Prompt dock state
  const [prompt, setPrompt] = useState<string>("isometric 3d glass neon cube with holographic core");
  const [selectedStyle, setSelectedStyle] = useState<string>("3d_render");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [activePalette, setActivePalette] = useState<string[]>(PRESET_PALETTES[0].colors);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("recraft_local");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState<boolean>(false);

  const AI_PROVIDERS = [
    { id: "recraft_local", name: "Recraft V3 Vector", badge: "Native SVG" },
    { id: "claude", name: "Anthropic Claude 3.5", badge: "SVG Coder" },
    { id: "gemini", name: "Google Imagen 3 / Gemini", badge: "High Res" },
    { id: "openai", name: "ChatGPT / DALL-E 3", badge: "Detailed" },
    { id: "stability", name: "Stability AI SD3", badge: "Diffusion" },
    { id: "replicate", name: "Replicate Flux.1", badge: "Fast" },
  ];

  // Canvas elements
  const [elements, setElements] = useState<CanvasItem[]>([
    {
      id: "demo-item-1",
      x: 180,
      y: 120,
      width: 420,
      height: 420,
      prompt: "cyberpunk robot cat in clean vector style",
      stylePreset: "vector_art",
      contentHash: "0x89a1c72f10b392d4e8c1873491f098ab12e45cf7819034267abecfa43901bca2",
      promptHash: "0x34f9a01bce231945a90184b91238910459a019284192049102491a091240192a",
      svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
        <rect width="800" height="800" fill="#0F1015"/>
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF5C00" />
            <stop offset="100%" stop-color="#8F94FB" />
          </linearGradient>
        </defs>
        <polygon points="400,220 260,520 540,520" fill="url(#g1)" opacity="0.95"/>
        <polygon points="300,340 240,160 360,280" fill="#FFB800"/>
        <polygon points="500,340 560,160 440,280" fill="#FF5C00"/>
        <circle cx="340" cy="400" r="10" fill="#FFFFFF"/>
        <circle cx="460" cy="400" r="10" fill="#FFFFFF"/>
        <polygon points="400,450 365,420 435,420" fill="#00E5FF"/>
      </svg>`,
    },
  ]);

  // Selected element for dragging / inspection
  const [selectedElementId, setSelectedElementId] = useState<string | null>("demo-item-1");
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Web3 security modal
  const [securityModalItem, setSecurityModalItem] = useState<CanvasItem | null>(null);

  // Vectorizer file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVectorizing, setIsVectorizing] = useState<boolean>(false);

  // Generation handler
  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await api.generateArtwork({
        prompt,
        style_preset: selectedStyle,
        aspect_ratio: aspectRatio,
        palette_colors: activePalette,
        provider: selectedProvider,
      });

      // Place newly generated artwork side-by-side on canvas
      const lastItem = elements[elements.length - 1];
      const newX = lastItem ? lastItem.x + lastItem.width + 60 : 180;
      const newY = lastItem ? lastItem.y : 120;

      const newItem: CanvasItem = {
        id: res.id,
        x: newX,
        y: newY,
        width: 420,
        height: 420,
        svgData: res.svg_data,
        imageUrl: res.image_url,
        prompt: res.prompt,
        stylePreset: res.style_preset,
        contentHash: res.content_hash,
        promptHash: res.prompt_hash,
      };

      setElements((prev) => [...prev, newItem]);
      setSelectedElementId(newItem.id);
    } catch (err: any) {
      alert("Generation error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle image vectorization file upload
  async function handleFileVectorize(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVectorizing(true);
    try {
      const res = await api.vectorizeImage(file);
      const newItem: CanvasItem = {
        id: `vectorized-${Date.now()}`,
        x: pan.x + 300,
        y: pan.y + 150,
        width: 380,
        height: 380,
        svgData: res.svg_code,
        prompt: `Vectorized file: ${file.name}`,
        stylePreset: "vector_art",
        contentHash: "0x" + Math.random().toString(16).slice(2) + "000000000000000000000000",
        promptHash: "0x" + Math.random().toString(16).slice(2) + "000000000000000000000000",
      };
      setElements((prev) => [...prev, newItem]);
      setSelectedElementId(newItem.id);
    } catch (err: any) {
      alert("Vectorization error: " + err.message);
    } finally {
      setIsVectorizing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Canvas pan / drag listeners
  function handleMouseDown(e: React.MouseEvent) {
    if (activeTool === "pan" || e.button === 1 || e.altKey) {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning) {
      setPan({ x: e.clientX - startPanPos.x, y: e.clientY - startPanPos.y });
    } else if (draggedElementId) {
      setElements((prev) =>
        prev.map((item) =>
          item.id === draggedElementId
            ? {
                ...item,
                x: (e.clientX - pan.x) / zoom - dragOffset.x,
                y: (e.clientY - pan.y) / zoom - dragOffset.y,
              }
            : item
        )
      );
    }
  }

  function handleMouseUp() {
    setIsPanning(false);
    setDraggedElementId(null);
  }

  function handleWheel(e: React.WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((z) => Math.min(Math.max(z * zoomFactor, 0.2), 4));
    }
  }

  function handleExportSvg(item: CanvasItem) {
    const blob = new Blob([item.svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recraft-${item.stylePreset}-${item.id.slice(0, 6)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteItem(id: string) {
    setElements((prev) => prev.filter((item) => item.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#0d0e12] select-none text-white font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Top Application Bar */}
      <header className="absolute top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 border-b border-white/10 bg-[#0d0e12]/90 backdrop-blur-md">
        {/* Left: Logo & Project Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#FF5C00] to-[#FFB800] p-0.5 flex items-center justify-center">
              <span className="font-black text-black text-xs">R</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-[#FF5C00] transition-colors">
              recraft<span className="text-[#FF5C00]">.studio</span>
            </span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-semibold text-gray-300">Infinite Artboard #1</span>
        </div>

        {/* Center: Zoom & Viewport Controls */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.15))}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 font-mono text-[11px] font-semibold text-gray-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.15))}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>

        {/* Right: Security Provenance & Export */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/verify"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
          >
            <Shield className="h-3.5 w-3.5" />
            Provenance Audit
          </Link>

          {selectedElementId && (
            <button
              onClick={() => {
                const item = elements.find((e) => e.id === selectedElementId);
                if (item) setSecurityModalItem(item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold shadow-md hover:brightness-110 transition-all"
            >
              <Lock className="h-3.5 w-3.5" />
              Register On-Chain
            </button>
          )}
        </div>
      </header>

      {/* Left Canvas Toolbar */}
      <aside className="absolute left-4 top-20 z-40 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-[#161720]/90 p-1.5 backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setActiveTool("select")}
          className={`p-2.5 rounded-xl transition-all ${
            activeTool === "select"
              ? "bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/30"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Select & Move (V)"
        >
          <MousePointer className="h-4 w-4" />
        </button>

        <button
          onClick={() => setActiveTool("pan")}
          className={`p-2.5 rounded-xl transition-all ${
            activeTool === "pan"
              ? "bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/30"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Hand / Pan Canvas (H)"
        >
          <Hand className="h-4 w-4" />
        </button>

        <div className="my-1 h-px bg-white/10" />

        {/* Image to Vector (Vectorize) trigger */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileVectorize}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isVectorizing}
          className="p-2.5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-[#00E5FF] transition-all relative group"
          title="Vectorize Raster Image to SVG"
        >
          {isVectorizing ? (
            <RefreshCw className="h-4 w-4 animate-spin text-[#00E5FF]" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/90 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
            Vectorize Image to SVG
          </span>
        </button>

        <button
          onClick={() => setElements([])}
          className="p-2.5 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
          title="Clear Board"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </aside>

      {/* Main Pannable / Zoomable Canvas Workspace */}
      <main
        className={`h-full w-full canvas-grid cursor-${
          activeTool === "pan" ? (isPanning ? "grabbing" : "grab") : "default"
        }`}
        onMouseDown={handleMouseDown}
      >
        <div
          className="relative h-full w-full transform-gpu origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Render Elements / Artboards */}
          {elements.map((item) => {
            const isSelected = selectedElementId === item.id;
            return (
              <div
                key={item.id}
                onMouseDown={(e) => {
                  if (activeTool === "select") {
                    e.stopPropagation();
                    setSelectedElementId(item.id);
                    setDraggedElementId(item.id);
                    setDragOffset({
                      x: (e.clientX - pan.x) / zoom - item.x,
                      y: (e.clientY - pan.y) / zoom - item.y,
                    });
                  }
                }}
                className={`absolute rounded-2xl border transition-shadow ${
                  isSelected
                    ? "border-[#FF5C00] shadow-[0_0_30px_rgba(255,92,0,0.3)] ring-1 ring-[#FF5C00]"
                    : "border-white/10 shadow-2xl hover:border-white/20"
                } bg-[#12131b] flex flex-col overflow-hidden group`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height + 65,
                }}
              >
                {/* SVG Visualizer Canvas */}
                <div
                  className="w-full flex-1 bg-[#090A0E] flex items-center justify-center p-2 relative overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: item.svgData }}
                />

                {/* Floating Card Footer Toolbar */}
                <div className="h-16 px-3.5 py-2 border-t border-white/10 bg-[#14151e] flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-wider block">
                      {item.stylePreset.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-200 truncate block font-medium">
                      {item.prompt}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportSvg(item);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                      title="Download SVG"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSecurityModalItem(item);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="On-Chain Provenance"
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Recraft Signature Floating Prompt Dock (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
        <div className="recraft-dock rounded-3xl p-3 border border-white/15">
          {/* Top row in dock: Style & Aspect Ratio & Palettes */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-white/10">
            {/* Style Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#FF5C00]" />
                <span>
                  {RECRAFT_STYLES.find((s) => s.id === selectedStyle)?.name || "Vector Art"}
                </span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Style Dropdown */}
              {styleDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-80 rounded-2xl border border-white/10 bg-[#161720] p-2 shadow-2xl z-50">
                  <div className="space-y-1">
                    {RECRAFT_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setStyleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                          selectedStyle === style.id
                            ? "bg-[#FF5C00] text-white font-bold"
                            : "hover:bg-white/10 text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <style.icon className="h-3.5 w-3.5" />
                          <span>{style.name}</span>
                        </div>
                        <span className="text-[10px] opacity-70">{style.palette.length} colors</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Model Manager Provider Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{AI_PROVIDERS.find((p) => p.id === selectedProvider)?.name}</span>
                <ChevronDown className="h-3 w-3 text-cyan-400/70" />
              </button>

              {providerDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl border border-white/10 bg-[#161720] p-2 shadow-2xl z-50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">
                    AI Engine / Gateway
                  </div>
                  <div className="space-y-1 mt-1">
                    {AI_PROVIDERS.map((prov) => (
                      <button
                        key={prov.id}
                        onClick={() => {
                          setSelectedProvider(prov.id);
                          setProviderDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                          selectedProvider === prov.id
                            ? "bg-cyan-500 text-black font-bold"
                            : "hover:bg-white/10 text-gray-300"
                        }`}
                      >
                        <span>{prov.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-gray-300">
                          {prov.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aspect Ratio Picker */}
            <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/5">
              {["1:1", "16:9", "9:16", "4:3"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                    aspectRatio === ratio
                      ? "bg-[#FF5C00] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Palette Swatches */}
            <PalettePicker
              currentPalette={activePalette}
              onChangePalette={(cols) => setActivePalette(cols)}
            />
          </div>

          {/* Bottom row: Prompt Input & Recraft Button */}
          <form onSubmit={handleGenerate} className="mt-2.5 flex items-center gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to recraft (e.g. geometric red fox shield badge, 3d isometric cube)..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
            />

            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF5C00] via-[#FF4500] to-[#FF3B30] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#FF5C00]/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Recraft
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Web3 Security Modal */}
      {securityModalItem && (
        <Web3SecurityModal
          isOpen={true}
          onClose={() => setSecurityModalItem(null)}
          artwork={{
            contentHash: securityModalItem.contentHash,
            promptHash: securityModalItem.promptHash,
            prompt: securityModalItem.prompt,
            stylePreset: securityModalItem.stylePreset,
            svgData: securityModalItem.svgData,
            imageUrl: securityModalItem.imageUrl,
          }}
        />
      )}
    </div>
  );
}
