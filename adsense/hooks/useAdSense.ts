"use client";

import { useEffect, useRef } from "react";

export function useAdSense(slotId: string) {
  const isPushed = useRef(false);

  useEffect(() => {
    if (isPushed.current) return;

    try {
      if (typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      }
    } catch (err: any) {
      console.warn(`AdSense push warning for slot ${slotId}:`, err.message);
    }
  }, [slotId]);
}
