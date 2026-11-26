"""Builds the «الظل» shadow-theatre film: index.html and compositions/*.html.

Run: python3 tools/build.py   (from the project root)
Times below are absolute seconds in the narration; each scene converts them.
"""
import json
import math
import random
from pathlib import Path

from puppets import puppet

ROOT = Path(__file__).resolve().parent.parent
COMP = ROOT / "compositions"
COMP.mkdir(exist_ok=True)

W, H = 1080, 1920
CLOTH = (70, 240, 940, 880)          # x, y, w, h of the cloth on the frame
FLOOR = 820                          # the rod the puppets stand on, cloth coords
TOTAL = 201.5
MOTHER = (640, FLOOR)                # where the mother sits, cloth coords

FONT_FACE = """
@font-face { font-family: 'Amiri'; font-weight: 400;
  src: url('assets/fonts/amiri-arabic-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'Amiri'; font-weight: 700;
  src: url('assets/fonts/amiri-arabic-700-normal.woff2') format('woff2'); }
"""

SCENES = [  # id, start, end
    ("s1", 0.0, 22.5), ("s2", 22.5, 45.0), ("s3", 45.0, 77.0), ("s4", 77.0, 121.0),
    ("s5", 121.0, 151.0), ("s6", 151.0, 174.0), ("s7", 174.0, TOTAL),
]


def j(v):
    return json.dumps(v, ensure_ascii=False)


def emit(items):
    """Turn recorded tweens into JS. Only each element's earliest fromTo renders immediately;
    the rest get immediateRender: false, so a seek before an element's first tween keeps
    that tween's from-values."""
    first = {}
    for it in items:
        if isinstance(it, tuple):
            _, s, at, _, _ = it
            if s not in first or at < first[s]:
                first[s] = at
    out, done = [], set()
    for it in items:
        if not isinstance(it, tuple):
            out.append(it)
            continue
        _, s, at, frm, to = it
        if at == first[s] and s not in done:
            done.add(s)
        else:
            to = dict(to, immediateRender=False)
        out.append(f"tl.fromTo({j(s)}, {j(frm)}, {j(to)}, {at});")
    return out


class Scene:
    def __init__(self, sid, start, end):
        self.sid, self.start, self.end = sid, start, end
        self.html, self.js, self.piv, self.outer = [], [], {}, []
        self.beam_op = {}

    def t(self, abs_t):
        return round(max(0.0, abs_t - self.start), 3)

    def add(self, kind, pid, fx, fy, outer=False, **kw):
        html, piv = puppet(kind, f"{self.sid}-{pid}", fx, fy, **kw)
        (self.outer if outer else self.html).append(html)
        self.piv[pid] = (piv, kw.get("flip", False))
        return f"#{self.sid}-{pid}"

    def raw(self, html, outer=False):
        (self.outer if outer else self.html).append(html)

    def tw(self, sel, frm, to, at, dur, ease="power2.inOut"):
        # one fromTo per element, so each element's earliest tween can own its baseline
        for s in (sel if isinstance(sel, list) else [sel]):
            self.js.append(("tw", s, self.t(at), frm, dict(to, duration=dur, ease=ease)))

    def set(self, sel, props, at):
        self.js.append(f"tl.set({j(sel)}, {j(props)}, {self.t(at)});")

    def rot(self, pid, part, frm, to, at, dur, ease="power2.inOut"):
        piv, flip = self.piv[pid]
        x, y = piv[part]
        if flip:
            frm, to = -frm, -to
        sel = f"#{self.sid}-{pid}-{part}"
        self.tw(sel, {"rotation": frm, "svgOrigin": f"{x} {y}"},
                {"rotation": to, "svgOrigin": f"{x} {y}"}, at, dur, ease)

    # ---- the shadow vocabulary
    def approach(self, sel, at, dur=1.4, blur=14, scale=1.25, to_opacity=1):
        """A puppet moves from far behind the cloth onto it: blur and size fall."""
        self.tw(sel, {"opacity": 0, "filter": f"blur({blur}px)", "scale": scale},
                {"opacity": to_opacity, "filter": "blur(0px)", "scale": 1}, at, dur, "expo.out")

    def recede(self, sel, at, dur=1.0, blur=14, scale=1.2):
        self.tw(sel, {"opacity": 1, "filter": "blur(0px)", "scale": 1},
                {"opacity": 0, "filter": f"blur({blur}px)", "scale": scale}, at, dur, "power3.in")

    def slide_in(self, sel, at, dx, dur=1.0):
        self.tw(sel, {"x": dx, "opacity": 0}, {"x": 0, "opacity": 1}, at, dur, "expo.out")

    def slide_out(self, sel, at, dx, dur=0.6):
        self.tw(sel, {"x": 0, "opacity": 1}, {"x": dx, "opacity": 0}, at, dur, "power3.in")

    def swap(self, out_sel, in_sel, at):
        """Blur swap on one spot: 0.15 s out, 0.13 s in."""
        self.tw(out_sel, {"opacity": 1, "filter": "blur(0px)"},
                {"opacity": 0, "filter": "blur(8px)"}, at, 0.15, "power2.in")
        self.tw(in_sel, {"opacity": 0, "filter": "blur(8px)"},
                {"opacity": 1, "filter": "blur(0px)"}, at + 0.12, 0.13, "power2.out")

    def light(self, lid, x, width=150, opacity=0.55):
        sel = f"#{self.sid}-{lid}"
        self.raw(f'<div id="{self.sid}-{lid}" class="beam" style="left:{x - width // 2}px;'
                 f'width:{width}px;opacity:{opacity}"></div>')
        self.beam_op[sel] = opacity
        return sel

    def open_light(self, sel, at, dur=1.6):
        op = self.beam_op[sel]
        self.tw(sel, {"opacity": 0, "scaleY": 0.05, "transformOrigin": "50% 0%"},
                {"opacity": op, "scaleY": 1, "transformOrigin": "50% 0%"}, at, dur, "power2.inOut")

    def close_light(self, sel, at, dur=1.0):
        op = self.beam_op[sel]
        self.tw(sel, {"opacity": op}, {"opacity": 0}, at, dur, "power2.inOut")

    def mother(self, opacity, blur, scale=1.0, z=1):
        sel = self.add("mother", "mother", MOTHER[0], MOTHER[1], opacity=opacity, blur=blur,
                       scale=scale, z=z)
        return sel

    def write(self, cam=False):
        dur = round(self.end - self.start, 3)
        body = "\n".join(self.html)
        if cam:
            body = f'<div id="{self.sid}-cam" class="cam">{body}</div>'
        body += "\n" + "\n".join(self.outer)
        js = "\n    ".join(emit(self.js))
        html = f"""<template>
  <style>
    {FONT_FACE}
    #root {{ position: absolute; inset: 0; }}
    .title {{ position: absolute; left: 0; width: {CLOTH[2]}px; direction: rtl; text-align: center;
      font-family: 'Amiri', serif; color: #140B05; z-index: 5; }}
    .cloth-clip {{ position: absolute; left: {CLOTH[0]}px; top: {CLOTH[1]}px;
      width: {CLOTH[2]}px; height: {CLOTH[3]}px; overflow: hidden; }}
    .cam {{ position: absolute; inset: 0; }}
    .pup {{ position: absolute; }}
    .pup svg {{ display: block; }}
    .beam {{ position: absolute; top: 0; height: {FLOOR + 20}px;
      background: linear-gradient(to bottom, rgba(255,243,214,0.9), rgba(255,243,214,0.55) 55%,
        rgba(255,243,214,0));
      filter: blur(24px); mix-blend-mode: screen; z-index: 1; }}
    .flood {{ position: absolute; inset: 0; background: #5A3214; mix-blend-mode: multiply;
      opacity: 0; z-index: 6; }}
    .flash {{ position: absolute; inset: 0; background: #FFE9C2; opacity: 0; z-index: 7; }}
  </style>
  <div id="root" data-composition-id="{self.sid}" data-width="{W}" data-height="{H}">
    <div class="cloth-clip" data-layout-allow-overflow>
{body}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {js}
    tl.set({{}}, {{}}, {dur});
    window.__timelines["{self.sid}"] = tl;
  </script>
</template>
"""
        (COMP / f"{self.sid}.html").write_text(html, encoding="utf-8")


def day_night(sc, t0, t1, period_start, period_end, sun_y=70):
    """Day and night race: a sun crosses the top by day, the cloth floods blue by night."""
    sc.raw(f'<div id="{sc.sid}-flood" class="flood"></div>', outer=True)
    t, k = t0, 0
    while t < t1 - 0.3:
        f = (t - t0) / max(0.001, t1 - t0)
        per = period_start + (period_end - period_start) * f
        half = per / 2
        sid = f"sun{k}"
        mid = f"moon{k}"
        sc.add("sun", sid, 1000, sun_y + 60, scale=0.8, z=1, opacity=0, outer=True)
        sc.add("moon", mid, 1000, sun_y + 50, scale=0.7, z=1, opacity=0, outer=True)
        sc.tw(f"#{sc.sid}-{sid}", {"x": 0, "opacity": 1}, {"x": -1060, "opacity": 1}, t, half, "none")
        sc.set(f"#{sc.sid}-{sid}", {"opacity": 0}, t + half)
        sc.tw(f"#{sc.sid}-flood", {"opacity": 0}, {"opacity": 0.62}, t + half - 0.12, 0.25, "power2.inOut")
        sc.tw(f"#{sc.sid}-{mid}", {"x": 0, "opacity": 1}, {"x": -1060, "opacity": 1}, t + half, half, "none")
        sc.set(f"#{sc.sid}-{mid}", {"opacity": 0}, t + per)
        sc.tw(f"#{sc.sid}-flood", {"opacity": 0.62}, {"opacity": 0}, t + per - 0.12, 0.25, "power2.inOut")
        t += per
        k += 1
    return t


# ====================================================================== scenes

def scene1():
    sc = Scene("s1", 0.0, 22.5)
    # opening title over the music intro, on the cloth like printed card
    sc.raw('<div id="s1-t1" class="title" style="top:150px;font-size:46px;font-weight:400">'
           'للكاتب الروسي</div>')
    sc.raw('<div id="s1-t2" class="title" style="top:212px;font-size:84px;font-weight:700">'
           'أنطون تشيخوف</div>')
    sc.raw('<div id="s1-t3" class="title" style="top:352px;font-size:44px;font-weight:700">'
           'صوت محمد العمري</div>')
    sc.tw("#s1-t1", {"opacity": 1, "filter": "blur(0px)"}, {"opacity": 0, "filter": "blur(8px)"}, 5.9, 0.25, "power2.in")
    sc.tw("#s1-t2", {"opacity": 1, "filter": "blur(0px)"}, {"opacity": 0, "filter": "blur(8px)"}, 5.96, 0.25, "power2.in")
    sc.tw("#s1-t3", {"opacity": 0, "filter": "blur(6px)"}, {"opacity": 1, "filter": "blur(0px)"}, 1.6, 0.2, "power2.out")
    sc.tw("#s1-t3", {"opacity": 1, "filter": "blur(0px)"}, {"opacity": 0, "filter": "blur(8px)"}, 6.02, 0.25, "power2.in")
    bed = sc.add("bed", "bed", 470, FLOOR, scale=1.15, z=2)
    # the man lying on the bed: a standing puppet turned on its back
    # rotated -90 about its centre: head to the headboard, face up, back on the mattress (y 755)
    lying = sc.add("man", "lying", 470, 700 + 144, scale=0.9, z=3)
    soul = sc.add("man", "soul", 470, 700 + 144, scale=0.9, z=3, opacity=0)
    sc.set([lying, soul], {"rotation": -90}, 0)
    sc.tw(soul, {"opacity": 0, "y": 0, "filter": "blur(0px)"},
          {"opacity": 0.85, "y": -30, "filter": "blur(2px)"}, 8.0, 0.8, "power2.out")
    sc.tw(soul, {"opacity": 0.85, "y": -30, "filter": "blur(2px)"},
          {"opacity": 0, "y": -420, "filter": "blur(16px)"}, 8.8, 3.4, "power2.in")
    # «وجدت نفسي هنا» he stands, the bed falls away
    sc.recede([bed, lying], 12.2, 1.0)
    man = sc.add("man", "man", 330, FLOOR, z=4, opacity=0)
    sc.approach(man, 12.7, 1.6)
    # «الملائكة» three columns of light
    beams = [sc.light(f"b{k}", x, 150) for k, x in enumerate((560, 720, 860))]
    for k, b in enumerate(beams):
        sc.open_light(b, 16.3 + k * 0.25, 1.8)
    # «وآخرين لا أعرف منهم» far souls at the back
    for k, x in enumerate((90, 200, 600, 900)):
        s = sc.add("man", f"far{k}", x, FLOOR - 40, scale=0.72, z=1, opacity=0, blur=10,
                   flip=k % 2 == 1)
        sc.tw(s, {"opacity": 0}, {"opacity": 0.42}, 18.9 + k * 0.3, 1.6, "power2.out")
        sc.tw(s, {"opacity": 0.42}, {"opacity": 0}, 21.6, 0.8, "power3.in")
    sc.write()


def scene2():
    sc = Scene("s2", 22.5, 45.0)
    beam = sc.light("beam", 800, 200, 0.6)
    man = sc.add("kneel", "man", 560, FLOOR, z=4)
    sc.tw(man, {"opacity": 0, "filter": "blur(6px)"}, {"opacity": 1, "filter": "blur(0px)"},
          22.5, 0.4, "power2.out")
    # «توسلت بهم» arms raised to the light
    sc.rot("man", "arm", 0, -128, 23.2, 1.2, "expo.out")
    sc.rot("man", "arm2", 0, -112, 23.35, 1.2, "expo.out")
    sc.rot("man", "head", 0, -14, 23.3, 1.2, "expo.out")
    # «زوجتي» the young wife, remembered, slides in on the left
    wife = sc.add("woman", "wife", 200, FLOOR, z=4, opacity=0, pregnant=True, pose="down")
    sc.slide_in(wife, 30.0, -360, 1.4)
    # «ولدي الذي لم يرى النور» the child inside her, a small light
    sc.tw(f"#s2-wife-womb", {"opacity": 0}, {"opacity": 0.95}, 34.5, 1.6, "power2.inOut")
    # «حامل» her hand goes to her belly
    sc.rot("wife", "arm", 0, -38, 41.0, 1.4, "power2.inOut")
    sc.recede(wife, 43.6, 1.2)
    sc.rot("man", "arm", -128, -20, 43.4, 1.4, "power2.inOut")
    sc.rot("man", "arm2", -112, -10, 43.5, 1.4, "power2.inOut")
    sc.rot("man", "head", -14, 0, 43.4, 1.4, "power2.inOut")
    sc.close_light(beam, 43.8, 1.1)
    sc.write()


def scene3():
    sc = Scene("s3", 45.0, 77.0)
    man = sc.add("kneel", "man", 560, FLOOR, z=4, arm_rot=-20)
    # «جاء أحد الملائكة» a column descends, carrying the TV
    beam = sc.light("beam", 430, 380, 0.55)
    sc.open_light(beam, 47.4, 2.0)
    tvx, tvy = 430, 520
    tv = sc.add("tv", "tv", tvx, tvy, scale=1.15, z=3)
    sc.tw(tv, {"y": -760, "opacity": 1}, {"y": 0, "opacity": 1}, 49.6, 3.2, "power2.inOut")
    sc.rot("man", "head", 0, -16, 51.2, 1.4, "power2.inOut")
    # «التوقيت بين الدنيا والآخرة» an hourglass
    hg = sc.add("hourglass", "hg", 150, FLOOR, z=4, opacity=0)
    sc.slide_in(hg, 57.2, -260, 1.2)
    sc.tw("#s3-hg-top", {"scaleY": 1, "transformOrigin": "50% 100%"},
          {"scaleY": 0.15, "transformOrigin": "50% 100%"}, 59.6, 7.2, "none")
    sc.tw("#s3-hg-bot", {"scaleY": 0.3, "transformOrigin": "50% 100%"},
          {"scaleY": 1, "transformOrigin": "50% 100%"}, 59.6, 7.2, "none")
    # «الأيام» three suns cross while the hourglass turns once
    for k in range(3):
        s = sc.add("sun", f"sun{k}", 1000, 130, scale=0.75, z=1, opacity=0)
        sc.tw(s, {"x": 0, "opacity": 1}, {"x": -1060, "opacity": 1}, 66.6 + k * 0.42, 0.62, "none")
        sc.set(s, {"opacity": 0}, 66.6 + k * 0.42 + 0.62)
    sc.tw("#s3-hg-body", {"rotation": 0, "svgOrigin": "48 80"},
          {"rotation": 180, "svgOrigin": "48 80"}, 67.1, 0.7, "power2.inOut")
    sc.rot("man", "head", -16, -24, 71.4, 1.2, "power2.inOut")
    # «قام بتشغيل الشاشة» the screen lights and swallows the frame
    sc.tw("#s3-tv-screen", {"opacity": 0}, {"opacity": 0.95}, 75.6, 0.5, "power2.out")
    sc.tw(tv, {"scale": 1, "x": 0, "y": 0, "transformOrigin": "42.7% 54.2%"},
          {"scale": 7.5, "x": 470 - tvx, "y": 440 - (tvy - 131), "transformOrigin": "42.7% 54.2%"},
          75.9, 1.1, "power3.in")
    sc.tw([man, hg, beam], {"opacity": 1}, {"opacity": 0}, 75.9, 0.5, "power2.in")
    sc.raw('<div id="s3-flash" class="flash"></div>')
    sc.tw("#s3-flash", {"opacity": 0}, {"opacity": 1}, 76.7, 0.3, "power2.in")
    sc.write()


def scene4():
    sc = Scene("s4", 77.0, 121.0)
    sc.raw('<div id="s4-flash" class="flash"></div>')
    sc.tw("#s4-flash", {"opacity": 1}, {"opacity": 0}, 77.0, 0.6, "power2.out")
    mom = sc.mother(0.3, 12, z=1)
    sofa_a = sc.add("sofa", "sofa_a", 150, FLOOR, style="a", z=2)
    lamp_a = sc.add("lamp", "lamp_a", 300, FLOOR, style="a", z=2)
    sofa_b = sc.add("sofa", "sofa_b", 150, FLOOR, style="b", z=2, opacity=0)
    lamp_b = sc.add("lamp", "lamp_b", 300, FLOOR, style="b", z=2, opacity=0)
    # «فظهرت زوجتي ... تحمل طفلا»
    wife = sc.add("woman", "wife", 470, FLOOR, z=4, baby=True, pose="baby")
    wife2 = sc.add("woman", "wife2", 470, FLOOR, z=4, opacity=0)
    wife3 = sc.add("woman", "wife3", 470, FLOOR, z=4, opacity=0, envelope=True, pose="hold")
    # the son grows: 90 -> 160 -> 240 px
    kids = [sc.add("child", f"kid{k}", 610, FLOOR, scale=s, z=4, opacity=0, flip=True)
            for k, s in enumerate((0.45, 0.8, 1.2))]
    sc.swap("#s4-wife-baby", kids[0], 89.0)
    sc.set("#s4-wife-baby", {"opacity": 0}, 89.2)
    sc.swap(wife, wife2, 89.0)
    sc.swap(kids[0], kids[1], 92.8)
    sc.swap(kids[1], kids[2], 94.0)
    # «غيرت زوجتي الأثاث»
    sc.swap(sofa_a, sofa_b, 100.2)
    sc.swap(lamp_a, lamp_b, 100.35)
    # «راتبي التقاعدي» the envelope
    sc.swap(wife2, wife3, 104.9)
    # «دخل ابني للمدرسة» pan: the room goes, the school comes in
    for s in (sofa_b, lamp_b, wife3, kids[2]):
        sc.slide_out(s, 106.5, -700, 0.7)
    sch = sc.add("school", "school", 620, FLOOR, z=2, opacity=0)
    sc.slide_in(sch, 106.7, 700, 1.0)
    pupil = sc.add("child", "pupil", 300, FLOOR, scale=0.8, z=4, opacity=0, backpack=True)
    sc.slide_in(pupil, 107.2, -300, 0.8)
    sc.tw(pupil, {"x": 0}, {"x": 320}, 108.2, 1.4, "power2.inOut")
    sc.tw(pupil, {"opacity": 1}, {"opacity": 0}, 109.4, 0.3, "power2.in")
    # «تزوج إخوتي الواحدة والآخر»
    sc.slide_out(sch, 110.0, -800, 0.7)
    arch = sc.add("arch", "arch", 470, FLOOR, z=2, opacity=0)
    sc.slide_in(arch, 110.2, 800, 1.0)
    c1 = sc.add("couple", "c1", 470, FLOOR, scale=0.9, z=4, opacity=0)
    c2 = sc.add("couple", "c2", 470, FLOOR, scale=0.9, z=4, opacity=0, flip=True)
    sc.approach(c1, 111.9, 1.0)
    sc.swap(c1, c2, 113.8)
    # «أصبحت للجميع حياته الخاصة» everyone leaves in a different direction
    sc.slide_out(arch, 116.0, 900, 0.8)
    walkers = [(sc.add("woman", "w_a", 470, FLOOR, z=4, opacity=0), -700),
               (sc.add("child", "w_b", 470, FLOOR, scale=1.2, z=4, opacity=0), 700),
               (sc.add("couple", "w_c", 470, FLOOR, scale=0.9, z=4, opacity=0), -700)]
    sc.set(c2, {"opacity": 0}, 116.0)
    for k, (s, dx) in enumerate(walkers):
        sc.set(s, {"opacity": 1}, 116.0)
        sc.tw(s, {"x": 0}, {"x": dx}, 116.6 + k * 0.5, 2.4, "power2.in")
        sc.set(s, {"opacity": 0}, 119.2 + k * 0.5)
    day_night(sc, 85.4, 121.0, 1.8, 1.0)
    sc.write()


STREAK_KINDS = ["man", "woman", "child", "couple", "sofa", "woman", "man", "child"]


def streaks(sc, t0, t1, every, opacity=1.0, blur=8, seed=7):
    rnd = random.Random(seed)
    t, k = t0, 0
    sels = []
    while t < t1:
        kind = STREAK_KINDS[k % len(STREAK_KINDS)]
        kw = {"style": "a"} if kind == "sofa" else {}
        left = k % 2 == 0
        x = 1200 if left else -260
        s = sc.add(kind, f"st{k}", x, FLOOR - rnd.choice((0, 0, 40, 80)),
                   scale=rnd.choice((0.8, 1.0, 1.2)), z=3, opacity=0,
                   flip=not left, **kw)
        dur = rnd.uniform(0.7, 1.3)
        f = f"blur({blur}px)"
        sc.tw(s, {"x": 0, "opacity": opacity, "filter": f},
              {"x": -1500 if left else 1500, "opacity": opacity, "filter": f}, t, dur, "none")
        sc.set(s, {"opacity": 0}, t + dur)
        sels.append(s)
        t += every * rnd.uniform(0.7, 1.3)
        k += 1
    return sels


def scene5():
    sc = Scene("s5", 121.0, 151.0)
    mom = sc.mother(0.3, 12, z=1)
    streaks(sc, 121.0, 130.0, 0.75, 0.95, 7, seed=3)
    streaks(sc, 130.0, 151.0, 1.2, 0.45, 14, seed=5)
    # «لاحظت شيئا ثابتا» the corner shape darkens, still unreadable
    sc.tw(mom, {"opacity": 0.3, "filter": "blur(12px)"}, {"opacity": 0.85, "filter": "blur(7px)"},
          130.2, 2.2, "power2.inOut")
    # «يصغر ويخفض»
    sc.tw(mom, {"scale": 1, "y": 0, "transformOrigin": "50% 100%"},
          {"scale": 0.88, "y": 28, "transformOrigin": "50% 100%"}, 147.4, 3.6, "power2.inOut")
    day_night(sc, 121.0, 151.0, 1.0, 0.9)
    sc.write()


def scene6():
    sc = Scene("s6", 151.0, 174.0)
    mom = sc.mother(0.85, 7, scale=0.88, z=2)
    sc.set(mom, {"y": 28, "transformOrigin": "50% 100%"}, 151.0)
    beam = sc.light("beam", 220, 200, 0.5)
    sc.open_light(beam, 154.6, 1.8)
    streaks(sc, 151.0, 172.3, 1.4, 0.4, 14, seed=9)
    # «يقرب لهذا الظل» the camera pushes to the corner and centres her
    mx, my = MOTHER[0], MOTHER[1] - 70           # her middle, cloth coords
    def cam(s):
        return {"scale": s, "x": round(470 - s * mx), "y": round(470 - s * my),
                "transformOrigin": "0px 0px"}
    sc.tw("#s6-cam", {"scale": 1, "x": 0, "y": 0, "transformOrigin": "0px 0px"}, cam(1.8),
          158.4, 6.0, "power2.inOut")
    sc.tw("#s6-cam", cam(1.8), cam(2.2), 167.6, 2.4, "power2.inOut")
    # «بذات التوقيت الأرضي» time stops, she comes into focus
    sc.tw(mom, {"filter": "blur(7px)", "opacity": 0.85}, {"filter": "blur(0px)", "opacity": 1},
          172.3, 1.6, "power2.inOut")
    sc.close_light(beam, 171.0, 1.2)
    end = day_night(sc, 151.0, 172.3, 0.9, 0.9)
    sc.write(cam=True)


def scene7():
    sc = Scene("s7", 174.0, TOTAL)
    s = 2.2
    mx, my = MOTHER[0], MOTHER[1] - 70
    # the mother as scene 6 left her: centred and 2.2x, feet below centre
    # in scene 6 her feet sit at (mx, MOTHER y + 28) and the camera maps (mx, my) to (470, 470)
    mom = sc.add("mother", "mother", 470, round(470 + s * (MOTHER[1] + 28 - my)),
                 scale=s * 0.88, z=2)
    man = sc.add("sitback", "man", 150, FLOOR + 40, scale=1.0, z=5, opacity=0)
    sc.slide_in(man, 175.0, -280, 1.4)
    # «خمسة عشر عام» fifteen cuts on the cloth
    marks = []
    for k in range(15):
        grp, i = divmod(k, 5)
        x = 120 + grp * 120 + i * 16
        if i < 4:
            mk = (f'<div id="s7-m{k}" class="pup" style="left:{x}px;top:70px;width:7px;height:56px;'
                  f'background:#140B05;opacity:0;z-index:4"></div>')
        else:
            mk = (f'<div id="s7-m{k}" class="pup" style="left:{x - 52}px;top:96px;width:76px;'
                  f'height:7px;background:#140B05;opacity:0;z-index:4;"></div>')
        sc.raw(mk)
        marks.append(f"#s7-m{k}")
        if i == 4:
            sc.tw(f"#s7-m{k}", {"opacity": 0, "rotation": -28, "scaleX": 0},
                  {"opacity": 1, "rotation": -28, "scaleX": 1}, 178.6 + k * 0.085, 0.12, "power2.out")
        else:
            sc.tw(f"#s7-m{k}", {"opacity": 0, "scaleY": 0}, {"opacity": 1, "scaleY": 1},
                  178.6 + k * 0.085, 0.12, "power2.out")
    # «يبكي» her shoulders shake; «فأبكي» his answer
    t = 182.4
    while t < TOTAL - 1.6:
        sc.tw("#s7-mother-sh", {"y": 0, "rotation": 0, "svgOrigin": "130 120"},
              {"y": -6, "rotation": -2, "svgOrigin": "130 120"}, t, 0.6, "power2.inOut")
        sc.tw("#s7-mother-sh", {"y": -6, "rotation": -2, "svgOrigin": "130 120"},
              {"y": 0, "rotation": 0, "svgOrigin": "130 120"}, t + 0.6, 0.8, "power2.inOut")
        t += 1.4
    t = 183.5
    while t < 189.0:
        sc.tw("#s7-man-sh", {"y": 0}, {"y": -5}, t, 0.7, "power2.inOut")
        sc.tw("#s7-man-sh", {"y": -5}, {"y": 0}, t + 0.7, 0.9, "power2.inOut")
        t += 1.6
    # «أمي» only she remains
    sc.tw([man] + marks, {"opacity": 1}, {"opacity": 0}, 189.0, 0.6, "power2.in")
    sc.tw(mom, {"scale": 1, "transformOrigin": "50% 100%"}, {"scale": 1.12, "transformOrigin": "50% 100%"},
          189.3, 4.0, "power2.inOut")
    sc.write()


# ====================================================================== stage

def mashrabiya_path(x0, y0, w, h, n):
    d = f"M0,0 H{W} V{CLOTH[1]} H0 Z "
    step = w / n
    r1, r2 = step * 0.34, step * 0.34 * 0.78
    for row in range(2):
        for k in range(n):
            cx = x0 + step * (k + 0.5 + (0.5 if row else 0))
            if cx > x0 + w:
                continue
            cy = y0 + h * (0.3 + 0.45 * row)
            pts = []
            for i in range(16):
                a = i * math.pi / 8 + math.pi / 16
                r = r1 if i % 2 == 0 else r2
                pts.append(f"{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}")
            d += "M" + " L".join(pts) + " Z "
    return d


def stage():
    rnd = random.Random(11)
    flick = []
    t = 1.4
    while t < TOTAL - 7:
        flick.append((round(t, 2), round(rnd.uniform(0.0, 0.55), 2)))
        t += rnd.uniform(0.6, 1.4)
    js = ["tl.fromTo('#st-dim', {opacity: 0.3}, {opacity: 0, duration: 1.2, ease: 'expo.out'}, 0);"]
    prev = 0.3
    for t, v in flick:
        ir = "" if t == flick[0][0] else ", immediateRender: false"
        js.append(f"tl.fromTo('#st-flick', {{opacity: {prev}}}, {{opacity: {v}, duration: 0.5, "
                  f"ease: 'power2.inOut'{ir}}}, {t});")
        prev = v
    js.append(f"tl.fromTo('#st-dim', {{opacity: 0}}, {{opacity: 0.78, duration: 6, ease: 'power2.in', immediateRender: false}}, "
              f"{TOTAL - 6.5});")
    js.append(f"tl.set({{}}, {{}}, {TOTAL});")
    cx, cy, cw, ch = CLOTH
    html = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; background: #1A0E07; }}
    #st-cloth {{ position: absolute; left: {cx}px; top: {cy}px; width: {cw}px; height: {ch}px;
      background:
        repeating-linear-gradient(0deg, rgba(70,35,10,0.07) 0 1px, transparent 1px 4px),
        repeating-linear-gradient(90deg, rgba(70,35,10,0.06) 0 1px, transparent 1px 5px),
        radial-gradient(ellipse 70% 60% at 50% 32%, #F4BE6C 0%, #E9A957 30%, #C67C34 72%, #9C5A22 100%); }}
    #st-flick {{ position: absolute; left: {cx}px; top: {cy}px; width: {cw}px; height: {ch}px;
      background: radial-gradient(ellipse 45% 38% at 50% 30%, rgba(255,226,160,0.55), rgba(255,226,160,0));
      opacity: 0.3; }}
    #st-rod {{ position: absolute; left: {cx}px; top: {cy + FLOOR}px; width: {cw}px; height: 8px;
      background: #140B05; opacity: 0.85; }}
    #st-sill {{ position: absolute; left: {cx}px; top: {cy + FLOOR + 8}px; width: {cw}px;
      height: {ch - FLOOR - 8}px; background: linear-gradient(#5A2E0F, #3A1D0A); opacity: 0.92; }}
    #st-band {{ position: absolute; left: 0; top: 140px; width: {W}px; height: 100px;
      background: linear-gradient(#E9A957, #B86E2C); }}
    #st-top {{ position: absolute; left: 0; top: 0; width: {W}px; height: {cy}px; }}
    .wood {{ position: absolute; background: #2A170B; }}
    #st-apron {{ position: absolute; left: 0; top: {cy + ch}px; width: {W}px; height: 150px;
      background: linear-gradient(#3A2010, #24130A); border-top: 3px solid #6B4022; }}
    #st-curtain {{ position: absolute; left: 0; top: {cy + ch + 150}px; width: {W}px;
      height: {H - cy - ch - 150}px;
      background: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0) 22%),
        repeating-linear-gradient(90deg, #36090A 0px, #5E1511 38px, #6A1813 46px, #36090A 90px); }}
    #st-dim {{ position: absolute; inset: 0; background: #0B0603; opacity: 0; }}
  </style>
  <div id="root" data-composition-id="stage" data-width="{W}" data-height="{H}">
    <div id="st-cloth"></div>
    <div id="st-flick"></div>
    <div id="st-rod"></div>
    <div id="st-sill"></div>
    <div id="st-band"></div>
    <svg id="st-top" viewBox="0 0 {W} {cy}" width="{W}" height="{cy}">
      <path d="{mashrabiya_path(80, 150, 920, 80, 12)}" fill="#2A170B" fill-rule="evenodd"/>
      <rect x="0" y="{cy - 10}" width="{W}" height="10" fill="#4A2A14"/>
    </svg>
    <div class="wood" style="left:0;top:{cy}px;width:{cx}px;height:{ch}px"></div>
    <div class="wood" style="left:{cx + cw}px;top:{cy}px;width:{W - cx - cw}px;height:{ch}px"></div>
    <div id="st-apron"></div>
    <div id="st-curtain"></div>
    <div id="st-dim"></div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join('    ' + x for x in js).strip()}
    window.__timelines["stage"] = tl;
  </script>
</template>
"""
    (COMP / "stage.html").write_text(html, encoding="utf-8")


# ====================================================================== captions

def captions():
    words = json.loads((ROOT / "assets" / "transcript.json").read_text(encoding="utf-8"))
    words = words[:-1]                      # «أمي» lands on its own in the final shot
    groups, cur = [], []
    for k, w in enumerate(words):
        if cur:
            gap = w["start"] - cur[-1]["end"]
            chars = sum(len(x["text"]) + 1 for x in cur) + len(w["text"])
            if gap >= 0.45 or len(cur) >= 5 or chars > 24:
                groups.append(cur)
                cur = []
        cur.append(w)
    if cur:
        groups.append(cur)
    html, js = [], []
    for gi, g in enumerate(groups):
        start = max(0.1, g[0]["start"] - 0.15)
        last_start = json.loads((ROOT / "assets" / "transcript.json").read_text(encoding="utf-8"))[-1]["start"]
        nxt = groups[gi + 1][0]["start"] - 0.15 if gi + 1 < len(groups) else last_start - 0.1
        end = round(min(nxt, g[-1]["end"] + 1.0), 2)
        spans = " ".join(f'<span id="cw-{w["id"]}" class="w">{w["text"]}</span>' for w in g)
        html.append(f'<div id="cg-{gi}" class="cg">{spans}</div>')
        js.append(f"tl.fromTo('#cg-{gi}', {{opacity: 0, filter: 'blur(6px)'}}, "
                  f"{{opacity: 1, filter: 'blur(0px)', duration: 0.18, ease: 'power2.out'}}, {start:.2f});")
        for w in g:
            js.append(f"tl.fromTo('#cw-{w['id']}', {{color: '#A88B68'}}, "
                      f"{{color: '#FFF1DA', duration: 0.12, ease: 'none'}}, {w['start']:.2f});")
        js.append(f"tl.to('#cg-{gi}', {{opacity: 0, duration: 0.12, ease: 'power2.in'}}, {end - 0.12:.2f});")
        js.append(f"tl.set('#cg-{gi}', {{opacity: 0, visibility: 'hidden'}}, {end:.2f});")
    # the last word
    last = json.loads((ROOT / "assets" / "transcript.json").read_text(encoding="utf-8"))[-1]
    html.append('<div id="cap-last" class="cg last">أمي</div>')
    js.append(f"tl.fromTo('#cap-last', {{opacity: 0, filter: 'blur(10px)', scale: 1.08}}, "
              f"{{opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.9, ease: 'expo.out'}}, "
              f"{last['start'] - 0.05:.2f});")
    js.append(f"tl.set({{}}, {{}}, {TOTAL});")
    top = CLOTH[1] + CLOTH[3] + 12
    out = f"""<template>
  <style>
    {FONT_FACE}
    #root {{ position: absolute; inset: 0; }}
    .cg {{ position: absolute; left: 120px; width: 660px; top: {top}px; height: 108px;
      display: flex; align-items: center; justify-content: center; direction: rtl;
      font-family: 'Amiri', serif; font-weight: 700; font-size: 58px; line-height: 1.2;
      color: #FFF1DA; opacity: 0; overflow: visible; padding: 0; text-align: center; }}
    .cg .w {{ margin: 0 0.14em; color: #A88B68; }}
    .cg.last {{ font-size: 92px; line-height: 1; color: #F2B35B; top: {top - 22}px; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="{W}" data-height="{H}">
    {chr(10).join('    ' + h for h in html).strip()}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join('    ' + x for x in js).strip()}
    window.__timelines["captions"] = tl;
  </script>
</template>
"""
    (COMP / "captions.html").write_text(out, encoding="utf-8")
    return len(groups)


# ====================================================================== root

def index():
    hosts = ['      <div id="stage" data-composition-id="stage" data-composition-src="compositions/stage.html" '
             f'data-start="0" data-duration="{TOTAL}" data-track-index="0" data-track-kind="graphics" '
             f'data-width="{W}" data-height="{H}" style="z-index:1"></div>']
    for sid, s, e in SCENES:
        hosts.append(f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" '
                     f'data-start="{s}" data-duration="{round(e - s, 3)}" data-track-index="1" '
                     f'data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:2"></div>')
    hosts.append('      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" '
                 f'data-start="0" data-duration="{TOTAL}" data-track-index="2" data-track-kind="captions" '
                 f'data-width="{W}" data-height="{H}" style="z-index:3"></div>')
    hosts.append(f'      <audio id="narration" src="assets/narration.mp3" data-start="0" data-duration="{TOTAL}" '
                 'data-track-index="3" data-volume="1" data-fade-out="2"></audio>')
    html = f"""<!doctype html>
<html lang="ar" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      {FONT_FACE}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: #1A0E07; }}
      #root {{ position: relative; width: 100%; height: 100%; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}"
      data-width="{W}" data-height="{H}">
{chr(10).join(hosts)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""
    (ROOT / "index.html").write_text(html, encoding="utf-8")


if __name__ == "__main__":
    stage()
    for fn in (scene1, scene2, scene3, scene4, scene5, scene6, scene7):
        fn()
    n = captions()
    index()
    print(f"built: stage, 7 scenes, {n} caption groups")
