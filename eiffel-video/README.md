# برج إيفل وحديد الجزائر: فيديو موشن جرافيك

فيديو أفقي 1920×1080 مبني بـ Remotion على تسجيل صوتي (`public/voice.mp3`).

- `src/data/captions.json`: التفريغ المصحح بتوقيت كل كلمة (Whisper)
- `src/scenes/`: المشاهد الثمانية، وكل التوقيتات بالثواني على خط زمن الصوت
- `src/theme.ts`: الألوان والخطوط واسم القناة

```bash
npm i
npx remotion studio                                # معاينة وتعديل
npx remotion render EiffelIron out/eiffel-iron.mp4 # تصدير
```
