# Fase 37: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase37-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Dá pra pegar quatro supercarros de graça em Vice City, um deles sem trava nenhuma, e no final eu te mostro a garagem que, segundo a galera, muda de carro toda vez. "
 "Um: em Vespucci Island, na frente de uma mansão, tem uma Progen Emerus vermelho rubi. Pula a cerca. Tem um segurança armado: derruba ele. Sem alarme, destrancada. É sua. "
 "Dois: na ilha do lado, Casanova Island, entra na garagem pela porta dos fundos. Tem a Urus de ouro do outro vídeo, que precisa do clonador, e de brinde umas cartas colecionáveis. "
 "Três: no prédio Crimson Palms, logo acima das ilhas, sobe a rampa da direita. Tem um Lambo de ouro parado sozinho. "
 "Quatro: em Starfish Island, logo abaixo, tem um supercarro de oncinha na porta, com a placa POUNDS. "
 "Como eu prometi: do lado dele tem uma garagem com G-wagon e Lambo, e a galera diz que os carros mudam cada vez que você volta. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia de Emerus rubi ou de Lambo de ouro? Comenta.")
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
