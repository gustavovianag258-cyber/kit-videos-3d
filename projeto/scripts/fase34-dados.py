# Fase 34: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase34-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Dá pra pegar uma bazuca de graça logo no começo do GTA 6, que na loja custa uns dezesseis mil dólares, e ainda leva uma arma rara junto, e no final eu te mostro o cuidado pra você não perder ela. "
 "Passo um: vai pro noroeste de Vice-Dale, perto da loja Black Eagle. Tem um pátio cheio de carro velho, um ferro-velho. "
 "Passo dois: tem uns caras por ali, resolve no soco. Aí procura o trailer azul cheio de antena. "
 "Passo três: lá dentro tem um alçapão no chão. Desce. É um bunker escondido. "
 "Passo quatro, o prêmio: o lançador H-AT, a bazuca, com foguete. A submetralhadora Type 9 Conspiracist, que é uma variante rara. E granada. "
 "E funciona: derruba até helicóptero. "
 "Como eu prometi, o cuidado: a polícia aparece, então sai rápido. E tem jogador dizendo que, se morrer ou for preso, perde a bazuca. A Type 9 fica. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia de bazuca ou de Type 9? Comenta.")
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
