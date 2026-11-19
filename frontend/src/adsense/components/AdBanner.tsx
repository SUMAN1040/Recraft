"use client";

import React from "react";
import config from "@/adsense/config.json";
import { useAdSense } from "../hooks/useAdSense";
import { Sparkles } from "lucide-react";

interface AdBannerProps {
  slotId?: string;
  className?: string;
  format?: "auto" | "horizontal" | "rectangle";
}

export function AdBanner({
  slotId = config.adSlots.landingTopBanner,
  className = "",
  format = "horizontal",
}: AdBannerProps) {
  useAdSense(slotId);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || config.publisherId;
  const isTest = config.testMode || publisherId === "ca-pub-0000000000000000";

  return (
    <div
      className={`relative mx-auto my-6 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#12131b]/60 backdrop-blur-md p-3 text-center transition-all ${className}`}
      style={{ minHeight: "90px", maxWidth: "970px", width: "100%" }}
    >
      {/* Ad Label Required by Google Policy */}
      <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        Advertisement
      </span>

      {isTest ? (
        /* Test Mode / Preview Placeholder */
        <div className="flex h-20 w-full items-center justify-between rounded-xl border border-dashed border-[#FF5C00]/30 bg-[#FF5C00]/5 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5C00]/20 text-[#FF5C00]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-white">
                Google AdSense Banner Slot
              </span>
              <span className="block font-mono text-[10px] text-gray-400">
                Client: {publisherId} • Slot: {slotId}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-[#FF5C00]/20 border border-[#FF5C00]/40 px-3 py-1 text-[10px] font-bold text-[#FF5C00] uppercase font-mono">
            AdSense Test Mode Active
          </span>
        </div>
      ) : (
        /* Live Google AdSense Responsive Unit */
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-test={config.testMode ? "on" : undefined}
        />
      )}
    </div>
  );
}

