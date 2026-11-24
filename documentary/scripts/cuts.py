import sys, subprocess, numpy as np
src=sys.argv[1]; W,H,FPS=36,64,10
raw=subprocess.run(['ffmpeg','-v','error','-i',src,'-vf',f'fps={FPS},scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
f=np.frombuffer(raw,np.uint8).reshape(-1,H,W,3).astype(np.float32)
# compare frame t with t-1.0s (catches dissolves)
lag=FPS
d=np.r_[np.zeros(lag),np.abs(f[lag:]-f[:-lag]).mean(axis=(1,2,3))]
# peaks
out=[]; thr=np.percentile(d,85)
for i in range(1,len(d)-1):
    if d[i]>thr and d[i]==d[max(0,i-25):i+25].max(): out.append(round(i/FPS - lag/FPS/2,1))
print(' '.join(map(str,out)))
