# Fase 50: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase44-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Essa é a missão mais bizarra do GTA 6. E no final, o Jason acha o corpo da Lúcia… só que ela tá viva em casa. "
 "Começa num banheiro: um cartaz escrito “não dê descarga”, com um QR code. Lê no app WAiNK, responde “truth” e vai pro Frank's Waffles. "
 "Lá tá o Dr. Merle. A teoria dele: o bilionário Andrew Node recolhe o DNA do esgoto pra fazer clones de todo mundo. E o plano dele pra provar é engolir um rastreador… e dar descarga. "
 "Você dirige a van dele seguindo o rastreador até a estação de esgoto de Gloriana Key. Entra escondido e acha uma escada secreta. "
 "Lá embaixo tem uma câmara com líquido verde. O Merle entra e pede pra você dar descarga nele. Se você entrar também, acorda em casa com a stamina máxima aumentada pra sempre. "
 "Mas depois da missão, um bunker em Lummox County abre com o código 3612. Lá embaixo tem três corpos: o do Merle, o de um careca… e o de quem você mandou pra câmara. Aqui, a Lúcia. "
 "O Jason liga pra ela, e ela tá ótima. Um site gringo jurou que a Lúcia virou um clone. A Rockstar não confirmou nada. "
 "Você está na Fase Extra, e eu sou o Vyce. E aí: a Lúcia é um clone ou é só piada da Rockstar? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("lucia","lúcia").replace("está","tá").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
