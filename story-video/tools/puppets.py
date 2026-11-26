"""Shadow-puppet silhouettes (خيال الظل) as SVG.

Every puppet is drawn in its own box with the feet at the bottom centre.
Animated parts are <g> elements with ids built from the puppet's id, and
each part's pivot is returned so scenes can rotate it with GSAP's svgOrigin.
"""

INK = "#140B05"
PIN = "#4A3320"


def circ(cx, cy, r):
    return f"M{cx - r},{cy} a{r},{r} 0 1,0 {2 * r},0 a{r},{r} 0 1,0 {-2 * r},0 Z"


def rrect(x, y, w, h, r):
    return (f"M{x + r},{y} H{x + w - r} Q{x + w},{y} {x + w},{y + r} V{y + h - r} "
            f"Q{x + w},{y + h} {x + w - r},{y + h} H{x + r} Q{x},{y + h} {x},{y + h - r} "
            f"V{y + r} Q{x},{y} {x + r},{y} Z")


def pin(cx, cy):
    return f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{PIN}"/>'


def p(d, extra=""):
    return f'<path d="{d}" fill="{INK}" fill-rule="evenodd" {extra}/>'


def arm(gid, sx, sy, length, rot=0, hand=None, width=15):
    """An arm hanging from shoulder (sx, sy); rot rotates it at the shoulder."""
    body = p(rrect(sx - width / 2, sy - 6, width, length, width / 2))
    body += p(circ(sx, sy + length - 2, width * 0.62))
    if hand:
        body += hand(sx, sy + length)
    t = f' transform="rotate({rot} {sx} {sy})"' if rot else ""
    return f'<g id="{gid}"{t}>{body}{pin(sx, sy)}</g>'


# ---------------------------------------------------------------- people

def man_stand(pid, arm_rot=0, arm2_rot=0):
    """Man in thobe and ghutra, facing right. Box 130 x 320."""
    head = p("M41,50 Q42,17 65,17 Q88,17 89,50 L97,100 L33,100 Z")   # ghutra drape
    head += p("M88,44 L99,58 L89,64 Z")                               # nose
    head += p("M84,64 Q92,76 86,88 L76,84 Z")                         # beard
    body = p("M37,94 L93,94 Q101,150 104,222 L109,318 L21,318 L26,222 Q29,150 37,94 Z")
    back = arm(f"{pid}-arm2", 46, 104, 108, arm2_rot)
    front = arm(f"{pid}-arm", 84, 104, 112, arm_rot)
    svg = back + body + f'<g id="{pid}-head">{head}</g>' + front
    return svg, 130, 320, {"arm": (84, 104), "arm2": (46, 104), "head": (65, 92)}


def man_kneel(pid, arm_rot=0):
    """Man kneeling, facing right. Box 160 x 236."""
    head = p("M41,50 Q42,17 65,17 Q88,17 89,50 L97,100 L33,100 Z")
    head += p("M88,44 L99,58 L89,64 Z")
    head += p("M84,64 Q92,76 86,88 L76,84 Z")
    body = p("M37,94 L93,94 Q104,138 110,176 L146,182 Q158,206 140,234 L20,234 Q22,160 37,94 Z")
    back = arm(f"{pid}-arm2", 48, 104, 100, arm_rot + 12)
    front = arm(f"{pid}-arm", 84, 104, 104, arm_rot)
    svg = back + body + f'<g id="{pid}-head">{head}</g>' + front
    return svg, 160, 236, {"arm": (84, 104), "arm2": (48, 104), "head": (65, 92)}


def man_sit_back(pid):
    """Man seated, seen from behind (ghutra, wide shoulders). Box 150 x 210."""
    head = p("M44,60 Q44,18 75,18 Q106,18 106,60 L114,112 L36,112 Z")
    body = p("M18,208 Q14,128 46,104 L104,104 Q136,128 132,208 Z")
    svg = body + f'<g id="{pid}-sh">{head}</g>'
    return svg, 150, 210, {"sh": (75, 110)}


def woman(pid, pose="down", pregnant=False, baby=False, envelope=False):
    """Woman in hijab and abaya, facing right. Box 130 x 300."""
    head = p("M42,58 Q42,20 66,20 Q90,20 90,58 Q90,82 79,92 L53,92 Q42,82 42,58 Z")
    head += p("M89,48 L98,58 L89,64 Z")
    body = p("M47,86 L85,86 Q97,150 101,220 L113,298 L15,298 L25,220 Q33,150 47,86 Z")
    if pregnant:
        body += p("M92,150 Q122,180 98,222 Z")
    rot = {"down": 0, "belly": -38, "baby": -64, "hold": -80}[pose]
    hand = None
    if envelope:
        def hand(x, y):
            return (p(rrect(x - 4, y - 6, 46, 30, 3)) +
                    f'<path d="M{x - 2},{y - 4} L{x + 19},{y + 10} L{x + 40},{y - 4}" '
                    f'stroke="#C98A44" stroke-width="2.5" fill="none"/>')
    front = arm(f"{pid}-arm", 80, 98, 104, rot, hand)
    extra = ""
    if baby:
        extra = (f'<g id="{pid}-baby">' +
                 f'<ellipse cx="134" cy="142" rx="42" ry="17" transform="rotate(-22 134 142)" fill="{INK}"/>' +
                 p(circ(178, 118, 15)) + '</g>')
    womb = ""
    if pregnant:
        womb = (f'<ellipse id="{pid}-womb" cx="99" cy="186" rx="9" ry="12" '
                f'fill="#E6A453" opacity="0"/>')
    tilt = ' transform="rotate(16 66 92)"' if baby else ""
    svg = body + f'<g id="{pid}-head"{tilt}>{head}</g>' + womb + front + extra
    return svg, 130, 300, {"arm": (80, 98), "head": (66, 92)}


def child(pid, backpack=False):
    """Boy, facing right. Box 80 x 200 (scale it for each age)."""
    head = p(circ(40, 30, 19)) + p("M57,26 L64,34 L57,38 Z")
    body = p("M25,52 L55,52 L59,120 L54,198 L44,198 L40,132 L36,198 L26,198 L21,120 Z")
    bag = p(rrect(8, 58, 18, 54, 6)) if backpack else ""
    front = arm(f"{pid}-arm", 49, 58, 64, 0, None, 11)
    svg = bag + body + f'<g id="{pid}-head">{head}</g>' + front
    return svg, 80, 200, {"arm": (49, 58), "head": (40, 46)}


def mother_seated(pid):
    """Old woman seated on the floor hugging her knees, forehead on them. Box 220 x 212.

    Faces left. Light shows under her raised thighs. The group <pid>-sh (head and arm)
    rises and falls when she cries.
    """
    body = p("M198,210 C206,160 202,112 180,86 C166,70 148,64 132,66 L98,80 C80,76 64,84 62,100 "
             "L58,188 C50,196 34,198 24,204 L24,210 Z "
             "M90,134 C104,150 124,176 140,200 L90,200 Z")
    head = p("M78,94 C70,70 86,52 108,54 C128,56 140,70 140,84 C150,92 160,102 166,118 "
             "C150,108 132,102 112,104 C96,104 84,102 78,94 Z")
    arm = p("M143.7,91.1 L67.7,131.1 L60.3,116.9 L136.3,76.9 Z") + p(circ(63, 124, 10))
    sh = f'<g id="{pid}-sh">{head}{arm}{pin(138, 84)}</g>'
    return body + sh, 220, 212, {"sh": (140, 90)}


def couple(pid):
    """Groom and bride facing each other. Box 250 x 300."""
    g, _, _, _ = man_stand(f"{pid}-g")
    b, _, _, _ = woman(f"{pid}-b")
    veil = p("M42,40 Q66,6 92,40 L120,190 L96,190 Z")
    svg = (f'<g transform="translate(0,-20) scale(1.0)">{g}</g>'
           f'<g transform="translate(250,0) scale(-1,1)">{b}{veil}</g>')
    return svg, 250, 300, {}


# ---------------------------------------------------------------- objects

def tv(pid):
    """Old CRT television with antennas. Box 300 x 262."""
    body = rrect(0, 32, 300, 220, 26)
    screen = rrect(28, 58, 200, 168, 34)
    knobs = circ(264, 96, 12) + circ(264, 150, 12) + rrect(248, 192, 32, 10, 4)
    d = body + " " + screen + " " + knobs
    ant = (f'<path d="M150,34 L96,2 M150,34 L210,2" stroke="{INK}" stroke-width="7" '
           f'stroke-linecap="round"/>' + p(circ(96, 2, 6)) + p(circ(210, 2, 6)))
    glow = (f'<path id="{pid}-screen" d="{screen}" fill="#FFE7BC" opacity="0"/>')
    svg = glow + p(d) + ant + p(rrect(70, 250, 160, 12, 5))
    return svg, 300, 262, {"center": (128, 142)}


def hourglass(pid):
    """Hourglass on its frame. Box 96 x 160."""
    frame = (p(rrect(0, 0, 96, 13, 4)) + p(rrect(0, 147, 96, 13, 4)) +
             p(rrect(6, 13, 7, 134, 3)) + p(rrect(83, 13, 7, 134, 3)))
    glass = (f'<path d="M18,16 Q18,62 46,80 Q18,98 18,144 M78,16 Q78,62 50,80 Q78,98 78,144" '
             f'stroke="{INK}" stroke-width="4" fill="none"/>')
    sand_top = f'<path id="{pid}-top" d="M22,24 L74,24 L48,72 Z" fill="{INK}"/>'
    sand_bot = f'<path id="{pid}-bot" d="M26,142 L70,142 L48,112 Z" fill="{INK}"/>'
    stream = f'<rect id="{pid}-stream" x="46.5" y="76" width="3" height="62" fill="{INK}"/>'
    svg = f'<g id="{pid}-body">{frame}{glass}{sand_top}{sand_bot}{stream}</g>'
    return svg, 96, 160, {"center": (48, 80)}


def sun(pid):
    """Sun disc with punched holes and cut rays. Box 120 x 120."""
    import math
    d = circ(60, 60, 34)
    for k in range(6):
        a = k * math.pi / 3
        d += " " + circ(round(60 + 18 * math.cos(a), 1), round(60 + 18 * math.sin(a), 1), 4)
    d += " " + circ(60, 60, 5)
    rays = ""
    for k in range(12):
        a = k * math.pi / 6
        x1, y1 = 60 + 40 * math.cos(a), 60 + 40 * math.sin(a)
        x2, y2 = 60 + 58 * math.cos(a), 60 + 58 * math.sin(a)
        rays += f"M{x1:.1f},{y1:.1f} L{x2:.1f},{y2:.1f} "
    return p(d) + f'<path d="{rays}" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>', 120, 120, {}


def moon(pid):
    """Crescent moon. Box 100 x 100."""
    d = "M64,8 A44,44 0 1,0 64,92 A34,34 0 1,1 64,8 Z"
    return p(d), 100, 100, {}


def sofa(pid, style="a"):
    if style == "a":
        d = ("M10,44 Q8,20 32,22 Q40,4 70,10 L150,10 Q180,4 188,22 Q212,20 210,44 L208,92 L198,92 "
             "L194,112 L184,112 L182,92 L38,92 L36,112 L26,112 L22,92 L12,92 Z")
        return p(d), 220, 114, {}
    d = rrect(14, 8, 192, 46, 6) + " " + rrect(4, 54, 212, 34, 6)
    legs = p("M24,88 L30,88 L22,114 L16,114 Z") + p("M196,88 L202,88 L204,114 L198,114 Z")
    return p(d) + legs, 220, 114, {}


def lamp(pid, style="a"):
    if style == "a":
        svg = (p("M14,0 L58,0 L72,46 L0,46 Z") + p(rrect(33, 46, 6, 150, 3)) +
               p("M12,214 Q36,196 60,214 Z"))
        return svg, 72, 214, {}
    svg = (f'<path d="M20,212 L20,60 Q20,10 80,14" stroke="{INK}" stroke-width="7" fill="none"/>' +
           p("M62,10 Q84,-4 106,10 L110,34 L58,34 Z") + p("M4,212 L36,212 L32,198 L8,198 Z"))
    return svg, 112, 214, {}


def envelope_icon(pid):
    d = rrect(0, 0, 60, 40, 4) + " " + circ(30, 22, 6)
    return p(d) + '<path d="M3,4 L30,22 L57,4" stroke="#C98A44" stroke-width="3" fill="none"/>', 60, 40, {}


def school(pid):
    d = ("M20,300 L20,140 L150,58 L280,140 L280,300 Z " + rrect(54, 162, 46, 46, 4) + " " +
         rrect(200, 162, 46, 46, 4) + " " + "M124,300 L124,236 Q150,210 176,236 L176,300 Z " +
         circ(150, 128, 16))
    flag = p(rrect(148, 0, 5, 62, 2)) + p("M153,4 L206,16 L153,30 Z")
    return p(d) + flag, 300, 300, {}


def wedding_arch(pid):
    d = ("M10,380 L10,160 Q10,14 210,14 Q410,14 410,160 L410,380 L372,380 L372,160 "
         "Q372,54 210,54 Q48,54 48,160 L48,380 Z")
    string = f'<path d="M48,150 Q210,250 372,150" stroke="{INK}" stroke-width="3" fill="none"/>'
    lan = ""
    for k, (x, y) in enumerate([(92, 178), (150, 196), (210, 201), (270, 196), (328, 178)]):
        lan += (f'<path d="M{x},{y} L{x},{y + 10}" stroke="{INK}" stroke-width="2"/>' +
                p(f"M{x - 9},{y + 18} L{x},{y + 8} L{x + 9},{y + 18} L{x + 7},{y + 36} L{x - 7},{y + 36} Z " +
                  rrect(x - 3, y + 20, 6, 10, 2)))
    return p(d) + string + lan, 420, 380, {}


def bed(pid):
    d = ("M0,130 L0,24 Q0,0 22,0 L34,0 L34,74 L300,74 L300,46 Q300,38 310,38 L320,38 L320,130 "
         "L306,130 L306,104 L14,104 L14,130 Z")
    return p(d), 320, 130, {}


PUPPETS = {
    "man": man_stand, "kneel": man_kneel, "sitback": man_sit_back, "woman": woman,
    "child": child, "mother": mother_seated, "couple": couple, "tv": tv,
    "hourglass": hourglass, "sun": sun, "moon": moon, "sofa": sofa, "lamp": lamp,
    "envelope": envelope_icon, "school": school, "arch": wedding_arch, "bed": bed,
}


def puppet(kind, pid, fx, fy, scale=1.0, flip=False, style="", z=2, opacity=1.0,
           blur=0, **kw):
    """Place a puppet with its feet at (fx, fy) in cloth coordinates.

    Returns (html, pivots) where pivots are in the puppet's own SVG units.
    """
    fn = PUPPETS[kind]
    if style:
        svg, w, h, piv = fn(pid, style)
    else:
        svg, w, h, piv = fn(pid, **kw)
    W, H = round(w * scale), round(h * scale)
    left, top = round(fx - W / 2), round(fy - H)
    inner = f'<g transform="translate({w},0) scale(-1,1)">{svg}</g>' if flip else svg
    flt = f"filter:blur({blur}px);" if blur else ""
    html = (f'<div id="{pid}" class="pup" style="left:{left}px;top:{top}px;width:{W}px;'
            f'height:{H}px;z-index:{z};opacity:{opacity};{flt}">'
            f'<svg viewBox="{-4} {-4} {w + 8} {h + 8}" width="{W}" height="{H}" '
            f'overflow="visible">{inner}</svg></div>')
    if flip:
        piv = {k: (w - x, y) for k, (x, y) in piv.items()}
    return html, piv
