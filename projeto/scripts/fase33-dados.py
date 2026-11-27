# Fase 33: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase33-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Dá pra deixar qualquer carro que você roubar no GTA 6 como seu pra sempre, guardado na garagem, e eu te mostro o passo a passo, e no final o erro que faz a oficina recusar o seu carro. "
 "Passo um: antes de roubar, segura a seta pra cima e aperta R1. O app escaneia o carro. Olha a linha do rastreador: tem que estar não. E já mostra quanto custa o registro. "
 "Passo dois: tá trancado? Arromba ou destranca e faz a ligação direta. "
 "Passo três: leva na Autopeças Watkins, a oficina do Moses, em Port Gellhorn, lá em cima no mapa. Ela só abre no capítulo 2. "
 "Passo quatro: fala com o Moses, L2 e quadrado. Primeiro pinta o carro, depois registra. Pagou, ficou azulzinho no mapa: o carro agora é seu. "
 "Como eu prometi, o erro: carro com rastreador o Moses não aceita, e carro roubado do lado da oficina também não. Rouba longe e escaneia antes. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: qual ia guardar primeiro, um esportivo ou uma caminhonete? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
certo = TEXTO.split()
A = [norm(w["w"]) for w in wh]; B = [norm(w) for w in certo]
tem = [None] * len(certo)
for a, b, n in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(n): tem[b + k] = (wh[a + k]["s"], wh[a + k]["e"])
# preenche os que não casaram interpolando entre vizinhos
for i in range(len(certo)):
    if tem[i] is None:
        j = i
        while j < len(certo) and tem[j] is None: j += 1
        ini = tem[i - 1][1] if i > 0 else 0.0
        fim = tem[j][0] if j < len(certo) else ini + 0.3 * (j - i)
        passo = (fim - ini) / (j - i)
        for k in range(i, j): tem[k] = (ini + (k - i) * passo, ini + (k - i + 1) * passo)
out = [{"w": w, "s": round(s, 2), "e": round(e, 2)} for w, (s, e) in zip(certo, tem)]
with wave.open(sys.argv[2]) as f:
    sr = f.getframerate(); n = f.getnchannels()
    a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
a = a.reshape(-1, n).mean(axis=1); q = sr // 30
rms = np.array([np.sqrt((a[k*q:(k+1)*q] ** 2).mean()) for k in range(len(a) // q)])
boca = np.clip((rms - 0.01) / (np.percentile(rms, 95) - 0.01), 0, 1)
json.dump({"palavras": out, "boca": [round(float(b), 2) for b in boca], "duracao": round(len(a) / sr, 2)}, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False)
print(len(out), "palavras, duracao", round(len(a) / sr, 2))
print(" ".join(f"{p['w']}@{p['s']}" for p in out))
