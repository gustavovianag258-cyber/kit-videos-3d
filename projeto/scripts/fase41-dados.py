# Fase 41: narração = fala do Davy (live) + Vyce (parte 1) + fala do Davy + Vyce (parte 2).
# Legenda do Vyce = texto certo alinhado (difflib) às palavras do Whisper; falas do Davy com tempo do Whisper da live.
# uso: python scripts/fase41-dados.py <vyce_whisper.json> <vyce.wav> <live.wav> <saida.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Esse streamer tá jogando GTA 6 a 60 FPS, mesmo com a Rockstar dizendo que não dá, e no final eu te conto o truque e o preço que ele cobra. "
 "No console, o GTA 6 roda a 30 FPS. Nem o PS5 Pro tem modo 60: a Rockstar disse que o processador não aguenta a simulação do jogo. "
 "Agora olha a diferença. Em cima, 30. Embaixo, 60. Repara no carro e nas palmeiras passando. "
 "Em câmera lenta fica claro: o de cima anda aos pulinhos. "
 "O truque: a imagem sai do console por uma placa de captura, entra no PC, e um programa cria um quadro novo entre cada dois quadros do jogo. O jogo continua em 30. O PC inventa o resto. "
 "Como eu prometi, o preço: quadro inventado pode borrar nas bordas e dar um atrasinho no controle. E você precisa de console, placa de captura e um PC. "
 "60 de verdade, só no PC ou na próxima geração, e a Rockstar nem anunciou o PC ainda. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: 30 tá ótimo, ou só jogaria em 60? Comenta.")
D1 = (167.55, 170.95, [("Eu", 167.72), ("coloquei", 167.80), ("o", 168.28), ("GTA", 168.44), ("60", 168.76), ("FPS", 169.12), ("e", 169.60), ("é", 169.96), ("cinema!", 170.18)])
D2 = (237.70, 239.75, [("Vocês", 237.87), ("tão", 238.31), ("vendo", 238.41), ("a", 238.53), ("diferença", 238.63), ("brutal!", 238.89)])
CORTE = 23.12  # Vyce: depois de "passando."
PAUSA = 0.2
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("está", "tá").replace("vice", "vyce").replace("embaixo", "baixo")
certo = TEXTO.split()
A = [norm(w["w"]) for w in wh]; B = [norm(w).replace("embaixo", "baixo") for w in certo]
A = [x.replace("embaixo", "baixo") for x in A]
tem = [None] * len(certo)
for a, b, n in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(n): tem[b + k] = (wh[a + k]["s"], wh[a + k]["e"])
for i in range(len(certo)):
    if tem[i] is None:
        j = i
        while j < len(certo) and tem[j] is None: j += 1
        ini = tem[i - 1][1] if i > 0 else 0.0
        fim = tem[j][0] if j < len(certo) else ini + 0.3 * (j - i)
        passo = (fim - ini) / (j - i)
        for k in range(i, j): tem[k] = (ini + (k - i) * passo, ini + (k - i + 1) * passo)
def ler(p):
    with wave.open(p) as f:
        sr = f.getframerate(); n = f.getnchannels()
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a.reshape(-1, n).mean(axis=1), sr
vy, sr = ler(sys.argv[2]); live, sr2 = ler(sys.argv[3]); assert sr == sr2 == 48000
rms = lambda x: np.sqrt((x ** 2).mean())
alvo = rms(vy[vy ** 2 > 1e-5])
def trecho(d):
    x = live[int(d[0] * sr):int(d[1] * sr)].copy()
    x *= alvo / rms(x[x ** 2 > 1e-5]) * 0.95
    f = int(0.03 * sr); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x
z = lambda s: np.zeros(int(s * sr), np.float32)
d1 = trecho(D1); d2 = trecho(D2)
v1 = vy[:int(CORTE * sr)]; v2 = vy[int(CORTE * sr):]
partes = [d1, z(PAUSA), v1, z(0.15), d2, z(PAUSA), v2]
O1 = (len(d1) / sr) + PAUSA
I2 = O1 + CORTE + 0.15
O2 = I2 + len(d2) / sr + PAUSA - CORTE
audio = np.concatenate(partes)
pico = np.abs(audio).max()
if pico > 0.97: audio *= 0.97 / pico
with wave.open(sys.argv[4], "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes((audio * 32767).astype(np.int16).tobytes())
out = [{"w": w, "s": round(D1_s - D1[0], 2), "e": round(D1_s - D1[0] + 0.3, 2), "davy": True} for w, D1_s in D1[2]]
for w, (s, e) in zip(certo, tem):
    off = O1 if s < CORTE else O2
    out.append({"w": w, "s": round(s + off, 2), "e": round(e + off, 2)})
out += [{"w": w, "s": round(s - D2[0] + I2, 2), "e": round(s - D2[0] + I2 + 0.3, 2), "davy": True} for w, s in D2[2]]
out.sort(key=lambda p: p["s"])
q = sr // 60
r = np.array([np.sqrt((audio[k*q:(k+1)*q] ** 2).mean()) for k in range(len(audio) // q)])
boca = np.clip((r - 0.01) / (np.percentile(r, 95) - 0.01), 0, 1)
json.dump({"palavras": out, "boca": [round(float(b), 2) for b in boca], "duracao": round(len(audio) / sr, 2), "davy": [[0, round(len(d1) / sr, 2)], [round(I2, 2), round(I2 + len(d2) / sr, 2)]]}, open(sys.argv[5], "w", encoding="utf-8"), ensure_ascii=False)
print(len(out), "palavras, duracao", round(len(audio) / sr, 2), "O1", round(O1, 2), "I2", round(I2, 2), "O2", round(O2, 2))
print(" ".join(f"{p['w']}@{p['s']}" for p in out))
