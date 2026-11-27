# Fase 22: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase22-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Se você já buscou a Lucia no GTA 6, perdeu isso aqui pra sempre. Faz essas 5 coisas antes de buscar ela. "
 "1: conserta a casa do Jason. Os reparos têm um pincel no mapa, são de graça, e cada um vale coração com a Lucia. Depois que ela chega, não dá mais. "
 "2: enche a geladeira, compra flores e um colar, e conserta o carro do Jason. Ela repara em tudo. "
 "3: treina na varanda. Força aumenta a vida. E o saco de pancadas no depósito dá fôlego. Só não para, que perde. "
 "4: fala com o Joey na Coastal Auto Care e salva o número. Bateu o carro? Liga pra ele, que ele conserta de graça. "
 "5: no quarto do Jason, mexe nas tábuas soltas do chão. É ali o esconderijo do dinheiro. "
 "Aí sim: a Lucia chega, a casa tá pronta, e vocês já começam apaixonados. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: fez tudo, ou já buscou a Lucia? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("rioalto","rialto")
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
