import sys,math; sys.path.insert(0,'/tmp/claude-0/-home-user-mohammed-vedio/3a57e26a-f195-5a5d-8de1-49d61ea6b20a/scratchpad')
from glyphs import place, text_path
INK='#121419'; GOLD='#C9A050'; IVORY='#F5F0E6'
def arc(cx,cy,r,a0,a1):
    p=lambda a:(cx+r*math.cos(math.radians(a)),cy+r*math.sin(math.radians(a)))
    (x0,y0),(x1,y1)=p(a0),p(a1)
    return f'M{x0:.2f} {y0:.2f} A{r} {r} 0 0 1 {x1:.2f} {y1:.2f}'
def ain_mark(ink=INK,gold=GOLD,font='Alexandria-800.ttf',size=300,ox=0,oy=0,my=0.23,cxk=0.62,gap=0.13,step=0.2,span=34,swk=0.062,n=3,fade=False):
    d,(x0,y0,x1,y1)=text_path('ع',font,size)
    w,h=x1-x0,y1-y0; tx,ty=ox-x0,oy-y0
    g=f'<path transform="translate({tx:.2f},{ty:.2f})" fill="{ink}" d="{d}"/>'
    cx=ox+w*cxk; cy=oy+h*my; sw=size*swk
    r0=(ox+w-cx)+w*gap+sw/2
    arcs=''
    for i in range(n):
        r=r0+i*w*step; sp=span-i*4
        op=1-i*0.28 if fade else 1
        arcs+=f'<path d="{arc(cx,cy,r,-sp,sp)}" fill="none" stroke="{gold}" stroke-opacity="{op:.2f}" stroke-width="{sw:.2f}" stroke-linecap="round"/>'
    right=cx+r0+(n-1)*w*step+sw/2
    return g+arcs,(ox,oy,right,oy+h)
def svg(w,h,body,bg=None,vb=None):
    vb=vb or f'0 0 {w} {h}'; b=f'<rect x="{vb.split()[0]}" y="{vb.split()[1]}" width="100%" height="100%" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}">{b}{body}</svg>'
