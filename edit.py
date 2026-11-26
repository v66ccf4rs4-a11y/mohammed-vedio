#!/usr/bin/env python3
"""مونتاج احترافي عمودي 9:16 للتعليق الصوتي.
الاستخدام: python3 edit.py            (يبني final_9x16.mp4)
           python3 edit.py --preview  (صور اختبار لكل لقطة فقط)
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(ROOT, "voiceover.mp3")
B = os.path.join(ROOT, "build2")
OUT = os.path.join(ROOT, "final_9x16.mp4")
TOTAL = 201.7667
FPS = 30

CLIPS = {
    "sky":   "footage/1_sky.mp4",
    "tv":    "footage/2_tv.mp4",
    "baby":  "footage/3_baby.mp4",
    "room":  "footage/4_dark_room.mp4",
    "woman": "footage/5_old_woman.mp4",
}

# مركز الوجوه للقطات القريبة (نسبة من عرض/ارتفاع الإطار 9:16)
FACE = {"woman": (0.70, 0.27), "baby": (0.45, 0.37)}

# (بداية في الفيديو, المقطع, بداية في المصدر, السرعة, تقريب, قلب أفقي, حركة الكاميرا, ظهور, اختفاء, تعريض)
# السرعة <1 = بطيء، >1 = سريع. حركة: +1 دفع للأمام، -1 سحب للخلف، 0 ثابت.
S = [
    # ── أ: الموت والملائكة ──
    (0.0,   "sky",   0.0, 0.8, 1.00, 0, +1, 1.5, 0,   0),
    (6.8,   "sky",   8.0, 1.0, 1.05, 0, -1, 0,   0,   0),
    (11.4,  "sky",  12.5, 1.0, 1.00, 1, +1, 0,   0,   0),
    (15.0,  "sky",  16.5, 1.0, 1.10, 0, +1, 0,   0,   0),
    (19.1,  "sky",  21.5, 0.8, 1.15, 1, -1, 0,   0,   0),
    (23.2,  "sky",  25.0, 1.0, 1.00, 0, +1, 0,   0,   0),
    (29.8,  "baby",  2.6, 0.8, 1.10, 1, +1, 0,   0,   0),
    (33.6,  "sky",  28.0, 0.9, 1.05, 0, +1, 0,   0.6, 0),
    (38.9,  "room",  0.0, 0.8, 1.00, 0, +1, 0.6, 0,   0.05),
    # ── ب: الملاك والشاشة ──
    (44.9,  "sky",   4.0, 1.0, 1.00, 1, -1, 0,   0,   0),
    (48.8,  "sky",  18.5, 0.8, 1.15, 0, +1, 0,   0,   0),
    (51.2,  "tv",    0.0, 0.6, 1.00, 0, +1, 0,   0,   0),
    (55.2,  "sky",   9.0, 1.0, 1.00, 1, +1, 0,   0,   0),
    (59.7,  "sky",  23.5, 1.0, 1.10, 0, -1, 0,   0,   0),
    (63.3,  "sky",   0.0, 2.0, 1.00, 0, +1, 0,   0,   0),
    (69.5,  "tv",    0.4, 0.5, 1.20, 1, +1, 0,   0,   0),
    # ── ج: ما يظهر على الشاشة ──
    (74.3,  "tv",    1.9, 0.5, 1.00, 0, +1, 0,   0,   0),
    (78.1,  "tv",    5.0, 1.0, 1.00, 0,  0, 0,   0,   0),       # وميض تشويش
    (78.4,  "baby",  2.5, 1.0, 1.00, 0, +1, 0,   0,   0),
    (84.3,  "sky",   0.0, 4.0, 1.00, 0,  0, 0,   0,   0),
    (87.2,  "room",  0.0, 2.0, 1.00, 1,  0, 0,   0,   0.05),
    (91.4,  "baby",  0.0, 1.0, 1.35, 0, +1, 0,   0,   0),
    (95.2,  "tv",    6.0, 1.0, 1.00, 0,  0, 0,   0,   0),       # وميض تشويش
    (95.45, "sky",  20.0, 3.0, 1.00, 1,  0, 0,   0,   0),
    (98.3,  "room",  4.0, 1.0, 1.10, 1, -1, 0,   0,   0.05),
    (101.9, "baby",  5.4, 0.8, 1.15, 1, +1, 0,   0,   0),
    (107.4, "tv",    4.4, 1.0, 1.00, 0,  0, 0,   0,   0),       # وميض تشويش
    (107.6, "sky",   9.0, 3.0, 1.00, 0,  0, 0,   0,   0),
    (111.0, "woman", 0.0, 0.9, 1.00, 1, +1, 0,   0,   0),
    (115.4, "sky",  25.0, 1.0, 1.00, 0, +1, 0,   0.6, 0),
    # ── د: الظل ──
    (120.5, "sky",  14.0, 2.0, 1.00, 1,  0, 0.5, 0,   0),
    (124.9, "tv",    4.0, 0.66, 1.00, 0, +1, 0,  0,   0),
    (130.5, "room",  0.0, 0.6, 1.00, 0, +1, 0,   0,   0),
    (137.2, "sky",  18.0, 2.0, 1.00, 0,  0, 0,   0,   0),
    (140.6, "room",  5.0, 0.8, 1.20, 0, +1, 0,   0,   0),
    (144.9, "sky",   0.0, 3.0, 1.00, 1,  0, 0,   0,   0),
    (148.8, "room",  7.8, 0.9, 1.30, 1, -1, 0,   0,   0),
    (152.5, "sky",  12.0, 1.0, 1.05, 0, +1, 0,   0,   0),
    (156.4, "room",  0.0, 0.6, 1.00, 0, +3, 0,   0.6, 0),       # «يقرّب لي هذا الظل»
    # ── هـ: الكشف ──
    (162.7, "sky",   5.0, 1.0, 1.00, 0, +1, 0.6, 0,   0),
    (169.9, "tv",    0.0, 0.6, 1.10, 1, +1, 0,   0,   0),
    (174.2, "sky",  26.0, 0.7, 1.05, 0, -1, 0,   0,   0),
    (179.9, "woman", 6.0, 0.7, 1.90, 0, +1, 0,   0,   0),
    (183.7, "sky",  30.0, 0.7, 1.10, 1, +1, 0,   0,   0),
    (186.0, "woman",10.0, 0.7, 1.60, 0, +1, 0,   0,   0),
    (189.4, "woman",14.0, 0.5, 2.10, 0, +2, 0,   1.5, 0),       # «سوى أمي»
    (195.5, "black", 0.0, 1.0, 1.00, 0,  0, 0,   0,   0),
]

GRADE = ("eq=contrast=1.06:saturation=0.92:gamma=0.98:brightness={exp},"
         "colorbalance=rs=0.035:bs=-0.035:rm=0.04:bm=-0.04:rh=0.025:bh=-0.02,"
         "curves=all='0/0.035 0.25/0.23 0.75/0.77 1/0.97',"
         "noise=alls=5:allf=t,vignette=angle=PI/7")


def run(cmd):
    subprocess.run(cmd, check=True)


def seg_filter(clip, speed, tight, flip, move, dur, fin, fout, exp):
    n = max(1, round(dur * FPS))
    k = 0.04 * abs(move)                    # مقدار حركة الكاميرا
    if move > 0:
        z = f"{tight}*(1+{k}*on/{n})"
    elif move < 0:
        z = f"{tight}*(1+{k}-{k}*on/{n})"
    else:
        z = f"{tight}"
    cx, cy = FACE.get(clip, (0.5, 0.5)) if tight > 1.25 else (0.5, 0.5)
    if flip:
        cx = 1 - cx
    x = f"max(0,min(iw-iw/zoom,{cx}*iw-iw/zoom/2))"
    y = f"max(0,min(ih-ih/zoom,{cy}*ih-ih/zoom/2))"
    f = [f"setpts=PTS/{speed}", f"fps={FPS}",
         "scale=2160:3840:force_original_aspect_ratio=increase:flags=lanczos,crop=2160:3840"]
    if flip:
        f.append("hflip")
    f.append(f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s=1080x1920:fps={FPS}")
    f.append(GRADE.format(exp=exp))
    if fin:
        f.append(f"fade=t=in:st=0:d={fin}")
    if fout:
        f.append(f"fade=t=out:st={dur - fout:.3f}:d={fout}")
    f.append("format=yuv420p")
    return ",".join(f)


def build_segments(preview=False):
    os.makedirs(B, exist_ok=True)
    files = []
    for i, (st, clip, ss, speed, tight, flip, move, fin, fout, exp) in enumerate(S):
        end = S[i + 1][0] if i + 1 < len(S) else TOTAL
        dur = round(end - st, 3)
        out = os.path.join(B, f"seg{i:02d}.mp4")
        files.append(out)
        if clip == "black":
            if not preview:
                run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
                     f"color=black:s=1080x1920:r={FPS}:d={dur}", "-c:v", "libx264",
                     "-crf", "16", "-pix_fmt", "yuv420p", out])
            continue
        if not preview and os.path.exists(out) and os.path.getsize(out) > 0:
            continue
        vf = seg_filter(clip, speed, tight, flip, move, dur, fin, fout, exp)
        src = os.path.join(ROOT, CLIPS[clip])
        need = dur * speed + 0.2
        if preview:
            run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(ss), "-i", src,
                 "-t", str(min(need, 1.5)), "-vf", vf + ",scale=270:480",
                 "-frames:v", "1", "-update", "1", os.path.join(B, f"p{i:02d}.jpg")])
            continue
        print(f"[{i+1}/{len(S)}] {st:6.1f}s {clip} ({dur}s)", flush=True)
        tmp = out + ".tmp.mp4"
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(ss), "-i", src,
             "-t", f"{need:.3f}", "-an", "-vf", vf, "-t", str(dur),
             "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-r", str(FPS), tmp])
        os.replace(tmp, out)
    return files


def final(files):
    lst = os.path.join(B, "list.txt")
    with open(lst, "w") as fh:
        fh.writelines(f"file '{f}'\n" for f in files)
    ass = os.path.join(ROOT, "captions.ass")
    vf = f"subtitles='{ass}':fontsdir=/usr/share/fonts"
    run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
         "-i", VO, "-vf", vf, "-map", "0:v", "-map", "1:a",
         "-af", f"afade=t=in:d=0.3,afade=t=out:st={TOTAL-2}:d=2",
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "6M", "-bufsize", "12M",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", str(TOTAL),
         "-movflags", "+faststart", OUT])
    print("تم:", OUT)


if __name__ == "__main__":
    os.chdir(ROOT)
    if "--preview" in sys.argv:
        build_segments(preview=True)
    else:
        final(build_segments())
