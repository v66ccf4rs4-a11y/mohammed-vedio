import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts so renders work offline.
const faces: [string, string][] = [
  ["MAKufi", "kufi-arabic.woff2"],
  ["MAKufiLatin", "kufi-latin.woff2"],
  ["MACairo", "cairo-arabic.woff2"],
  ["MACairoLatin", "cairo-latin.woff2"],
];
for (const [family, file] of faces) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight: "200 1000" });
}

export const FONT_HEAD = "MAKufi, MAKufiLatin, sans-serif";
export const FONT_BODY = "MACairo, MACairoLatin, sans-serif";

export const C = {
  bg: "#0c0a08",
  bg2: "#17120d",
  gold: "#d4a856",
  goldSoft: "#f0d9a6",
  iron: "#9aa1a9",
  paper: "#f3ead8",
  red: "#c8372d",
  green: "#2f8f5b",
  dim: "rgba(243,234,216,0.45)",
};

export const FPS = 30;
export const DURATION_S = 130.9;
export const CHANNEL = "محمد العمري";
