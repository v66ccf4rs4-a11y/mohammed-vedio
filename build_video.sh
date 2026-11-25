#!/usr/bin/env bash
# يركّب الفيديو العمودي 1080x1920 من لقطات footage/ على التعليق الصوتي.
# الاستخدام: ./build_video.sh [voiceover.mp3]
set -euo pipefail
cd "$(dirname "$0")"
VO="${1:-voiceover.mp3}"
B=build; mkdir -p "$B"
X=1   # مدة الانتقال بين اللقطات (ثانية)

# ملف | مدة اللقطة | معامل الإبطاء
SHOTS=(
  "footage/1_sky.mp4|39.5|1.25"        # 0:00 لقد توفيت منذ دقيقتين
  "footage/2_tv.mp4|37|1.5"            # 0:39 شاشة تشبه التلفاز
  "footage/3_baby.mp4|47|1.5"          # 1:15 زوجتي تحمل طفلاً… ابني يكبر
  "footage/4_dark_room.mp4|43|2"       # 2:01 الظل الأسود في الخلف
  "footage/5_old_woman.mp4|39.5|2"     # 2:43 لم يكن هذا الظل سوى أمي
)

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

i=0
for s in "${SHOTS[@]}"; do
  i=$((i+1)); IFS='|' read -r SRC D SLOW <<<"$s"
  echo "لقطة $i: $SRC"
  # 1) تحجيم إلى 9:16 + إبطاء مع دمج الإطارات لحركة ناعمة
  ffmpeg -loglevel error -y -i "$SRC" -an -vf \
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setpts=${SLOW}*PTS,framerate=30" \
    -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p "$B/f$i.mp4"
  # 2) إن كانت أقصر من المطلوب: حلقة ذهاب وإياب بلا قفزات
  LEN=$(dur "$B/f$i.mp4")
  if (( $(echo "$LEN < $D" | bc -l) )); then
    ffmpeg -loglevel error -y -i "$B/f$i.mp4" -vf reverse -c:v libx264 -preset fast -crf 14 "$B/r$i.mp4"
    : > "$B/l$i.txt"; t=0
    while (( $(echo "$t < $D" | bc -l) )); do
      printf "file 'f%s.mp4'\nfile 'r%s.mp4'\n" $i $i >> "$B/l$i.txt"; t=$(echo "$t + 2*$LEN" | bc -l)
    done
    ffmpeg -loglevel error -y -f concat -safe 0 -i "$B/l$i.txt" -c copy "$B/p$i.mp4"
  else
    cp "$B/f$i.mp4" "$B/p$i.mp4"
  fi
  # 3) قص + دفع بطيء للكاميرا + تلوين سينمائي داكن
  N=$(echo "$D*30" | bc)
  ffmpeg -loglevel error -y -i "$B/p$i.mp4" -t "$D" -vf \
    "scale=2160:3840,zoompan=z='1+0.07*on/$N':d=1:s=1080x1920:fps=30:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2',eq=saturation=0.68:contrast=1.06:brightness=-0.035,colorbalance=bs=0.04:bm=0.02,vignette=PI/4.5" \
    -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p "$B/s$i.mp4"
done

# 4) دمج اللقطات بانتقالات ناعمة + التعليق الصوتي
OFF=0; PREV="[0:v]"; FC=""
for k in 1 2 3 4; do
  IFS='|' read -r _ D _ <<<"${SHOTS[$((k-1))]}"
  OFF=$(echo "$OFF + $D - $X" | bc -l)
  FC+="${PREV}[$k:v]xfade=transition=fade:duration=$X:offset=$OFF[v$k];"; PREV="[v$k]"
done
TOTAL=$(dur "$VO")
FC+="${PREV}fade=t=in:st=0:d=1.5,fade=t=out:st=$(echo "$TOTAL-2.5" | bc -l):d=2.5[v];[5:a]afade=t=out:st=$(echo "$TOTAL-2" | bc -l):d=2[a]"
ffmpeg -loglevel error -y -i $B/s1.mp4 -i $B/s2.mp4 -i $B/s3.mp4 -i $B/s4.mp4 -i $B/s5.mp4 -i "$VO" \
  -filter_complex "$FC" -map "[v]" -map "[a]" -t "$TOTAL" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart final_9x16.mp4
echo "تم: final_9x16.mp4"
