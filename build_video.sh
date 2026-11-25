#!/usr/bin/env bash
# يركّب الفيديو العمودي: ضع المقاطع في footage/ بأسماء 1.mp4 … 5.mp4
# الاستخدام: ./build_video.sh path/to/voiceover.mp3
set -euo pipefail
VO="${1:?ضع مسار ملف التعليق الصوتي}"
# مدة كل لقطة بالثواني حسب SHOT_PLAN.md (المجموع = طول التعليق تقريباً)
DUR=(39 36 46 42 39)
mkdir -p build
for i in 1 2 3 4 5; do
  d=${DUR[$((i-1))]}
  ffmpeg -loglevel error -y -stream_loop -1 -i "footage/$i.mp4" -t "$d" -an \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,eq=saturation=0.75:brightness=-0.03,fade=t=in:st=0:d=0.8,fade=t=out:st=$((d-1)):d=0.8" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "build/$i.mp4"
done
printf "file '%s'\n" build/{1..5}.mp4 > build/list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i build/list.txt -i "$VO" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final_9x16.mp4
echo "تم: final_9x16.mp4"
