import type { Move, ShotDef } from "./components/Shot";
import { INTRO, TOTAL } from "./theme";

// Verse start times in the recording (seconds); see ../../assets/verses.json.
const V = [1.17, 9.11, 18.01, 26.11, 34.27, 43.07, 52.71, 60.83, 69.45, 78.53, 87.89, 96.55, 105.43, 114.67, 123.57, 132.81, 142.15, 151.37, 159.53, 168.69, 177.25];
const at = (voice: number) => voice + INTRO; // film time
const X = 0.7; // half of each crossfade

const push: Move = { from: [1.04, 0, 0], to: [1.18, 0, 0] };
const pull: Move = { from: [1.2, 0, 0], to: [1.05, 0, 0] };
const panL: Move = { from: [1.15, 3, 0], to: [1.15, -3, 0] };
const panR: Move = { from: [1.15, -3, 0], to: [1.15, 3, 0] };
const rise: Move = { from: [1.15, 0, 3], to: [1.15, 0, -3] };
const sink: Move = { from: [1.15, 0, -3], to: [1.15, 0, 3] };

// [file, start (film s), end (film s), move, focus]
type Row = [string, number, number, Move, string?];
const rows: Row[] = [
  ["ri32.jpg", 0, at(V[0]), push], // intro: mist over the Euphrates at Hilla
  ["el30.jpg", at(V[0]), at(V[1]), push, "50% 28%"], // 1 يا جدّاه ترتجف
  ["su8.jpg", at(V[1]), at(V[2]), sink], // 2 الشمس قد أفلت
  ["de18.jpg", at(V[2]), at(V[3]), pull], // 3 مكانًا نائيًا
  ["yo27.jpg", at(V[3]), at(V[4]), push], // 4 وقفت مثلك
  ["el17.jpg", at(V[4]), at(V[5]), push, "50% 30%"], // 5 أسمع أصواتًا
  ["yo14.jpg", at(V[5]), at(V[6]), push, "50% 30%"], // 6 جلدي تاريخ → inscription (morph below)
  ["ha44.jpg", at(V[6]), at(V[7]), panL], // 7 الآكل المأكول
  ["pa33.jpg", at(V[7]), at(64.87), push], // 8a
  ["de13.jpg", at(64.87), at(V[8]), rise], // 8b هذا التراب وجوه
  ["ri2.jpg", at(V[8]), at(V[9]), sink, "50% 60%"], // 9 كنه المياه
  ["ha14.jpg", at(V[9]), at(V[10]), push], // 10 هذا الغبار
  ["ex14.jpg", at(V[10]), at(V[11]), pull, "50% 45%"], // 11 تلك جمجمة
  ["ri1.jpg", at(V[11]), at(101.43), panR], // 12a أمشي مع النهر
  ["ha23.jpg", at(101.43), at(V[12]), panL], // 12b الحقول
  ["po18.jpg", at(V[12]), at(109.99), push], // 13a الجرار عيون
  ["po44.jpg", at(109.99), at(V[13]), push], // 13b خزف
  ["wo16.jpg", at(V[13]), at(119.19), pull, "50% 35%"], // 14a دمعًا سال
  ["so3.jpg", at(119.19), at(V[14]), push], // 14b خلف الجنود
  ["ex46.jpg", at(V[14]), at(V[15]), push], // 15 القتيل والقاتل
  ["de38.jpg", at(V[15]), at(V[16]), panL], // 16 أدوس على أهلي
  ["ex4.jpg", at(V[16]), at(146.73), sink], // 17a الراحلون
  ["ex19.jpg", at(146.73), at(V[17]), rise], // 17b غرفًا من فوقها غرف
  ["ri9.jpg", at(V[17]), at(V[18]), push], // 18 من علّم النهر
  ["pa1.jpg", at(V[18]), at(V[19]), push, "50% 40%"], // 19 يطلع الطلع
  ["pa0.jpg", at(V[19]), at(173.89), push], // 20a هذا النخيل
  ["pa2.jpg", at(173.89), at(V[20]), rise], // 20b السعف
  ["de41.jpg", at(V[20]), at(182.67), pull], // 21a يا كل من مات
  ["el1.jpg", at(182.67), at(189.5), push], // 21b أنت الجميع
  ["ri11.jpg", at(189.5), TOTAL, push], // outro: sunrise on the Euphrates
];

export const SHOTS: ShotDef[] = rows.map(([src, a, b, move, focus], i) => ({
  src,
  start: i === 0 ? 0 : a + X,
  end: i === rows.length - 1 ? TOTAL + 2 : b - X,
  move,
  focus,
  ...(src === "yo14.jpg" ? { morph: { src: "ta19.jpg", at: at(48.43) - 1.5, dur: 3 } } : {}),
}));
