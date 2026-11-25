"""Animated Arabic typography as ASS subtitles, rendered by libass (HarfBuzz shaping +
FriBidi RTL) inside FFmpeg: connected letters, diacritics and RTL punctuation stay correct.

Never use letter-spacing (\\fsp) on Arabic: it breaks the joins between letters.
Every line is animated word-by-word in sync with the narration's word timestamps.
"""
from __future__ import annotations

from pathlib import Path

STYLES = {
    # name: (font family, size factor, bold)
    "ruqaa_reveal": ("Aref Ruqaa Ink", 0.16, 0),
    "naskh_rise": ("Amiri", 0.17, 1),
    "kufi_focus": ("Reem Kufi", 0.125, 0),
    "caption": ("Tajawal", 0.06, 1),
}


def _t(sec: float) -> str:
    sec = max(0.0, sec)
    h, r = divmod(sec, 3600)
    m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _ms(x: float) -> int:
    return max(0, int(round(x * 1000)))


def build_ass(scenes: list[dict], W: int, H: int, out: Path, title: str | None = None) -> Path:
    short = min(W, H)
    head = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "ScaledBorderAndShadow: yes", "YCbCr Matrix: TV.709", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, "
        "Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    ]
    for name, (font, k, bold) in STYLES.items():
        size = int(short * k * (1.0 if H > W else 1.15))
        head.append(f"Style: {name},{font},{size},&H00E8EFF4,&H00FFFFFF,&H00201812,&H96000000,"
                    f"{-1 if bold else 0},0,0,0,100,100,0,0,1,0,0,5,{int(W*0.08)},{int(W*0.08)},0,1")
    head += ["", "[Events]",
             "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    ev = []
    cx = W // 2
    cy = int(H * (0.70 if H > W else 0.74))
    for sc in scenes:
        style = sc.get("text_style", "ruqaa_reveal")
        t0 = max(sc["text_start"] - 0.25, sc["start"])
        t1 = max(sc["text_end"] + 0.6, sc["end"] - 0.15)
        words = sc.get("words") or [{"word": w, "start": sc["text_start"], "end": sc["text_end"]}
                                    for w in sc["text"].split()]
        parts = []
        for w in words:
            a = _ms(w["start"] - t0)
            dur = max(160, min(420, _ms(w["end"] - w["start"])))
            # each word: invisible -> fade in at its spoken time, with a brief soft-focus pull
            parts.append(f"{{\\alpha&HFF&\\blur6\\t({a},{a + dur},\\alpha&H00&\\blur0.6)}}"
                         f"{w['word'].replace('{', '(').replace('}', ')')}")
        body = " ".join(parts)
        tot = _ms(t1 - t0)
        if style == "naskh_rise":
            anim = f"\\an5\\move({cx},{cy + int(H*0.025)},{cx},{cy},0,700)\\fad(150,380)"
        elif style == "kufi_focus":
            anim = (f"\\an5\\pos({cx},{cy})\\fscy82\\fscx112\\t(0,900,0.6,\\fscy100\\fscx100)"
                    f"\\fad(150,380)")
        else:
            anim = (f"\\an5\\pos({cx},{cy})\\fscx106\\fscy106\\t(0,{tot},\\fscx100\\fscy100)"
                    f"\\fad(120,420)")
        shadow = (f"{{{anim}\\1c&H000000&\\1a&H50&\\bord0\\blur14}}" +
                  " ".join(f"{{\\alpha&HFF&\\t({_ms(w['start'] - t0)},{_ms(w['start'] - t0) + 300},\\alpha&H70&)}}"
                           f"{w['word']}" for w in words))
        ev.append(f"Dialogue: 0,{_t(t0)},{_t(t1)},{style},,0,0,0,,{shadow}")
        ev.append(f"Dialogue: 1,{_t(t0)},{_t(t1)},{style},,0,0,0,,{{{anim}}}{body}")
    if title:
        ty = int(H * (0.22 if H > W else 0.2))
        ev.append(f"Dialogue: 2,{_t(0.2)},{_t(min(3.2, scenes[0]['end']))},caption,,0,0,0,,"
                  f"{{\\an5\\pos({cx},{ty})\\fad(500,500)\\blur4\\fscx118\\t(0,1400,0.5,\\blur0.5\\fscx100)\\alpha&H30&}}{title}")
    out.write_text("\n".join(head + ev) + "\n", encoding="utf-8-sig")
    return out
