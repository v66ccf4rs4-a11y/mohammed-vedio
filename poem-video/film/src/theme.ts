import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({ family: "Amiri", url: staticFile("fonts/amiri-0.woff2"), weight: "400" });
loadFont({ family: "Amiri", url: staticFile("fonts/amiri-1.woff2"), weight: "700" });
loadFont({ family: "Cairo", url: staticFile("fonts/cairo-arabic.woff2"), weight: "200 1000" });

export const FPS = 30;
/** Seconds of title before the recitation starts. */
export const INTRO = 5;
export const VOICE_LEN = 192.9;
export const OUTRO = 7;
export const TOTAL = INTRO + VOICE_LEN + OUTRO;
export const CHANNEL = "محمد العمري";
export const TITLE = "هذا التراب";
export const POET = ""; // fill in when the user supplies it

export const C = { ivory: "#f4ead6", amber: "#d9a95b", ink: "#0b0806" };
export const NASKH = "Amiri, serif";
export const SANS = "Cairo, sans-serif";
