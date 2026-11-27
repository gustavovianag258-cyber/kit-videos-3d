# Fase 29: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase29-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Tem uma base secreta no GTA 6 com um alien preso, e se você salvar ele, ganha mais vida, fôlego e foco pra sempre, e eu te mostro onde fica. "
 "Na parte 1, a Lucia sonhou com uma torre. Depois disso, o jogo marca no mapa: ache o local misterioso. Fica ao sul de Hamlet, no distrito de Vice-Dale. "
 "Uma base militar abandonada… com a torre do sonho. Lá dentro tem um teclado. O código é o mesmo que apareceu no seu sonho. "
 "Um elevador desce pra um subterrâneo cheio de túnel… E aí você descobre o que os cientistas faziam com ele. "
 "Tem o mesmo painel e as mesmas três portas do sonho. E atrás de uma delas… Põe o leite na máquina… e a cápsula abre. "
 "Um alien vivo. Você pega no colo… e foge. Lá fora, o disco voador desce… e leva ele de volta. "
 "E o prêmio: saúde, fôlego e foco máximos aumentados. Pra sempre. E ainda volta e destrói tudo em volta. Por salvar um alien. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: salvava o alien ou deixava ele lá? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("david","davy").replace("abduza","abduz").replace("alho","alien").replace("pier","píer").replace("saia","saía")
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
