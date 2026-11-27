# Prepara a legenda (texto certo + tempo do Whisper) e a abertura da boca (volume da voz a 30 fps).
import json, sys, wave, numpy as np
pal = json.load(open(sys.argv[1], encoding="utf-8"))
wav = sys.argv[2]; saida = sys.argv[3]
# juntar pedaços que o Whisper separou e corrigir nomes
junta = {("pré", "-vendas?"): "pré-vendas?", ("meia", "-noite"): "meia-noite", ("3", ",2"): "3,2"}
troca = {"Take": "Take-Two,", "Vice.": "Vyce.", "fase": "Fase", "extra,": "Extra,"}
out, i = [], 0
while i < len(pal):
    w = pal[i]
    if i + 1 < len(pal) and (w["w"], pal[i + 1]["w"]) in junta:
        out.append({"w": junta[(w["w"], pal[i + 1]["w"])], "s": w["s"], "e": pal[i + 1]["e"]}); i += 2; continue
    if w["w"] == "Take" and i + 1 < len(pal) and pal[i + 1]["w"].startswith("2"):
        out.append({"w": "Take-Two,", "s": w["s"], "e": pal[i + 1]["e"]}); i += 2; continue
    out.append({"w": troca.get(w["w"], w["w"]), "s": w["s"], "e": w["e"]}); i += 1
# boca: RMS por quadro de 1/30 s, normalizado
with wave.open(wav) as f:
    sr = f.getframerate(); n = f.getnchannels()
    a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
a = a.reshape(-1, n).mean(axis=1)
q = sr // 30
rms = np.array([np.sqrt((a[k*q:(k+1)*q] ** 2).mean()) for k in range(len(a) // q)])
boca = np.clip((rms - 0.01) / (np.percentile(rms, 95) - 0.01), 0, 1)
json.dump({"palavras": out, "boca": [round(float(b), 2) for b in boca], "duracao": round(len(a) / sr, 2)}, open(saida, "w", encoding="utf-8"), ensure_ascii=False)
print(len(out), "palavras,", len(boca), "quadros de boca")
