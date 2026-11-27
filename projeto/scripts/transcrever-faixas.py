# Retranscreve faixas da live com Whisper medium (palavra a palavra, tempo da live).
# Uso: python scripts/transcrever-faixas.py saida.json nome:ini:fim [nome:ini:fim ...]
import sys, json, subprocess, glob
import numpy as np
import imageio_ffmpeg
from faster_whisper import WhisperModel

FF = imageio_ffmpeg.get_ffmpeg_exe()
LIVE = sorted(glob.glob("live/kosky/live-*.mp4"))[-1]
m = WhisperModel("medium", device="cpu", compute_type="int8")
saida = {}
for arg in sys.argv[2:]:
    nome, ini, fim = arg.split(":")
    ini, fim = float(ini), float(fim)
    pcm = subprocess.run([FF, "-v", "error", "-ss", str(ini), "-t", str(fim - ini), "-i", LIVE, "-vn", "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, beam_size=5, vad_filter=True,
                           condition_on_previous_text=False, initial_prompt="Live do kosky jogando GTA 6.")
    out = []
    print(f"== {nome} ({ini:.0f}-{fim:.0f})", flush=True)
    for s in segs:
        ws = [(w.word.strip(), round(w.start + ini, 2)) for w in s.words]
        out.append({"start": round(s.start + ini, 2), "end": round(s.end + ini, 2), "text": s.text.strip(), "words": ws})
        print(f"{s.start + ini:8.2f}-{s.end + ini:8.2f}: " + " ".join(f"{w}@{t}" for w, t in ws), flush=True)
    saida[nome] = out
    json.dump(saida, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False)
