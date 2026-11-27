import sys, json, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[3] if len(sys.argv)>3 else "small", device="cpu", compute_type="int8")
a = np.fromfile(sys.argv[1], dtype=np.float32)
segs, _ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5, vad_filter=True, condition_on_previous_text=False,
    initial_prompt=(sys.argv[4] if len(sys.argv)>4 else "Live do Meikod na Twitch."))
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text.strip(),"words":[{"w":w.word,"s":round(w.start,2),"e":round(w.end,2)} for w in s.words]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text.strip()}")
json.dump(out, open(sys.argv[2],"w",encoding="utf-8"), ensure_ascii=False, indent=1)
