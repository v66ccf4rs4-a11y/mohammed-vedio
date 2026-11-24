import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadTajawal } from "@remotion/google-fonts/Tajawal";

export const headingFont = loadCairo("normal", {
  weights: ["700", "900"],
  subsets: ["arabic", "latin"],
}).fontFamily;

export const bodyFont = loadTajawal("normal", {
  weights: ["400", "500", "700"],
  subsets: ["arabic", "latin"],
}).fontFamily;
