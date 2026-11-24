# حكاية البرّية — إعادة إخراج وثائقية

الناتج: `output/hikayat-albarriya.mp4` (1080×1920، 3:28)

- `scripts/cuts.py` — كشف نقاط الانتقال في المقطع الأصلي
- `scripts/score.py` — توليد الموسيقى التصويرية الأصلية
- `scripts/cards.js` — إنشاء لوحات العنوان والفصول (Playwright)
- `scripts/render.py` — التلوين السينمائي والانتقالات ودمج الصوت (FFmpeg)

فُصل صوت الراوي عن الموسيقى الأصلية باستخدام audio-separator (UVR-MDX-NET-Voc_FT).
