import type { Metadata } from "next";
import "./globals.css";
import { AdSenseScript, PrivacyConsentModal, AdBlockerDetector } from "@/adsense";

export const metadata: Metadata = {
  title: "Recraft.ai • The Infinite AI Canvas for Vector & 3D Art",
  description:
    "The first generative AI design tool for infinite vector art (SVG), 3D graphics, brand illustrations, and on-chain cryptographic copyright protection on Ethereum.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <AdSenseScript />
      </head>
      <body className="bg-[#0d0e12] text-white antialiased">
        {children}
        <PrivacyConsentModal />
        <AdBlockerDetector />
      </body>
    </html>
  );
}
