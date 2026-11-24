// نص الهوية الصوتية وتوقيته (بالثواني) — مأخوذ من تفريغ التسجيل
export type Cap = { s: number; e: number; text: string; emph?: string[] };
export type SceneKey = "intro" | "cafe" | "luxury" | "drama" | "doc" | "podcast" | "poetry" | "outro";
export type CapStyle = "pop" | "elegant" | "slam" | "doc";

export type Theme = {
  bg1: string;
  bg2: string;
  accent: string;
  text: string;
  label: string;
  style: CapStyle;
  font: "cairo" | "amiri" | "tajawal";
};

export const themes: Record<SceneKey, Theme> = {
  intro: { bg1: "#0d1220", bg2: "#04060b", accent: "#e3b25c", text: "#f5f1e8", label: "الهوية الصوتية", style: "pop", font: "cairo" },
  cafe: { bg1: "#f7ecdc", bg2: "#e9cfae", accent: "#b5651d", text: "#3b2417", label: "إعلان تجاري", style: "pop", font: "cairo" },
  luxury: { bg1: "#151310", bg2: "#050505", accent: "#d8b46a", text: "#f3ead8", label: "إعلان فاخر", style: "elegant", font: "amiri" },
  drama: { bg1: "#1a0508", bg2: "#000000", accent: "#e0162b", text: "#f4eaea", label: "دراما وشخصيات", style: "slam", font: "cairo" },
  doc: { bg1: "#3a1a0c", bg2: "#120804", accent: "#ffb347", text: "#fff8ec", label: "وثائقي", style: "doc", font: "cairo" },
  podcast: { bg1: "#1e1440", bg2: "#0b0718", accent: "#b79cff", text: "#f1ecff", label: "كتب مسموعة وبودكاست", style: "pop", font: "tajawal" },
  poetry: { bg1: "#121a3a", bg2: "#05070f", accent: "#e8c27a", text: "#f6efe1", label: "شعر وإلقاء", style: "elegant", font: "amiri" },
  outro: { bg1: "#0d1220", bg2: "#04060b", accent: "#e3b25c", text: "#f5f1e8", label: "", style: "pop", font: "cairo" },
};

export const scenes: { key: SceneKey; from: number; to: number }[] = [
  { key: "intro", from: 0, to: 27.6 },
  { key: "cafe", from: 27.6, to: 41.9 },
  { key: "luxury", from: 41.9, to: 59.6 },
  { key: "drama", from: 59.6, to: 87.7 },
  { key: "doc", from: 87.7, to: 106.6 },
  { key: "podcast", from: 106.6, to: 136.8 },
  { key: "poetry", from: 136.8, to: 163.2 },
  { key: "outro", from: 163.2, to: 174.9 },
];

export const captions: Record<SceneKey, Cap[]> = {
  intro: [
    { s: 5.25, e: 6.1, text: "مرحبًا" },
    { s: 6.74, e: 7.86, text: "أنا محمد العمري", emph: ["محمد", "العمري"] },
    { s: 8.47, e: 9.53, text: "معلّق صوتي", emph: ["معلّق", "صوتي"] },
    { s: 9.78, e: 11.67, text: "من المملكة العربية السعودية", emph: ["السعودية"] },
    { s: 13.24, e: 15.35, text: "لديّ الكثير من الأعمال الصوتية", emph: ["الأعمال"] },
    { s: 15.8, e: 17.66, text: "مع بعض المؤسسات الحكومية", emph: ["الحكومية"] },
    { s: 17.98, e: 19.38, text: "والمؤسسات الخاصة", emph: ["الخاصة"] },
    { s: 20.38, e: 21.82, text: "في هذه الهوية الصوتية", emph: ["الهوية"] },
    { s: 22.2, e: 24.92, text: "أستعرض لك بعض الألوان الصوتية", emph: ["الألوان"] },
    { s: 25.37, e: 26.97, text: "اللي ممكن إني أقدّمها" },
  ],
  cafe: [
    { s: 28.25, e: 30.23, text: "أقدر أخدمك في عملك الإعلاني", emph: ["الإعلاني"] },
    { s: 31.93, e: 33.6, text: "تشيز كيك ياباني", emph: ["ياباني"] },
    { s: 33.6, e: 35.48, text: "مع ريد فيلفت كيك والقهوة العربية", emph: ["القهوة", "العربية"] },
    { s: 35.93, e: 37.5, text: "بـ 69 ريال فقط", emph: ["69", "ريال"] },
    { s: 37.78, e: 40.57, text: "يستمر العرض حتى الساعة السادسة مساءً", emph: ["السادسة"] },
  ],
  luxury: [
    { s: 42.84, e: 45.46, text: "أو ممكن يكون الإعلان بالشكل هذا" },
    { s: 47.38, e: 49.5, text: "تميّزٌ وإتقان", emph: ["تميّزٌ"] },
    { s: 50.39, e: 52.38, text: "أناقةٌ وإبداع", emph: ["أناقةٌ"] },
    { s: 53.21, e: 54.36, text: "بيتُ الفخامة", emph: ["الفخامة"] },
    { s: 54.87, e: 55.9, text: "ياقوت", emph: ["ياقوت"] },
    { s: 56.28, e: 58.36, text: "صياغةُ الأنقى", emph: ["الأنقى"] },
  ],
  drama: [
    { s: 60.57, e: 63.61, text: "أو أقنعك في شخصية من قصة" },
    { s: 66.39, e: 68.57, text: "خائنٌ متسلّط", emph: ["خائنٌ", "متسلّط"] },
    { s: 69.37, e: 70.62, text: "أتحاول الوقوف؟" },
    { s: 71.29, e: 78.81, text: "آهٍ يا عزيزي الخَرِف، تعمّدتُ ألّا أقترب من أي عضوٍ حسّاس قد يأتي بأجلك سريعًا", emph: ["الخَرِف،", "تعمّدتُ", "بأجلك"] },
    { s: 79.61, e: 87.19, text: "لأراك تتعذّب وتهلك ببطء، لأجعلك تتمنّى الموت فلا تجده", emph: ["تتعذّب", "ببطء،", "الموت"] },
  ],
  doc: [
    { s: 88.15, e: 91.0, text: "وإذا كان وثائقي، رح تشوفه" },
    { s: 91.51, e: 94.9, text: "في براري أفريقيا المتوحشة", emph: ["أفريقيا"] },
    { s: 95.29, e: 98.62, text: "يتطلّب البقاء كثيرًا من القوة", emph: ["القوة"] },
    { s: 99.48, e: 104.66, text: "تعتمد كل المخلوقات على قوتها لتبقى في القمة", emph: ["القمة"] },
  ],
  podcast: [
    { s: 107.42, e: 108.89, text: "تحب الكتب المسموعة؟", emph: ["الكتب", "المسموعة؟"] },
    { s: 109.11, e: 111.06, text: "أو تستمتع في البودكاست؟", emph: ["البودكاست؟"] },
    { s: 114.36, e: 117.24, text: "وفي هذه الحياة أحوالٌ ثلاثة", emph: ["ثلاثة"] },
    { s: 117.98, e: 120.02, text: "يغيب فيها الكون بحقائقه" },
    { s: 121.43, e: 123.13, text: "فيغيب عن السكران" },
    { s: 123.54, e: 125.08, text: "والمخبول والنائم" },
    { s: 125.75, e: 128.06, text: "وفيها حالةٌ رابعة", emph: ["رابعة"] },
    { s: 128.25, e: 129.85, text: "يتلاشى فيها الكون" },
    { s: 130.17, e: 131.96, text: "إلا من حقيقةٍ واحدة", emph: ["واحدة"] },
    { s: 132.57, e: 135.42, text: "وتتمثّل في إنسانٍ محبوب", emph: ["محبوب"] },
  ],
  poetry: [
    { s: 138.62, e: 143.0, text: "ومَن لا يستهويه الشعر؟" },
    { s: 143.45, e: 146.87, text: "بيني وبين الدهرِ فيكَ عتابُ", emph: ["عتابُ"] },
    { s: 148.7, e: 152.06, text: "سيطولُ إن لم يمحُهُ الإعتابُ", emph: ["الإعتابُ"] },
    { s: 153.5, e: 157.56, text: "يا غائبًا بوصالهِ وكتابِهِ", emph: ["غائبًا"] },
    { s: 158.62, e: 162.55, text: "هل يُرتجى من غيبتيكَ إيابُ", emph: ["إيابُ"] },
  ],
  outro: [],
};

export const REEL_DURATION = 174.9;
