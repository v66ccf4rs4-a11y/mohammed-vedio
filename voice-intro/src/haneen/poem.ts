// توقيت كل شطر بالثواني (مأخوذ من تحليل الإلقاء)
export type Bayt = {
  first: string;
  second: string;
  start: number; // بداية الصدر
  secondStart: number; // بداية العجز
  end: number; // نهاية العجز
};

export const poem: Bayt[] = [
  { first: "العَينُ بَعدَ فِراقِهَا الوَطَنَا", second: "لَا سَاكِنًا أَلِفَتْ وَلَا سَكَنَا", start: 0.3, secondStart: 6.5, end: 12.0 },
  { first: "رَيَّانَةٌ بِالدَّمْعِ أَقْلَقَهَا", second: "ألَّا تَحُسَّ كَرًى وَلَا وَسَنَا", start: 12.8, secondStart: 15.8, end: 21.2 },
  { first: "كَانَتْ تَرَى فِي كُلِّ سَانِحَةٍ", second: "حُسْنًا وَبَاتَتْ لَا تَرَى حُسْنَا", start: 21.6, secondStart: 25.1, end: 30.2 },
  { first: "والقَلْبُ لَولَا أنَّةٌ صَعِدَتْ", second: "أنْكَرتُه وشَكَكتُ فيهِ أنَا", start: 30.7, secondStart: 36.0, end: 39.8 },
  { first: "ليتَ الَّذِينَ أُحبُّهُم عَلِمُوا", second: "وَهُمْ هُنَالِكَ مَا لَقِيتُ هُنَا", start: 40.1, secondStart: 44.0, end: 49.8 },
  { first: "مَا كُنتُ أَحْسَبُنِي مُفَارِقَهُم", second: "حتَّى تُفَارِقَ رُوحِي البَدَنَا", start: 50.4, secondStart: 54.2, end: 59.4 },
  { first: "لِي ذِكْريَاتٌ فِي رُبُوعِهِمُ", second: "هُنَّ الحَيَاةُ تَألُّقًا وَسَنَا", start: 59.8, secondStart: 64.0, end: 69.8 },
  { first: "إِنَّ الغَريبَ مُعذَّبٌ أبَدًا", second: "إِنْ حَلَّ لمْ يَنْعَمْ وَإِنْ ظَعَنَا", start: 70.1, secondStart: 75.0, end: 81.0 },
];

export const credits = {
  title: "العَينُ بَعدَ فِراقِهَا الوَطَنَا",
  poet: "شعر: خير الدين الزركلي",
  voice: "إلقاء: محمد العمري",
  start: 81.4,
};

export const AUDIO_DURATION = 87.48;

// الافتتاحية (الهوك) قبل بداية الإلقاء
export const hook = {
  lines: ["إن كنتَ بعيدًا عن أهلك ووطنك…", "هذه القصيدة لك"],
  duration: 4.6,
};

export const palette = {
  gold: "#e8c27a",
  goldDeep: "#c8913f",
  text: "#f6efe1",
};
