"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { connectWallet } from "@/lib/web3";
import { Sparkles, Shield, Layers, Image as ImageIcon, ExternalLink, Wallet } from "lucide-react";

export function Navbar() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const res = await connectWallet();
      if (res) {
        setWalletAddress(res.address);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d0e12]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Recraft Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF3B30] via-[#FF5C00] to-[#FF9500] p-0.5 shadow-lg shadow-[#FF5C00]/25 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0d0e12]">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#FF5C00] to-[#FFB800] text-xl">
                R
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-[#FF5C00] transition-colors">
              recraft<span className="text-[#FF5C00]">.ai</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase -mt-1">
              Vector & 3D Canvas
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-300">
          <Link href="/app" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[#FF5C00]" />
            Canvas Studio
          </Link>
          <Link href="/#styles" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#00E5FF]" />
            Vector Styles
          </Link>
          <Link href="/#features" className="hover:text-white transition-colors">
            Infinite Resolution
          </Link>
          <Link href="/verify" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-[#10B981]" />
            Security Provenance
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Web3 Wallet Connect */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-200 hover:border-[#FF5C00]/50 hover:bg-white/10 transition-all"
          >
            <Wallet className="h-3.5 w-3.5 text-[#FF5C00]" />
            {walletAddress ? (
              <span className="font-mono text-emerald-400">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : isConnecting ? (
              "Connecting..."
            ) : (
              "Connect Web3"
            )}
          </button>

          {/* Launch Studio CTA */}
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5C00] to-[#FF3B30] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#FF5C00]/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Open Studio
          </Link>
        </div>
      </div>
    </header>
  );
}