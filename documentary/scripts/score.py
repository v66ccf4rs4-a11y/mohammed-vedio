# Original cinematic documentary score, synthesized from scratch.
import numpy as np, soundfile as sf, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=44100; TOTAL=float(sys.argv[2]); N=int(SR*TOTAL)
rng=np.random.default_rng(7)
t_all=np.arange(N)/SR
L=np.zeros(N); R=np.zeros(N)
def mtof(m): return 440*2**((m-69)/12)
def lp(x,fc,o=2): return sosfilt(butter(o,fc,'low',fs=SR,output='sos'),x)
def hp(x,fc,o=2): return sosfilt(butter(o,fc,'high',fs=SR,output='sos'),x)
def add(sig,start,gl=1,gr=1):
    s=int(start*SR)
    if s<0: sig=sig[-s:]; s=0
    e=min(N,s+len(sig))
    if s>=N: return
    L[s:e]+=sig[:e-s]*gl; R[s:e]+=sig[:e-s]*gr
def env(n,a,r):
    e=np.ones(n); A=int(a*SR); Rr=int(r*SR)
    e[:A]=np.linspace(0,1,A)**1.5; e[-Rr:]*=np.linspace(1,0,Rr)**1.5; return e
def saw(f,n,ph=0):
    t=np.arange(n)/SR; return 2*((f*t+ph)%1)-1
def intensity(T):  # 0..1 arc of the film
    pts=[(0,.35),(5,.3),(40,.45),(100,.55),(139,.6),(145,.85),(157,.8),(167,1),(189,.9),(195,.5),(TOTAL,0)]
    xs,ys=zip(*pts); return np.interp(T,xs,ys)
# D minor: i - VI - III - VII  (Dm Bb F C) ; bird section brighter: Bb F C Dm/F
prog=[[50,53,57],[46,50,53,58],[45,48,53,57],[48,52,55,60]]
CH=8.0
# ---------- strings pad ----------
k=0; T=0.0
while T<TOTAL:
    ch=prog[k%4]; dur=CH+3.0; n=int(dur*SR)
    I=intensity(T)
    sig_l=np.zeros(n); sig_r=np.zeros(n)
    voices=ch+[ch[0]+12] + ([ch[1]+12, ch[2]+12] if I>.7 else [])
    for m in voices:
        f=mtof(m)
        for d,pan in ((-0.09,0.8),(0.0,.5),(0.1,0.2)):
            ff=f*2**(d/12*0.3)
            v=saw(ff,n,rng.random())*(1+0.003*np.sin(2*np.pi*5.2*np.arange(n)/SR+rng.random()*6))
            sig_l+=v*(1-pan); sig_r+=v*pan
    cut=600+1800*I
    e=env(n,2.5,3.0)*0.018
    add(lp(sig_l,cut,4)*e,T-1.5,1,0); add(lp(sig_r,cut,4)*e,T-1.5,0,1)
    # cello drone / bass
    nb=int(dur*SR); tb=np.arange(nb)/SR; f=mtof(ch[0]-12)
    b=(np.sin(2*np.pi*f*tb)+.35*np.sin(2*np.pi*2*f*tb)+.15*lp(saw(f,nb),400))*env(nb,2,3)*0.04*(0.6+0.6*I)
    add(b,T-1.5)
    T+=CH; k+=1
# ---------- felt-piano arpeggio ----------
def pluck(f,dur=2.2):
    n=int(dur*SR); t=np.arange(n)/SR
    x=sum(a*np.sin(2*np.pi*f*h*t)*np.exp(-t*(2.2+h*1.3)) for h,a in ((1,1),(2,.45),(3,.18),(4,.08)))
    att=np.minimum(1,t/0.006); return lp(x*att,3500)
arp_start=21.0; step=0.5
T=arp_start; i=0
pattern=[0,1,2,1,3,2,1,2]
while T<TOTAL-10:
    k=int((T)//CH); ch=prog[k%4]; notes=[ch[0]+12,ch[1]+12,ch[2]+12,ch[0]+24]
    m=notes[pattern[i%8]]; I=intensity(T)
    vel=(0.06+0.03*(i%4==0))*(0.7+0.5*I)*(0.85+0.3*rng.random())
    pan=0.5+0.3*np.sin(i*0.7)
    add(pluck(mtof(m))*vel,T+rng.normal(0,.006),1-pan*0.6,0.4+pan*0.6)
    T+=step if not (139<T<157) else step/2*1.0 if i%2 else step/2; i+=1
# ---------- high shimmer (bird section) ----------
for T0,dur in ((139.0,28.0),(193.0,12.0)):
    n=int(dur*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for m in (74,77,81,86):
        x+=np.sin(2*np.pi*mtof(m)*t+rng.random()*6)*(0.5+0.5*np.sin(2*np.pi*0.13*t+m))
    add(x*env(n,4,5)*0.012,T0,0.9,1.0)
# ---------- drums: low taiko-like toms for the vultures ----------
def tom(f0=95,dur=1.0):
    n=int(dur*SR); t=np.arange(n)/SR
    f=f0*(0.55+0.45*np.exp(-t*18)); ph=2*np.pi*np.cumsum(f)/SR
    body=np.sin(ph)*np.exp(-t*5.5)
    nz=lp(rng.standard_normal(n),1800)*np.exp(-t*40)*0.4
    return body+nz
def boom(dur=4.0):
    n=int(dur*SR); t=np.arange(n)/SR
    f=38+50*np.exp(-t*6); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*1.1)+lp(rng.standard_normal(n),300)*np.exp(-t*3)*0.5
def riser(dur=3.0):
    n=int(dur*SR); t=np.arange(n)/SR
    x=hp(rng.standard_normal(n),1500); x=lp(x,2500)+hp(x,6000)*(t/dur)
    return x*(t/dur)**3
beat=CH/8  # 1s
T=167.1
pat=[(0,1),(0.75,.5),(1.5,.7),(2,.9),(3,.6),(3.5,.5)]
while T<193:
    I=intensity(T)
    for off,v in pat: add(tom(90 if off%2==0 else 120)*v*0.22*I,T+off)
    T+=4*beat
for hit in (0.6, 40.1, 139.8, 167.1, 193.1):
    add(riser()*0.05,hit-3.0,0.9,1); add(boom()*0.35,hit)
# ---------- master: reverb + glue ----------
ir_n=int(3.8*SR); ti=np.arange(ir_n)/SR
irL=rng.standard_normal(ir_n)*np.exp(-ti*1.9); irR=rng.standard_normal(ir_n)*np.exp(-ti*1.9)
irL=lp(irL,6000)/np.sqrt((irL**2).sum()); irR=lp(irR,6000)/np.sqrt((irR**2).sum())
wl=fftconvolve(L,irL)[:N]; wr=fftconvolve(R,irR)[:N]
L=L*0.75+wl*0.55; R=R*0.75+wr*0.55
fade=np.ones(N); fo=int(6*SR); fade[-fo:]=np.linspace(1,0,fo)**2; fade[:int(.05*SR)]=np.linspace(0,1,int(.05*SR))
out=np.stack([L*fade,R*fade],1); out=hp(out.T,45,4).T
out=np.tanh(out/np.abs(out).max()*1.6)/np.tanh(1.6)*0.89
sf.write(sys.argv[1],out.astype(np.float32),SR,subtype='PCM_24')
print('ok',out.shape)
