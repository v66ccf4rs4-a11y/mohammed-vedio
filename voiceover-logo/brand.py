import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from mark import ain_mark, INK, GOLD, IVORY
from glyphs import place
OUT=os.path.dirname(os.path.abspath(__file__))+'/'
MK=dict(n=2,step=.27,span=36,swk=.095,gap=.15)
def S(vb,body,bg=None):
    x,y,w,h=vb; b=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.1f} {y:.1f} {w:.1f} {h:.1f}" width="{w:.0f}" height="{h:.0f}">{b}{body}</svg>'
def pad(bb,p): x0,y0,x1,y1=bb; return (x0-p,y0-p,x1-x0+2*p,y1-y0+2*p)
def union(*bs): return (min(b[0] for b in bs),min(b[1] for b in bs),max(b[2] for b in bs),max(b[3] for b in bs))
def horizontal(ink=INK,gold=GOLD,sub=None):
    sub=sub or ink
    n,nb=place('محمد العمري','Alexandria-800.ttf',150,0,150,'end',ink)
    t,tb=place('معلّق صوتي','Alexandria-300.ttf',60,0,nb[3]+100,'end',gold)
    mid=(tb[1]+tb[3])/2
    l,lb0=place('VOICE OVER ARTIST','Montserrat-500.ttf',28,nb[0],0,'start',sub,tracking=.28)
    ly=mid-(lb0[1]+lb0[3])/2
    l,lb=place('VOICE OVER ARTIST','Montserrat-500.ttf',28,nb[0],ly,'start',sub,tracking=.28)
    tbox=union(nb,tb,lb)
    m0,mb0=ain_mark(ink,gold,size=300,ox=0,oy=0,**MK)
    mw,mh=mb0[2]-mb0[0],mb0[3]-mb0[1]; th=tbox[3]-tbox[1]
    sc=th/mh*1.0
    ox=tbox[0]-110-mw*sc
    m=f'<g transform="translate({ox:.1f},{tbox[1]:.1f}) scale({sc:.4f})">{m0}</g>'
    return m+n+t+l, union((ox,tbox[1],ox+mw*sc,tbox[1]+mh*sc),tbox)
def stacked(ink=INK,gold=GOLD,sub=None):
    sub=sub or ink
    m,mb=ain_mark(ink,gold,size=300,ox=0,oy=0,**MK)
    cx=(mb[0]+mb[2])/2
    n,nb=place('محمد العمري','Alexandria-800.ttf',130,cx,mb[3]+190,'middle',ink)
    t,tb=place('معلّق صوتي','Alexandria-300.ttf',56,cx,nb[3]+90,'middle',gold)
    l,lb=place('MOHAMMED ALAMRI · VOICE OVER','Montserrat-500.ttf',26,cx,tb[3]+70,'middle',sub,tracking=.3)
    return m+n+t+l, union(mb,nb,tb,lb)
def icon(bgc,ink,gold,rx=0.22,size=1024):
    m,mb=ain_mark(ink,gold,size=300,ox=0,oy=0,**MK)
    w,h=mb[2]-mb[0],mb[3]-mb[1]; S_=max(w,h)*1.75
    x=mb[0]-(S_-w)/2-w*0.03; y=mb[1]-(S_-h)/2+h*0.0
    bg=f'<rect x="{x:.1f}" y="{y:.1f}" width="{S_:.1f}" height="{S_:.1f}" rx="{S_*rx:.1f}" fill="{bgc}"/>'
    return S((x,y,S_,S_),bg+m).replace(f'width="{S_:.0f}" height="{S_:.0f}"',f'width="{size}" height="{size}"',1)
def write(name,svg): open(OUT+name,'w').write(svg); return svg
if __name__=='__main__':
    os.makedirs(OUT,exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(('.svg','.png')): os.remove(OUT+f)
    for tag,ink,gold,sub,bg in [('ink',INK,GOLD,'#4a4d55',None),('ivory',IVORY,GOLD,'#c8c2b4',None),('mono-black',INK,INK,INK,None),('mono-white','#fff','#fff','#fff',None)]:
        b,bb=horizontal(ink,gold,sub); write(f'logo-horizontal-{tag}.svg',S(pad(bb,60),b,bg))
        b,bb=stacked(ink,gold,sub); write(f'logo-stacked-{tag}.svg',S(pad(bb,60),b,bg))
        m,mb=ain_mark(ink,gold,size=300,**MK); write(f'mark-{tag}.svg',S(pad(mb,30),m))
    write('icon-ink.svg',icon(INK,IVORY,GOLD)); write('icon-gold.svg',icon(GOLD,INK,IVORY)); write('icon-ivory.svg',icon(IVORY,INK,GOLD))
    write('avatar-circle.svg',icon(INK,IVORY,GOLD,rx=.5))
    print('\n'.join(sorted(os.listdir(OUT))))
