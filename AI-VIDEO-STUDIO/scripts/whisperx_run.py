"""Run WhisperX inside its own isolated venv (envs/whisperx) and print JSON segments.

Usage: python whisperx_run.py audio.wav model language
"""
import json
import sys

import whisperx

audio_path, model_name, lang = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    import torch
    device = "cuda" if torch.cuda.is_available() else "cpu"
except ImportError:
    device = "cpu"
ctype = "float16" if device == "cuda" else "int8"
audio = whisperx.load_audio(audio_path)
model = whisperx.load_model(model_name, device, compute_type=ctype, language=lang)
res = model.transcribe(audio, batch_size=8 if device == "cuda" else 2, language=lang)
align_model, meta = whisperx.load_align_model(language_code=lang, device=device)
res = whisperx.align(res["segments"], align_model, meta, audio, device)
segs = [{"start": s["start"], "end": s["end"], "text": s["text"].strip(),
         "words": [{"word": w["word"], "start": w.get("start", s["start"]), "end": w.get("end", s["end"])}
                   for w in s.get("words", [])]} for s in res["segments"]]
print("WHISPERX_JSON=" + json.dumps({"engine": f"whisperx/{model_name}/{device}", "segments": segs},
                                    ensure_ascii=False))
