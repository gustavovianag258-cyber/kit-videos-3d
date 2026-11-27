# Fase 43: narração = Vyce (1) + fala do Zero (live) + Vyce (2) + fala da live + Vyce (3).
# Legenda do Vyce = texto certo alinhado (difflib) às palavras do Whisper; falas do Davy com tempo do Whisper da live.
# uso: python scripts/fase41-dados.py <vyce_whisper.json> <vyce.wav> <live.wav> <saida.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Tem gente jurando que o NPC maluco da garagem do GTA 6 é o Jimmy, do Bully, e depois de ver as pistas eu tô do lado deles, e no final eu te mostro a prova mais forte. "
 "Lembra dele? O cara descobriu que vive num jogo e escreveu: J e L são os únicos livres. "
 "A teoria: no Bully, o Jimmy era controlado pelo jogador. Quando a gente largou o controle, ele virou NPC. Por isso ele é o único que percebe. "
 "Pista 1: a bicicleta, igualzinha às que ele pedalava na escola. "
 "Pista 2: coisa de escola por todo lado, nas cores da Bullworth: azul e amarelo. "
 "Pista 3: o Jimmy tinha 15 anos em 2006. Hoje teria uns 35: a idade de um cara morando sozinho numa garagem. "
 "E a prova mais forte, como eu prometi: pendurada no cabide tem uma jaqueta azul, no tom da Bullworth, que a galera diz ser a jaqueta com que o Jimmy chega na escola. "
 "A Rockstar nunca confirmou, e tem quem diga que o Bully é outro universo. Mas, pra mim, é pista demais pra ser coincidência. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: é o Jimmy ou só um NPC maluco? Comenta.")
# falas dos streamers (live do TioZero, tempo da live) inseridas depois dos cortes da voz do Vyce
D1 = (975.78, 979.45, [("Cara,", 975.84), ("eu", 976.30), ("acho", 976.44), ("que", 976.80), ("a", 976.94), ("sua", 977.02), ("teoria", 977.14), ("do", 977.46), ("Jimmy", 977.70), ("é", 977.96), ("possível.", 978.80)])
D2 = (1962.50, 1964.40, [("Tudo", 1962.58), ("tá", 1963.00), ("batendo.", 1963.18), ("Tudo.", 1964.02)])
C1 = 23.62  # Vyce: depois de "percebe."
C2 = 48.80  # Vyce: depois de "escola." (frase da jaqueta refeita e emendada)
PAUSA = 0.2
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("está", "tá").replace("vice", "vyce")
certo = TEXTO.split()
A = [norm(w["w"]) for w in wh]; B = [norm(w) for w in certo]
A = [x for x in A]
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
v1 = vy[:int(C1 * sr)]; v2 = vy[int(C1 * sr):int(C2 * sr)]; v3 = vy[int(C2 * sr):]
partes = [v1, z(PAUSA), d1, z(PAUSA), v2, z(PAUSA), d2, z(PAUSA), v3]
I1 = C1 + PAUSA
O2 = len(d1) / sr + 2 * PAUSA           # deslocamento da parte 2 do Vyce
I2 = C2 + O2 + PAUSA
O3 = O2 + len(d2) / sr + 2 * PAUSA      # deslocamento da parte 3
audio = np.concatenate(partes)
pico = np.abs(audio).max()
if pico > 0.97: audio *= 0.97 / pico
with wave.open(sys.argv[4], "w") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes((audio * 32767).astype(np.int16).tobytes())
out = [{"w": w, "s": round(t - D1[0] + I1, 2), "e": round(t - D1[0] + I1 + 0.3, 2), "davy": True} for w, t in D1[2]]
for w, (s0, e0) in zip(certo, tem):
    off = 0 if s0 < C1 else O2 if s0 < C2 else O3
    out.append({"w": w, "s": round(s0 + off, 2), "e": round(e0 + off, 2)})
out += [{"w": w, "s": round(t - D2[0] + I2, 2), "e": round(t - D2[0] + I2 + 0.3, 2), "davy": True} for w, t in D2[2]]
out.sort(key=lambda p: p["s"])
q = sr // 60
r = np.array([np.sqrt((audio[k*q:(k+1)*q] ** 2).mean()) for k in range(len(audio) // q)])
boca = np.clip((r - 0.01) / (np.percentile(r, 95) - 0.01), 0, 1)
json.dump({"palavras": out, "boca": [round(float(b), 2) for b in boca], "duracao": round(len(audio) / sr, 2), "davy": [[round(I1, 2), round(I1 + len(d1) / sr, 2)], [round(I2, 2), round(I2 + len(d2) / sr, 2)]]}, open(sys.argv[5], "w", encoding="utf-8"), ensure_ascii=False)
print(len(out), "palavras, duracao", round(len(audio) / sr, 2), "I1", round(I1, 2), "I2", round(I2, 2), "O3", round(O3, 2))
print(" ".join(f"{p['w']}@{p['s']}" for p in out))
