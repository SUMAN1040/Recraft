"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { StylePicker, RECRAFT_STYLES } from "@/components/StylePicker";
import { PalettePicker, PRESET_PALETTES } from "@/components/PalettePicker";
import { VectorComparisonSlider } from "@/components/VectorComparisonSlider";
import { AdBanner } from "@/adsense";
import { api, GenerationResponse } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Download,
  Copy,
  Check,
  Zap,
  Palette,
  Maximize2,
  Lock,
  Code2,
  Cpu,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  // Hero interactive generation state
  const [heroPrompt, setHeroPrompt] = useState(
    "cyberpunk robot cat in clean vector style with glowing visor"
  );
  const [selectedStyle, setSelectedStyle] = useState("vector_art");
  const [activePalette, setActivePalette] = useState(PRESET_PALETTES[0].colors);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerationResponse | null>(null);
  const [copiedSvg, setCopiedSvg] = useState(false);

  // Initial demo artwork if not generated yet
  const defaultDemoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
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
  <text x="770" y="770" font-family="sans-serif" font-size="12" font-weight="600" fill="#6B7280" text-anchor="end">
    Recraft.ai • Vector Art
  </text>
</svg>`;

  async function handleHeroGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!heroPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await api.generateArtwork({
        prompt: heroPrompt,
        style_preset: selectedStyle,
        aspect_ratio: "1:1",
        palette_colors: activePalette,
      });
      setGeneratedResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopySvg() {
    const svgCode = generatedResult?.svg_data || defaultDemoSvg;
    navigator.clipboard.writeText(svgCode);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white selection:bg-[#FF5C00] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#FF5C00]/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-[140px]" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00E5FF]/10 rounded-full blur-[160px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-md hover:border-[#FF5C00]/40 transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-[#FF5C00] animate-pulse" />
              <span>Recraft 3.0 • Vector AI Canvas with On-Chain Security</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
            </div>
          </div>

          {/* Headline */}
          <div className="mt-6 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
              The AI design tool for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C00] via-[#FF8A00] to-[#FFB800]">
                infinite vector graphics
              </span>{" "}
              and 3D art.
            </h1>
            <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Generate crisp SVG vector files, 3D graphics, and brand illustrations with infinite resolution.
              Protected by cryptographic provenance registered on Ethereum.
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF5C00] via-[#FF4500] to-[#FF3B30] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#FF5C00]/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Start Creating in Studio
            </Link>
            <Link
              href="/verify"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-200 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <Shield className="h-4 w-4 text-[#10B981]" />
              Verify Artwork Security
            </Link>
          </div>

          {/* Interactive Hero Generation Sandbox */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-white/10 bg-[#14151e]/90 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl">
              {/* Style selector pills */}
              <div className="pb-4 border-b border-white/10">
                <StylePicker
                  selectedStyle={selectedStyle}
                  onSelectStyle={(s) => setSelectedStyle(s)}
                  compact={true}
                />
              </div>

              {/* Sandbox Body: Canvas Preview + Prompt Dock */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* SVG Visualizer Box */}
                <div className="lg:col-span-6 relative aspect-square rounded-2xl border border-white/10 bg-[#090A0E] overflow-hidden flex items-center justify-center shadow-inner group">
                  {/* Subtle vector grid */}
                  <div className="absolute inset-0 canvas-grid opacity-50" />

                  {/* SVG Display */}
                  <div
                    className="relative z-10 w-full h-full p-4 flex items-center justify-center transition-all"
                    dangerouslySetInnerHTML={{
                      __html: generatedResult?.svg_data || defaultDemoSvg,
                    }}
                  />

                  {/* Floating Action Overlay on SVG */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button
                      onClick={handleCopySvg}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-medium text-gray-200 hover:text-white backdrop-blur-md hover:bg-black/80 transition-all"
                    >
                      {copiedSvg ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedSvg ? "SVG Copied!" : "Copy SVG"}
                    </button>
                    <a
                      href={generatedResult?.svg_url || "#"}
                      download="recraft-vector.svg"
                      className="p-1.5 rounded-xl bg-black/60 border border-white/10 text-gray-200 hover:text-white backdrop-blur-md hover:bg-black/80 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Provenance Badge */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-mono text-emerald-400 backdrop-blur-md">
                    <Lock className="h-3 w-3" />
                    {generatedResult ? "Keccak Signed: " + generatedResult.content_hash.slice(0, 10) + "..." : "Authentic Recraft Vector Engine"}
                  </div>
                </div>

                {/* Interactive Controls & Prompt Input */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#FF5C00] uppercase tracking-wider">
                      Interactive Live Studio
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Type anything. Generate instant vector SVG.
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Recraft creates pure vector paths with clean geometric nodes, ready for Figma, Adobe Illustrator, or web development.
                    </p>
                  </div>

                  {/* Prompt Form */}
                  <form onSubmit={handleHeroGenerate} className="space-y-3">
                    <div className="relative rounded-2xl border border-white/15 bg-black/50 p-3 focus-within:border-[#FF5C00] transition-colors">
                      <textarea
                        rows={3}
                        value={heroPrompt}
                        onChange={(e) => setHeroPrompt(e.target.value)}
                        placeholder="Describe your design (e.g. isometric 3d neon glass cube, cyberpunk animal)..."
                        className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none resize-none"
                      />

                      {/* Bottom row in prompt box */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <PalettePicker
                          currentPalette={activePalette}
                          onChangePalette={(cols) => setActivePalette(cols)}
                        />

                        <button
                          type="submit"
                          disabled={isGenerating}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5C00] to-[#FF3B30] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#FF5C00]/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Generating SVG...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Recraft
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Prompt Inspirations */}
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium">Try these prompts:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        "cyberpunk robot cat in clean vector style",
                        "isometric 3d neon glass cube",
                        "geometric red fox shield badge",
                        "futuristic space station minimal icon",
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setHeroPrompt(p)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Google AdSense Banner */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <AdBanner slotId="1111111111" format="horizontal" />
        </div>
      </section>

      {/* Signature Feature: Vector vs Raster Comparison */}
      <section id="features" className="py-20 border-t border-white/10 bg-[#0b0c10]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5C00]">
              True Infinite Resolution
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              Why designers choose Recraft.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-3">
              Standard AI models produce bitmap pixels that blur when enlarged. Recraft generates true mathematical vectors that stay razor-sharp at any size.
            </p>
          </div>

          <VectorComparisonSlider />
        </div>
      </section>

      {/* Style Showcase Grid */}
      <section id="styles" className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                Multi-Style Generative Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
                Unified styles for any brand.
              </h2>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Switch between vectors, 3D assets, app icons, and digital illustrations while maintaining brand color fidelity.
              </p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5C00] hover:underline"
            >
              Explore all styles in Studio <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <StylePicker selectedStyle={selectedStyle} onSelectStyle={(s) => setSelectedStyle(s)} />
        </div>
      </section>

      {/* Security Provenance Section (Solidity Web3) */}
      <section className="py-20 border-t border-white/10 bg-gradient-to-b from-[#0b0c10] to-[#12131b] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl border border-emerald-500/30 bg-[#13141f]/80 p-8 sm:p-12 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  <Shield className="h-3.5 w-3.5" />
                  Solidity Smart Contract Security
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  Cryptographic copyright proof & digital IP registry.
                </h2>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Every asset generated on Recraft is hashed via Keccak-256 and signed by our trusted AI oracle.
                  You can anchor your authorship permanently on Ethereum with an immutable ERC-721 token, proving authenticity and preventing unauthorized duplication.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="block text-xs text-gray-400">Anti-Tamper</span>
                    <span className="text-sm font-bold text-white">Keccak-256 Digest</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="block text-xs text-gray-400">Authentication</span>
                    <span className="text-sm font-bold text-white">AI Oracle ECDSA</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="block text-xs text-gray-400">Smart Contract</span>
                    <span className="text-sm font-bold text-emerald-400">ERC-721 Provenance</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    href="/verify"
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black hover:brightness-110 transition-all"
                  >
                    <Shield className="h-4 w-4" />
                    Open Security Verification Portal
                  </Link>
                  <Link
                    href="/app"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-gray-200 hover:bg-white/10 transition-all"
                  >
                    Open Studio
                  </Link>
                </div>
              </div>

              {/* Code Snippet / Contract Card */}
              <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#090A0F] p-5 shadow-2xl font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-gray-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Code2 className="h-4 w-4" /> RecraftSecurityProvenance.sol
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">Solidity 0.8.24</span>
                </div>
                <pre className="mt-4 text-gray-300 text-[11px] leading-relaxed overflow-x-auto">
{`function registerAndMintArtwork(
  address to,
  bytes32 imageHash,
  bytes32 promptHash,
  string calldata stylePreset,
  bytes calldata oracleSignature
) external returns (uint256) {
  // Oracle cryptographic check
  bytes32 msgHash = keccak256(
    abi.encodePacked(to, imageHash, ...)
  );
  require(
    msgHash.recover(oracleSignature) == oracleSigner,
    "Invalid AI Oracle signature"
  );
  // Mint immutable provenance
  return _safeMint(to, tokenId);
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Access Plans */}
      <section className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5C00]">Plans</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Design freely at full resolution.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-3xl border border-white/10 bg-[#14151e] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Starter</span>
                <div className="text-3xl font-black text-white mt-2">$0</div>
                <p className="text-xs text-gray-400 mt-1">Unlimited vector experimentation & raster export.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Infinite canvas workspace</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> All 7 AI style presets</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> SVG export (standard)</li>
                </ul>
              </div>
              <Link
                href="/app"
                className="mt-8 block text-center py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border-2 border-[#FF5C00] bg-[#1a1b26] p-6 flex flex-col justify-between shadow-xl shadow-[#FF5C00]/10 relative">
              <span className="absolute -top-3 right-6 bg-[#FF5C00] text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold text-[#FF5C00] uppercase">Pro Creator</span>
                <div className="text-3xl font-black text-white mt-2">$20<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <p className="text-xs text-gray-400 mt-1">Full commercial vector rights & Web3 on-chain proof.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-200">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Unlimited crisp SVG downloads</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Custom brand palettes & kits</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Smart contract copyright registration</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Image-to-vector tracing</li>
                </ul>
              </div>
              <Link
                href="/app"
                className="mt-8 block text-center py-2.5 rounded-xl bg-gradient-to-r from-[#FF5C00] to-[#FF3B30] text-xs font-bold text-white shadow-md shadow-[#FF5C00]/30 hover:brightness-110"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-3xl border border-white/10 bg-[#14151e] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Enterprise</span>
                <div className="text-3xl font-black text-white mt-2">Custom</div>
                <p className="text-xs text-gray-400 mt-1">Dedicated model fine-tuning & team collaboration.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Dedicated private AI cluster</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Custom enterprise style training</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#FF5C00]" /> Priority blockchain provenance</li>
                </ul>
              </div>
              <Link
                href="/app"
                className="mt-8 block text-center py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#090A0E] text-gray-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">recraft<span className="text-[#FF5C00]">.ai</span></span>
            <span>• Full-Stack AI Vector Design Platform Clone</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/app" className="hover:text-white">Studio</Link>
            <Link href="/verify" className="hover:text-white">Provenance Verification</Link>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500 font-mono">Next.js • Django • Solidity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
