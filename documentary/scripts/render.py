import subprocess, sys
S=sys.argv[1]; OUT=sys.argv[2]; PREVIEW=len(sys.argv)>3
INTRO=5.0; SRC=198.1667; END=5.0; TOT=INTRO+SRC+END
cuts=[28.3,35.1,41.1,48.3,53.8,56.7,60.8,64.7,69.6,75.2,88.6,98.1,102.5,108.4,130.4,134.8,152.7,162.1,184.1,188.1]
chapters=[(0.6,1),(35.1,2),(134.8,3),(162.1,4),(188.1,5)]
G=("eq=contrast=1.05:saturation=0.9:gamma=1.0,"
   "colorbalance=rs=-0.05:bs=0.06:gs=0.01:rh=0.05:gh=0.01:bh=-0.04,"
   "curves=all='0/0.035 0.25/0.235 0.5/0.51 0.75/0.79 1/0.97',vignette=PI/6")
A='+'.join(f"exp(-pow((T-{c+INTRO:.2f})/0.38,2))" for c in cuts)
leak=(f"color=c=black:s=270x480:r=30:d={TOT:.3f},format=rgba,"
      f"geq=r='255':g='150':b='70':a='255*0.42*min(1,{A})*exp(-(pow(X-250,2)+pow(Y-90,2))/(2*pow(210,2)))',"
      "scale=1080:1920,setsar=1[leak]")
# picture shifts up during the vulture segment so the photographer credit stays above the bottom matte
def sm(a,b): return f"clip((t-{a})/({b}-{a}),0,1)"
yexp=f"-7-60*({sm(161.6+INTRO,162.6+INTRO)})*(1-{sm(183.6+INTRO,184.6+INTRO)})"
inp=['-i',f'{S}/src/src.mp4','-loop','1','-t',f'{INTRO+0.5}','-i',f'{S}/work/intro_bg.png',
     '-loop','1','-t',f'{END+0.5}','-i',f'{S}/work/end_bg.png',
     '-loop','1','-t','5','-i',f'{S}/cards/title.png','-loop','1','-t','5','-i',f'{S}/cards/end.png']
for _,n in chapters: inp+=['-loop','1','-t','4.6','-i',f'{S}/cards/ch{n}.png']
nI=len(inp)//2  # rough; compute actual index below
idx_voc=5+len(chapters); idx_mus=idx_voc+1
inp+=['-i',f'{S}/audio/voc.flac','-i',f'{S}/audio/score.wav']
f=[]
f.append(f"color=c=black:s=1080x1920:r=30:d={TOT:.3f}[base]")
f.append(f"[1:v]scale=w='trunc(1120*(1+0.06*t/{INTRO})/2)*2':h=-2:eval=frame,crop=1080:1920,setsar=1,eq=brightness=-0.12:saturation=0.85,fps=30,fade=in:st=0:d=1.5,fade=out:st={INTRO-0.8}:d=0.8,format=yuva420p[ib]")
f.append(f"[2:v]scale=w='trunc(1120*(1+0.05*t/{END})/2)*2':h=-2:eval=frame,crop=1080:1920,setsar=1,eq=brightness=-0.18:saturation=0.8,fps=30,fade=in:st=0:d=1.2:alpha=1,fade=out:st={END-1.2}:d=1.2,format=yuva420p,setpts=PTS+{INTRO+SRC-0.3}/TB[eb]")
f.append(f"[0:v]fps=30,scale=1080:1934,setsar=1,fade=in:st=0:d=0.8,setpts=PTS+{INTRO}/TB[mv]")
f.append("[base][ib]overlay=0:0:eof_action=pass[b1]")
f.append(f"[b1][mv]overlay=x=-4:y='{yexp}':eval=frame:eof_action=pass[b2]")
f.append("[b2][eb]overlay=0:0:eof_action=pass[b3]")
f.append(f"[b3]{G}[gr]")
f.append(leak)
f.append("[gr][leak]overlay=0:0:shortest=1,noise=alls=5:allf=t,drawbox=0:0:1080:100:black:fill,drawbox=0:1820:1080:100:black:fill[c0]")
f.append(f"[3:v]fade=in:st=0.9:d=1.1:alpha=1,fade=out:st={INTRO-0.9}:d=0.7:alpha=1[tt]")
f.append(f"[4:v]fade=in:st=0.6:d=1.2:alpha=1,fade=out:st={END-1.4}:d=1.2:alpha=1,setpts=PTS+{INTRO+SRC}/TB[et]")
f.append("[c0][tt]overlay=0:0:eof_action=pass[c1]")
f.append("[c1][et]overlay=0:0:eof_action=pass[c2]")
last='c2'
for i,(st,n) in enumerate(chapters):
    t0=st+INTRO+0.5
    f.append(f"[{5+i}:v]fade=in:st=0:d=0.8:alpha=1,fade=out:st=3.7:d=0.8:alpha=1,setpts=PTS+{t0}/TB[k{i}]")
    f.append(f"[{last}][k{i}]overlay=0:0:eof_action=pass[d{i}]"); last=f"d{i}"
f.append(f"[{last}]format=yuv420p[vout]")
d=int(INTRO*1000)
f.append(f"[{idx_voc}:a]highpass=f=75,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=3:attack=5:release=150:makeup=2,adelay={d}|{d},apad,atrim=0:{TOT:.3f},asplit[v1][v2]")
f.append(f"[{idx_mus}:a]volume=0.6,atrim=0:{TOT:.3f}[m]")
f.append("[m][v2]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=700[md]")
f.append("[v1][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]")
cmd=['ffmpeg','-v','warning','-stats','-y',*inp,'-filter_complex',';'.join(f),'-map','[vout]','-map','[aout]',
     '-c:v','libx264','-preset','veryfast' if PREVIEW else 'medium','-crf','28' if PREVIEW else '20','-maxrate','3600k','-bufsize','7200k','-profile:v','high','-pix_fmt','yuv420p',
     '-c:a','aac','-b:a','256k','-movflags','+faststart','-t',f'{TOT:.3f}',OUT]
print(' '.join(cmd[:4]))
subprocess.run(cmd,check=True)
