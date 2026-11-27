import sys, glob, os, wave, json
import numpy as np
from faster_whisper import WhisperModel
d = sys.argv[1]
m = WhisperModel("small", device="cpu", compute_type="int8")
for f in sorted(glob.glob(os.path.join(d, "*.wav"))):
    with wave.open(f) as wf:
        a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    segs, _ = m.transcribe(a, language="pt", beam_size=5, word_timestamps=True)
    out = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    json.dump(out, open(f[:-4] + ".json", "w", encoding="utf-8"), ensure_ascii=False)
    print(os.path.basename(f), len(out), flush=True)
