"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { ShieldCheck, Lock, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { connectWallet, mintArtworkProvenanceOnChain, CONTRACT_ADDRESS } from "@/lib/web3";
import { api } from "@/lib/api";

interface Web3SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    contentHash: string;
    promptHash: string;
    prompt: string;
    stylePreset: string;
    svgData: string;
    imageUrl?: string;
  };
}

export function Web3SecurityModal({ isOpen, onClose, artwork }: Web3SecurityModalProps) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  async function handleMint() {
    setIsMinting(true);
    setErrorMessage("");
    try {
      // 1. Connect wallet if not connected
      let currentAddress = walletAddress;
      if (!currentAddress) {
        const wallet = await connectWallet();
        if (!wallet) {
          setIsMinting(false);
          return;
        }
        currentAddress = wallet.address;
        setWalletAddress(currentAddress);
      }

      // 2. Request cryptographically signed Oracle Attestation from Django backend
      const oracleRes = await api.getOracleSignature({
        user_address: currentAddress,
        image_hash: artwork.contentHash,
        prompt_hash: artwork.promptHash,
        style_preset: artwork.stylePreset,
        model_version: "recraft-v3-vector",
        nonce: 0,
      });

      // 3. Execute Solidity transaction: registerAndMintArtwork
      const mintResult = await mintArtworkProvenanceOnChain(
        currentAddress,
        artwork.contentHash,
        artwork.promptHash,
        artwork.stylePreset,
        "recraft-v3-vector",
        `ipfs://RecraftProvenance_${artwork.contentHash.slice(2, 10)}`,
        oracleRes.oracle_signature
      );

      setTxHash(mintResult.transactionHash);
      setIsSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // 4. Record to backend DB
      await api.recordMint({
        content_hash: artwork.contentHash,
        prompt_hash: artwork.promptHash,
        creator_address: currentAddress,
        style_preset: artwork.stylePreset,
        transaction_hash: mintResult.transactionHash,
        oracle_signature: oracleRes.oracle_signature,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to register on-chain proof");
    } finally {
      setIsMinting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#14151f] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cryptographic IP Provenance</h3>
              <p className="text-xs text-gray-400">On-Chain Anti-Tamper & Copyright Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-lg p-1.5 hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Artwork Overview */}
        <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5">
          <div className="flex items-start gap-3">
            <div
              className="h-16 w-16 rounded-xl border border-white/10 bg-[#090A0E] overflow-hidden flex items-center justify-center flex-shrink-0"
              dangerouslySetInnerHTML={{ __html: artwork.svgData }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#FF5C00] uppercase tracking-wider">
                  {artwork.stylePreset.replace("_", " ")}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  Solidity Verified
                </span>
              </div>
              <p className="text-xs text-gray-200 font-medium truncate mt-0.5">
                "{artwork.prompt}"
              </p>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span className="truncate">Hash: {artwork.contentHash}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white mt-2">Provenance Certificate Minted!</h4>
            <p className="text-xs text-gray-300 mt-1">
              Your AI design is now permanently anchored on the Ethereum blockchain with cryptographic authorship proof.
            </p>
            {txHash && (
              <div className="mt-3 p-2 bg-black/40 rounded-lg text-[11px] font-mono text-emerald-300 truncate">
                Tx: {txHash}
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:brightness-110"
            >
              Done
            </button>
          </div>
        ) : (
          /* Mint Action */
          <div className="mt-6 space-y-4">
            <div className="text-xs text-gray-400 space-y-1.5 leading-relaxed">
              <p>• Calculates a deterministic Keccak-256 cryptographic digest of your vector asset.</p>
              <p>• Validates an AI Oracle signature proving legitimate generation on Recraft.</p>
              <p>• Mints an ERC-721 token establishing your irrevocable ownership & copyright.</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleMint}
              disabled={isMinting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isMinting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering On Ethereum Blockchain...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Mint Cryptographic Provenance On-Chain
                </>
              )}
            </button>

            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-mono">
                Contract: {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-6)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
