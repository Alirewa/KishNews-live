import localFont from "next/font/local";

export const pelakFA = localFont({
  src: [
    { path: "../public/fonts/PelakFA-Thin.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/PelakFA-light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/PelakFA-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/PelakFA-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/PelakFA-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/PelakFA-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/PelakFA-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/PelakFA-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-pelak-fa",
  display: "swap",
});

export const pelak = localFont({
  src: [
    { path: "../public/fonts/Pelak-Thin.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/Pelak-light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/Pelak-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Pelak-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Pelak-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/Pelak-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/Pelak-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/Pelak-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-pelak",
  display: "swap",
});
