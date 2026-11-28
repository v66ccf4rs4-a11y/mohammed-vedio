import uharfbuzz as hb, math, random
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
F='fonts/'
def text_path(txt,font,size):
    blob=hb.Blob.from_file_path(F+font); face=hb.Face(blob); hf=hb.Font(face)
    buf=hb.Buffer(); buf.add_str(txt); buf.guess_segment_properties(); hb.shape(hf,buf)
    tt=TTFont(F+font); gs=tt.getGlyphSet(); order=tt.getGlyphOrder(); upm=tt['head'].unitsPerEm; s=size/upm
    sp=SVGPathPen(gs); bp=BoundsPen(gs); x=0
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        g=order[info.codepoint]; m=(s,0,0,-s,(x+pos.x_offset)*s,-pos.y_offset*s)
        gs[g].draw(TransformPen(sp,m)); gs[g].draw(TransformPen(bp,m)); x+=pos.x_advance
    return sp.getCommands(), bp.bounds  # bounds: xmin,ymin,xmax,ymax (y down)
def place(txt,font,size,x,y,anchor='end',fill='#141414'):
    d,(x0,y0,x1,y1)=text_path(txt,font,size)
    dx={'end':x-x1,'start':x-x0,'middle':x-(x0+x1)/2}[anchor]
    return f'<path transform="translate({dx:.1f},{y:.1f})" fill="{fill}" d="{d}"/>',(x0+dx,y0+y,x1+dx,y1+y)
def bars(n,x,cy,w,h,fill,gap=.45,seed=3,env_pow=.9):
    random.seed(seed); bw=w/n; o=[]
    for i in range(n):
        t=i/(n-1); env=math.sin(math.pi*t)**env_pow
        a=(.3+.7*abs(math.sin(i*.9)*math.cos(i*.31)))*env*random.uniform(.75,1)
        bh=max(bw*(1-gap),a*h); ww=bw*(1-gap)
        o.append(f'<rect x="{x+i*bw:.1f}" y="{cy-bh/2:.1f}" width="{ww:.1f}" height="{bh:.1f}" rx="{ww/2:.1f}"/>')
    return f'<g fill="{fill}">'+''.join(o)+'</g>'
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{b}{body}</svg>'
INK,GOLD,PAPER='#141414','#c9a45c','#f4efe5'
def variants(name,fn):
    for tag,ink,bg in [('light',INK,None),('dark',PAPER,'#141414')]:
        open(f'/home/user/mohammed-vedio/voiceover-logo/{name}-{tag}.svg','w').write(fn(ink,bg))
# A wordmark
def A(ink,bg):
    W=1200
    n,bb=place('محمد العمري','amiri-bold.ttf',150,W-40,175,'end',ink)
    r,_=place('معلّق صوتي','plex-ar.ttf',42,W-40,bb[3]+60,'end',GOLD)
    ww=300; w=bars(26,bb[0]-40-ww,125,ww,170,GOLD,seed=5)
    L=bb[0]-40-ww-40
    return svg(int(W-L),int(bb[3]+90),f'<g transform="translate({-L:.1f},0)">'+n+r+w+'</g>',bg)
# B soundwave badge
def B(ink,bg):
    cx,cy,R=200,200,150
    ring=f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{GOLD}" stroke-width="10"/>'
    random.seed(2); hs=[.35,.6,.9,.7,1,.75,.95,.55,.3]; bw=18; gap=12; tot=len(hs)*bw+(len(hs)-1)*gap; o=[]
    for i,h in enumerate(hs):
        bh=h*170; x=cx-tot/2+i*(bw+gap)
        o.append(f'<rect x="{x:.1f}" y="{cy-bh/2:.1f}" width="{bw}" height="{bh:.1f}" rx="{bw/2}"/>')
    wave=f'<g fill="{ink}">'+''.join(o)+'</g>'
    nm,nb=place('محمد العمري','reemkufi.ttf',100,1040,195,'end',ink)
    rl,_=place('معلّق صوتي','plex-ar.ttf',42,1040,nb[3]+70,'end',GOLD)
    return svg(1080,400,ring+wave+nm+rl,bg)
# C mic made of bars
def C(ink,bg):
    cx,top,wid,hei=190,50,170,250
    clip=f'<clipPath id="cap"><rect x="{cx-wid/2}" y="{top}" width="{wid}" height="{hei}" rx="{wid/2}"/></clipPath>'
    random.seed(11); n=9; bw=wid/n; o=[]
    for i in range(n):
        a=.55+.45*math.sin(math.pi*(i+.5)/n)*random.uniform(.7,1); bh=hei*a
        o.append(f'<rect x="{cx-wid/2+i*bw+bw*.18:.1f}" y="{top+(hei-bh)/2:.1f}" width="{bw*.64:.1f}" height="{bh:.1f}" rx="{bw*.32:.1f}"/>')
    cap=f'<defs>{clip}</defs><g clip-path="url(#cap)" fill="{GOLD}">'+''.join(o)+'</g>'
    yoke=f'<path d="M{cx-120} {top+150} v20 a120 120 0 0 0 240 0 v-20" fill="none" stroke="{ink}" stroke-width="14" stroke-linecap="round"/><line x1="{cx}" y1="{top+290}" x2="{cx}" y2="{top+330}" stroke="{ink}" stroke-width="14" stroke-linecap="round"/><line x1="{cx-60}" y1="{top+335}" x2="{cx+60}" y2="{top+335}" stroke="{ink}" stroke-width="14" stroke-linecap="round"/>'
    nm,_=place('محمد العمري','amiri-bold.ttf',140,1060,185,'end',ink)
    rl,_=place('معلّق صوتي','plex-ar.ttf',42,1060,280,'end',GOLD)
    return svg(1100,420,cap+yoke+nm+rl,bg)
variants('wordmark',A); variants('monogram',B); variants('mic',C)

# square icon-only marks (profile pictures)
def iconize(fn,box,name):
    for tag,ink,bg in [('light',INK,PAPER),('dark',PAPER,'#141414')]:
        full=fn(ink,None); inner=full[full.index('>')+1:full.rindex('</svg>')]
        x,y,w,h=box; S=max(w,h)+80
        out=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x-(S-w)/2} {y-(S-h)/2} {S} {S}" width="512" height="512"><rect x="{x-(S-w)/2}" y="{y-(S-h)/2}" width="{S}" height="{S}" fill="{bg}"/>{inner}</svg>'
        open(f'/home/user/mohammed-vedio/voiceover-logo/{name}-icon-{tag}.svg','w').write(out)
iconize(B,(45,45,310,310),'monogram'); iconize(C,(63,43,254,350),'mic')
