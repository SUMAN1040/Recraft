"use client";

import React, { useState, useEffect } from "react";
import config from "@/adsense/config.json";
import { Cookie, Shield, Check, X } from "lucide-react";

export function PrivacyConsentModal() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!config.enableGDPRConsent) return;
    const hasConsented = localStorage.getItem("recraft_ads_consent");
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("recraft_ads_consent", "accepted");
    setShowConsent(false);
  }

  function handleDecline() {
    localStorage.setItem("recraft_ads_consent", "declined");
    setShowConsent(false);
  }

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#161722]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Privacy & Ad Personalization Preferences
              </h4>
              <p className="mt-1 text-xs text-gray-300 leading-relaxed max-w-xl">
                We use cookies and Google AdSense to serve relevant advertisements, measure traffic, and keep Recraft free for creators. You can customize your consent preferences in accordance with GDPR & CCPA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button
              onClick={handleDecline}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={handleAccept}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-black shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

