# Fase 28: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase28-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Depois que o disco voador abduz a Lucia no GTA 6, ela começa a ter um pesadelo, e tudo que aparece nele existe de verdade no mapa. "
 "Lembra da abdução? Não acabou ali. Se você jogar com quem foi abduzido e for dormir, uma hora… o pesadelo começa. "
 "Ela acorda num quarto todo branco. Sem nada. Só uma porta preta. "
 "A porta leva pra uma sala cheia de ovos brilhando. Tem que passar agachada… porque se explodirem muitos… "
 "Depois, um planetário com o sistema solar. E se você gira a Terra… aparece um lugar de verdade em Leonida. "
 "Aí vem um teclado. O código tá nas linhas em cima dele. E um painel de botões que tem que ficar todo aceso. "
 "Três portas. A do meio… A certa tem… vacas. E uma garrafa de leite. Leva o leite pra máquina… e ela acorda. "
 "E o lugar do sonho aparece no mapa. É uma base secreta… e tem um alien lá dentro. Mas isso é a parte 2. "
 "Você está na Fase Extra, e eu sou o Vyce. Comenta parte 2 que eu te mostro o resgate do alien.")
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
