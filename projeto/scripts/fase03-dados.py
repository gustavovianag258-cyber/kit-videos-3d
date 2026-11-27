# Fase 03: legenda (texto certo + tempo do Whisper, escalado pela aceleração da voz) e abertura da boca.
# uso: python scripts/fase03-dados.py <whisper.json> <narracao.wav> <saida.json> <fator_atempo>
import json, sys, wave, numpy as np
pal = json.load(open(sys.argv[1], encoding="utf-8"))
wav, saida, fator = sys.argv[2], sys.argv[3], float(sys.argv[4])
# trocas de várias palavras do Whisper por uma ou mais palavras certas
multi = [
    (["vai", "Ciciri."], ["Vice", "City:"]),
    (["Arte", "de", "Co,"], ["art", "déco,"]),
    (["fase", "extra,"], ["Fase", "Extra,"]),
]
troca = {"Quis,": "Keys,", "Ambrosia.": "Ambrosia:", "Calaga,": "Kalaga:", "Galhorn,": "Gellhorn,", "Vice.": "Vyce.",
         "Caça,": "caça,", "Pesca,": "pesca,", "Trilha,": "trilha...", "Pântano": "pântano", "Jacaré": "jacaré",
         "Padaria": "padaria", "Cubana,": "cubana,", "Mercado": "mercado", "Marca": "marca", "Falsificada": "falsificada",
         "Porto": "porto", "Cruzeiro": "cruzeiro", "Mundo.": "mundo.", "Prédio": "prédio", "última,": "última:",
         "disse,": "disse:", "esse.": "esse:", "primeiro.": "primeiro?", "Comenta,": "Comenta:", "6": "seis"}
out, i = [], 0
while i < len(pal):
    feito = False
    for de, para in multi:
        if [p["w"] for p in pal[i:i + len(de)]] == de:
            s, e = pal[i]["s"], pal[i + len(de) - 1]["e"]
            passo = (e - s) / len(para)
            for k, w in enumerate(para):
                out.append({"w": w, "s": s + k * passo, "e": s + (k + 1) * passo})
            i += len(de); feito = True; break
    if feito:
        continue
    w = pal[i]["w"]
    if w == "6" and i > 0 and pal[i - 1]["w"] == "GTA":
        w = "6!" if False else "6"
    elif w == "6":
        w = "seis"
    out.append({"w": troca.get(w, w) if w != "6" else w, "s": pal[i]["s"], "e": pal[i]["e"]}); i += 1
for p in out:
    p["s"] = round(p["s"] / fator, 2); p["e"] = round(p["e"] / fator, 2)
with wave.open(wav) as f:
    sr = f.getframerate(); n = f.getnchannels()
    a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
a = a.reshape(-1, n).mean(axis=1)
q = sr // 30
rms = np.array([np.sqrt((a[k*q:(k+1)*q] ** 2).mean()) for k in range(len(a) // q)])
boca = np.clip((rms - 0.01) / (np.percentile(rms, 95) - 0.01), 0, 1)
json.dump({"palavras": out, "boca": [round(float(b), 2) for b in boca], "duracao": round(len(a) / sr, 2)}, open(saida, "w", encoding="utf-8"), ensure_ascii=False)
print(len(out), "palavras,", len(boca), "quadros de boca")
print(" ".join(f"{p['w']}@{p['s']}" for p in out))
