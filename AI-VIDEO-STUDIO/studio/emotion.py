"""Lightweight Arabic emotion + setting analysis (offline, rule-based lexicon).

Returns a mood used for colour grade / pacing / typography, and visual keywords that map
to Saudi & Gulf environments for footage search or local scene generation.
"""
from __future__ import annotations

from .transcribe import norm_ar

MOODS = {
    "hope": ["امل", "فجر", "شروق", "نور", "ضوء", "يشرق", "جديد", "حلم", "غد", "بدايه", "تبدا", "ربيع", "فرح"],
    "sorrow": ["حزن", "دمع", "بكا", "فراق", "رحيل", "وداع", "الم", "جرح", "غياب", "وحده", "فقد", "ليل"],
    "pride": ["وطن", "مجد", "عز", "فخر", "شموخ", "راي", "سيف", "خيل", "قوه", "نصر", "الرياض", "السعوديه"],
    "nostalgia": ["ذكري", "زمان", "ماضي", "حنين", "قديم", "طفوله", "بيت", "امي", "ابي", "جدي", "حكايه"],
    "tension": ["خوف", "عاصفه", "حرب", "صراع", "نار", "غضب", "ظلام", "رعد"],
    "calm": ["سلام", "هدوء", "بحر", "مطر", "نسيم", "صمت", "سكينه", "قلب", "حب"],
}

# Arabic keyword -> (English stock-footage query, local procedural scene)
SETTINGS = [
    (["صحرا", "رمل", "كثبان", "بادي"], "saudi desert sand dunes cinematic", "dunes"),
    (["شروق", "فجر", "يشرق", "ضوء", "نور", "شمس"], "desert sunrise golden hour", "dawn"),
    (["ليل", "قمر", "نجوم", "نجم", "سهر"], "desert night sky stars", "night"),
    (["بحر", "موج", "شاطي", "خليج"], "red sea coast waves aerial", "sea"),
    (["نخل", "نخيل", "واحه", "تمر"], "palm trees oasis saudi", "oasis"),
    (["جبل", "جبال", "قمه", "ابها"], "saudi mountains aerial", "mountains"),
    (["مدينه", "الرياض", "جده", "برج"], "riyadh skyline night", "city"),
    (["مطر", "غيم", "سحاب", "مطر"], "rain clouds desert storm", "storm"),
    (["خيل", "حصان", "فرس"], "arabian horse running desert", "dunes"),
    (["ابل", "جمل", "ناقه"], "camels desert caravan", "dunes"),
    (["قهوه", "دله", "فنجان"], "arabic coffee dallah pouring", "night"),
    (["قلب", "حب", "امي", "ابي", "طفل"], "family hands warm light", "dawn"),
]

GRADES = {
    # FFmpeg filter fragments. Neutral-cool bias on purpose to avoid an all-gold look.
    "hope": "eq=contrast=1.06:saturation=1.05:gamma=1.02,colorbalance=rs=-0.03:bs=0.04:rh=0.03:bh=-0.02",
    "sorrow": "eq=contrast=1.04:saturation=0.72:gamma=0.97,colorbalance=rs=-0.04:bs=0.07:rm=-0.02:bm=0.03",
    "pride": "eq=contrast=1.14:saturation=0.98,colorbalance=rs=-0.02:bs=0.03:rh=0.02",
    "nostalgia": "curves=all='0/0.06 0.5/0.5 1/0.94',eq=saturation=0.82,colorbalance=rm=0.03:bm=-0.02:bs=0.03",
    "tension": "eq=contrast=1.2:saturation=0.8:gamma=0.92,colorbalance=gs=0.02:bs=0.05:rh=-0.02",
    "calm": "eq=contrast=0.98:saturation=0.9:gamma=1.03,colorbalance=bs=0.05:gm=0.01:bh=0.02",
}


def analyze_text(text: str) -> dict:
    t = norm_ar(text)
    scores = {m: sum(1 for k in kws if k in t) for m, kws in MOODS.items()}
    mood = max(scores, key=scores.get) if any(scores.values()) else "calm"
    hits = [(q, scene) for kws, q, scene in SETTINGS if any(k in t for k in kws)]
    return {"mood": mood, "scores": scores, "queries": [h[0] for h in hits],
            "scenes": [h[1] for h in hits]}
