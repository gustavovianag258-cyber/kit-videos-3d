# Uso: python scripts/transcrever-arquivos.py saida.json arquivo1.mp4 [arquivo2.mp4 ...]  (Whisper medium, palavra a palavra)
import sys, json, subprocess, os
import numpy as np, imageio_ffmpeg
from faster_whisper import WhisperModel
FF = imageio_ffmpeg.get_ffmpeg_exe()
m = WhisperModel("medium", device="cpu", compute_type="int8")
saida = {}
for f in sys.argv[2:]:
    pcm = subprocess.run([FF, "-v", "error", "-i", f, "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, beam_size=5, vad_filter=True, condition_on_previous_text=False)
    out = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(), "words": [(w.word.strip(), round(w.start, 2)) for w in s.words]} for s in segs]
    saida[os.path.basename(f)] = out
    json.dump(saida, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False)
