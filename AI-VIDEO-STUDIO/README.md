# AI-VIDEO-STUDIO — استوديو الفيديو السينمائي العربي (مجاني ومفتوح المصدر)

ينتج فيديو سينمائياً كاملاً من تسجيل صوتي عربي، تلقائياً ومحلياً على جهازك، ويحفظه في `output/`.

## التثبيت على Windows (مرة واحدة)

```powershell
git clone https://github.com/v66ccf4rs4-a11y/mohammed-vedio.git
cd mohammed-vedio\AI-VIDEO-STUDIO
powershell -ExecutionPolicy Bypass -File install\install-windows.ps1          # الأساسي
powershell -ExecutionPolicy Bypass -File install\install-windows.ps1 -All     # + WhisperX + ComfyUI + OpenMontage + النماذج
```

المثبّت:
- يفحص النظام والمعالج وكرت الشاشة والذاكرة والمساحة.
- يثبّت الناقص فقط عبر winget، ولا يكرر برنامجاً موجوداً.
- ينشئ `%USERPROFILE%\AI-VIDEO-STUDIO` دون الكتابة فوق أي ملف موجود.
- يبني بيئات Python معزولة: `envs\core`، و`envs\whisperx`، و`envs\comfyui`.
- يثبّت الخطوط للمستخدم الحالي دون صلاحيات مسؤول.
- يشغّل الاختبار الشامل في النهاية.

يسألك المثبّت قبل أي خطوة قد تطلب صلاحية المسؤول (UAC) وقبل أي تنزيل كبير، مثل PyTorch وBlender والنماذج.

## التشغيل

انقر مرتين على **`START-STUDIO.bat`**، أو على اختصار سطح المكتب، فتظهر لك قائمة عربية/إنجليزية. ويمكنك أيضاً استخدام سطر الأوامر:

```bat
START-STUDIO.bat produce input\voice.wav --preset tiktok --fps 30 --title "عنوان"
START-STUDIO.bat produce input\voice.wav --script input\voice.txt --preset youtube --fps 60
START-STUDIO.bat produce input\voice.wav --preset youtube4k
START-STUDIO.bat doctor        &REM فحص العتاد والأدوات
START-STUDIO.bat test          &REM الاختبار الشامل -> output\STUDIO-TEST.mp4
```

- **ملف النص (اختياري):** ضع بجانب التسجيل ملفاً بالاسم نفسه وامتداد `.txt`، فيه سطر لكل جملة أو بيت شعر. تُعرض الأسطر بتشكيلها الكامل وتُزامن مع الصوت كلمةً بكلمة.
- **Pexels (اختياري ومجاني):** ضع مفتاح API في ملف `pexels.key`. بدونه يعمل الاستوديو بلقطاتك في `footage/` وصورك في `images/` وبالمشاهد الأصلية المولّدة محلياً.
- **الموسيقى:** ضع موسيقى مرخّصة في `music/`. إن لم تضع شيئاً، يولّد الاستوديو موسيقى أصلية خالية من الحقوق.

## خط الإنتاج

1. **تحليل الصوت:** المدة، وعلو الصوت حسب معيار EBU R128 ‏(LUFS)، والتشبّع، والضجيج.
2. **التفريغ العربي:** بمحرك Faster-Whisper، أو WhisperX إن كان مثبتاً، مع توقيت كل كلمة.
3. **تحليل المشاعر والأماكن:** أمل، حزن، فخر، حنين، توتر، سكينة. ومن الأماكن: صحراء، فجر، ليل، بحر، واحة، جبال، مدينة، مطر.
4. **لوحة القصة:** بلا تكرار للمشاهد أو حركات الكاميرا أو الانتقالات المتتالية.
5. **اختيار المرئيات حسب الأولوية:** لقطاتك المحلية (مع اختيار أفضل لقطة عبر PySceneDetect)، ثم صورك، ثم Pexels، ثم ComfyUI، ثم مشاهد أصلية مولّدة محلياً بعمق حقيقي (parallax).
6. **التأثيرات البصرية:** حركة كاميرا ناعمة بدقة أجزاء البكسل، وضبابية حركة (motion blur)، وعمق ميدان (depth of field)، وتدرج لوني حسب الشعور (يتجنب طغيان اللون الذهبي)، وتظليل الأطراف (vignette)، وحبيبات الفيلم (film grain).
7. **الانتقالات:** انتقالات xfade سينمائية متنوعة.
8. **الخط العربي المتحرك:** يُرسم عبر libass مع HarfBuzz، فتبقى الحروف متصلة والتشكيل صحيحاً واتجاه الكتابة من اليمين لليسار. تظهر كل كلمة لحظة نطقها.
9. **الصوت:** مؤثرات صوتية ومزج يحمي التعليق الصوتي؛ فالصوت الأصلي لا يُعالَج، والموسيقى تنخفض تلقائياً تحته (side-chain).
10. **التصدير:** ‏MP4 بترميز H.264 للصورة وAAC للصوت، مع faststart، إلى `output/`.

## القوالب

- `templates/remotion`: عنوان عربي متحرك، كلمةً بكلمة. يُفتح للتعديل بالأمر `npx remotion studio`.
- `templates/motion-canvas`: مشهد عربي في Motion Canvas، ويُصدَّر بلا واجهة (headless) عبر `tools/render.cjs`.
- `templates/blender/arabic_title.py`: عنوان ثلاثي الأبعاد مع إضاءة وعمق ميدان. يُشكَّل النص عبر arabic-reshaper وpython-bidi، لأن Blender لا يدعم تشكيل العربية.

## قواعد مهمة للنص العربي

- لا تستخدم تباعد الحروف (letter-spacing أو `\fsp`)، لأنه يقطع اتصال الحروف.
- حرّك النص كلمةً كلمة، لا حرفاً حرفاً.

## التراخيص

جميع الأدوات مجانية:

| الأداة | الترخيص |
|---|---|
| FFmpeg | LGPL/GPL |
| Blender | GPL |
| Motion Canvas | MIT |
| Faster-Whisper | MIT |
| WhisperX | BSD-2 |
| ComfyUI | GPL-3 |
| PySceneDetect | BSD-3 |
| MoviePy | MIT |
| OpenMontage | AGPL-3.0 |
| الخطوط | SIL OFL (ملفات الترخيص داخل `fonts/`) |

**Remotion:** مجاني للأفراد والفرق حتى 3 أشخاص. الشركات الأكبر تحتاج ترخيص شركة، راجع remotion.dev/license.
