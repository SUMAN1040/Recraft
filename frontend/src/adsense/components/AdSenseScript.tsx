"use client";

import React from "react";
import Script from "next/script";
import config from "@/adsense/config.json";

interface AdSenseScriptProps {
  publisherId?: string;
}

export function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  const client = publisherId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || config.publisherId;

  // Don't inject unconfigured dummy IDs in strict production if disabled
  if (!client || client === "ca-pub-0000000000000000") {
    // Development or placeholder notice in console
    return null;
  }

  return (
    <Script
      id="google-adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

