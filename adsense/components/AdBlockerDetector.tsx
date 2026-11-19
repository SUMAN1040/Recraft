"use client";

import React, { useEffect, useState } from "react";
import config from "@/adsense/config.json";
import { ShieldAlert, Heart, X } from "lucide-react";
import Link from "next/link";

export function AdBlockerDetector() {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (!config.enableAdBlockerNotice) return;

    // Test bait element
    const bait = document.createElement("div");
    bait.setAttribute(
      "class",
      "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links"
    );
    bait.setAttribute(
      "style",
      "width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;"
    );
    document.body.appendChild(bait);

    const checkBlocked = () => {
      const isBlocked =
        window.getComputedStyle(bait).display === "none" ||
        window.getComputedStyle(bait).visibility === "hidden" ||
        bait.offsetParent === null;

      if (isBlocked) {
        setIsAdBlockerActive(true);
      }
      bait.remove();
    };

    const timer = setTimeout(checkBlocked, 1200);
    return () => {
      clearTimeout(timer);
      if (document.body.contains(bait)) bait.remove();
    };
  }, []);

  if (!isAdBlockerActive || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-amber-500/30 bg-[#161720]/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            Ad Blocker Detected
          </h4>
          <p className="mt-1 text-[11px] text-gray-300 leading-relaxed">
            We keep Recraft free through unobtrusive ads. Please consider whitelisting our site or upgrading to Pro for an ad-free vector experience.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/#pricing"
              className="rounded-lg bg-gradient-to-r from-[#FF5C00] to-[#FF3B30] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:brightness-110"
            >
              Go Ad-Free Pro
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-[10px] text-gray-400 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-white -mr-1 -mt-1 p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
