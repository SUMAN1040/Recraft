"use client";

import React from "react";
import config from "@/adsense/config.json";
import { useAdSense } from "../hooks/useAdSense";
import { Zap } from "lucide-react";

interface SidebarAdProps {
  slotId?: string;
  className?: string;
}

export function SidebarAd({
  slotId = config.adSlots.studioSidebar,
  className = "",
}: SidebarAdProps) {
  useAdSense(slotId);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || config.publisherId;
  const isTest = config.testMode || publisherId === "ca-pub-0000000000000000";

  return (
    <div
      className={`relative mx-auto my-4 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141520] p-4 text-center shadow-lg ${className}`}
      style={{ width: "300px", minHeight: "250px" }}
    >
      <span className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        Sponsored Ad
      </span>

      {isTest ? (
        <div className="flex h-52 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#00E5FF]/30 bg-[#00E5FF]/5 p-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] mb-3">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-white">Google AdSense 300×250</span>
          <span className="font-mono text-[10px] text-gray-400 mt-1">
            Slot: {slotId}
          </span>
          <span className="mt-3 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2.5 py-0.5 text-[9px] font-bold text-[#00E5FF] uppercase font-mono">
            Preview Mode
          </span>
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "300px", height: "250px" }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-test={config.testMode ? "on" : undefined}
        />
      )}
    </div>
  );
}

