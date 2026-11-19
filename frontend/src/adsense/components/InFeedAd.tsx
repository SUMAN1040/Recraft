"use client";

import React from "react";
import config from "@/adsense/config.json";
import { useAdSense } from "../hooks/useAdSense";
import { ExternalLink } from "lucide-react";

interface InFeedAdProps {
  slotId?: string;
  className?: string;
}

export function InFeedAd({
  slotId = config.adSlots.inFeedCards,
  className = "",
}: InFeedAdProps) {
  useAdSense(slotId);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || config.publisherId;
  const isTest = config.testMode || publisherId === "ca-pub-0000000000000000";

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#161722] p-5 shadow-xl transition-all ${className}`}
      style={{ minHeight: "260px" }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Featured Partner
        </span>
        <span className="text-[9px] font-medium text-gray-500 uppercase">Ad</span>
      </div>

      {isTest ? (
        <div className="my-auto flex flex-col items-center justify-center py-4 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#12131a] text-emerald-400">
              <ExternalLink className="h-5 w-5" />
            </div>
          </div>
          <h4 className="mt-3 text-sm font-bold text-white">In-Feed Native Ad Unit</h4>
          <p className="mt-1 text-xs text-gray-400 max-w-xs">
            Seamlessly blends between Recraft style cards and community templates.
          </p>
          <span className="mt-3 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] font-mono text-gray-400">
            Slot: {slotId}
          </span>
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-test={config.testMode ? "on" : undefined}
        />
      )}

      <div className="pt-2 text-right">
        <span className="text-[9px] text-gray-500 font-mono">Google AdSense Native</span>
      </div>
    </div>
  );
}

