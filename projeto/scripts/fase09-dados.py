# Fase 09: legenda (texto certo + tempo do Whisper, escalado pela aceleração da voz) e abertura da boca.
# uso: python scripts/fase09-dados.py <whisper.json> <narracao.wav> <saida.json> <fator_atempo>
import json, sys, wave, numpy as np
pal = json.load(open(sys.argv[1], encoding="utf-8"))
wav, saida, fator = sys.argv[2], sys.argv[3], float(sys.argv[4])
multi = [(["para", "a", "IGN"], ["pra", "IGN"]), (["fase", "extra"], ["Fase", "Extra,"])]
troca = {"fique": "Fica", "Ferramentas": "Ferramenta", "10": "dez", "Gasolina,": "gasolina,", "Vice.": "Vyce.", "desce": "desse",
         "um?": "um:", "nada,": "nada.", "botão,": "botão.", "fácil,": "fácil.", "sair,": "sair.", "eletrônica,": "eletrônica?",
         "rastreador": "rastreador,", "embora,": "embora.", "isso.": "isso:"}
out, i = [], 0
while i < len(pal):
    for de, para in multi:
        if [p["w"] for p in pal[i:i + len(de)]] == de:
            s, e = pal[i]["s"], pal[i + len(de) - 1]["e"]
            passo = (e - s) / len(para)
            out += [{"w": w, "s": s + k * passo, "e": s + (k + 1) * passo} for k, w in enumerate(para)]
            i += len(de); break
    else:
        w = pal[i]["w"]
        if w == "carro," and i < 10: w = "carrão,"
        if w == "está" and i + 1 < len(pal) and pal[i + 1]["w"].startswith("trancado"): w = "tá"
        out.append({"w": troca.get(w, w), "s": pal[i]["s"], "e": pal[i]["e"]}); i += 1
for k in range(1, len(out)):  # maiúscula depois de ponto final ou interrogação
    if out[k - 1]["w"][-1] in ".?": out[k]["w"] = out[k]["w"][0].upper() + out[k]["w"][1:]
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
print(len(out), "palavras,", len(boca), "quadros de boca, duracao", round(len(a) / sr, 2))
print(" ".join(f"{p['w']}@{p['s']}" for p in out))
