# Google AdSense Monetization & Integration Module

This folder contains the complete, production-ready configuration, components, verification files, and policy compliance utilities for **Google AdSense**.

---

## 📁 Folder Structure

```
adsense/
├── config.json                     # Master configuration (Publisher ID, slots, test mode, toggles)
├── ads.txt                         # Domain verification file (Served at /ads.txt)
├── README.md                       # Setup & policy approval guide
├── index.ts                        # Unified module exports
├── components/
│   ├── AdSenseScript.tsx           # Global script loader using next/script
│   ├── AdBanner.tsx                # Responsive top/bottom leaderboard banner unit
│   ├── SidebarAd.tsx               # 300x250 Medium rectangle ad unit (Studio/Inspector)
│   ├── InFeedAd.tsx                # Native card ad unit that matches Recraft's design grid
│   ├── AdBlockerDetector.tsx       # Graceful ad blocker detection & pro-subscription prompt
│   └── PrivacyConsentModal.tsx     # GDPR & CCPA compliant cookie and ads consent dialog
└── hooks/
    └── useAdSense.ts               # Safe Next.js route navigation ad push hook
```

---

## ⚙️ Quick Configuration

### 1. Set Your Google AdSense Publisher ID
Open [`adsense/config.json`](file:///home/InnoX107/Documents/Recraft/adsense/config.json) or set an environment variable in `.env.local`:
```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```
*(Replace `ca-pub-XXXXXXXXXXXXXXXX` with your approved 16-digit AdSense ID).*

### 2. Verify `ads.txt`
Google AdSense crawlers require an `ads.txt` file at your root domain (`https://yourdomain.com/ads.txt`).
This file is pre-configured and automatically served from [`frontend/public/ads.txt`](file:///home/InnoX107/Documents/Recraft/frontend/public/ads.txt):
```txt
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

### 3. Test Mode (`data-ad-test="on"`)
While testing locally or before your domain is approved by Google, keep `"testMode": true` in `config.json`.
- In Test Mode: The components render sleek developer-friendly placeholders with dimensions so your layout does not shift (zero Cumulative Layout Shift).
- In Production: When you change `testMode: false` and supply a valid publisher ID, real Google AdSense ads are loaded.

---

## 🚀 How to Use Components in Next.js

### 1. In Layout ([`frontend/src/app/layout.tsx`](file:///home/InnoX107/Documents/Recraft/frontend/src/app/layout.tsx))
```tsx
import { AdSenseScript, PrivacyConsentModal, AdBlockerDetector } from "@/adsense";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <AdSenseScript />
      </head>
      <body>
        {children}
        <PrivacyConsentModal />
        <AdBlockerDetector />
      </body>
    </html>
  );
}
```

### 2. Add an Ad Banner to Any Page
```tsx
import { AdBanner } from "@/adsense";

<AdBanner slotId="1111111111" format="horizontal" />
```

### 3. Add a Sidebar Unit to Studio
```tsx
import { SidebarAd } from "@/adsense";

<SidebarAd slotId="3333333333" />
```

### 4. Add Native In-Feed Ads in Style Galleries
```tsx
import { InFeedAd } from "@/adsense";

<InFeedAd slotId="4444444444" />
```

---

## 🛡️ Policy Compliance Checklist

- [x] **Ad Disclosures**: Every unit includes an official "Advertisement" or "Sponsored Ad" label as mandated by Google AdSense policies.
- [x] **Consent Banner**: [`PrivacyConsentModal.tsx`](file:///home/InnoX107/Documents/Recraft/adsense/components/PrivacyConsentModal.tsx) provides GDPR and CCPA compliant consent.
- [x] **No Cumulative Layout Shift (CLS)**: Units reserve exact minimum heights so content doesn't jump when ads load.
- [x] **AdBlocker Detection**: Friendly dialog asking users to whitelist or upgrade to an ad-free tier.

