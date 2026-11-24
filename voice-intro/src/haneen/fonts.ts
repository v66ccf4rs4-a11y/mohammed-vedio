import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { loadFont as loadRuqaa } from "@remotion/google-fonts/ArefRuqaa";

export const verseFont = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] }).fontFamily;
export const titleFont = loadRuqaa("normal", { weights: ["400", "700"], subsets: ["arabic"] }).fontFamily;
