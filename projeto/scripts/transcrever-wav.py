# Uso: python scripts/transcrever-wav.py entrada.wav saida.json [offset_s]
# Transcreve com faster-whisper (pt) e salva palavras com tempo (somando offset, em s, da live).
import sys, json, wave
import numpy as np
from faster_whisper import WhisperModel
off = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
m = WhisperModel("small", device="cpu", compute_type="int8")
w = wave.open(sys.argv[1]); audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)/32768.0
segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, vad_filter=True)
out = [{"start": s.start+off, "end": s.end+off, "text": s.text.strip(),
        "words": [{"w": w.word, "s": w.start+off, "e": w.end+off} for w in s.words]} for s in segs]
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False)
for s in out: print(f"[{s['start']:7.1f}] {s['text']}")
