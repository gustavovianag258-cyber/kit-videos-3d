# Fase 26: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase26-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Dá pra pegar 10 mil dólares muito fácil logo no começo do GTA 6, e ainda levar uma arma especial, só resolvendo o mistério de um caranguejo gigante, e eu te mostro o passo a passo. "
 "Vai pro sudoeste do pântano de Pelican Valley, logo acima das Keys. Tem uma base de pesquisa abandonada lá no meio do mato. "
 "Antes de entrar, dá a volta na casa principal e liga a chave de energia lá atrás. "
 "Lá dentro tem um cofre e um computador com senha. A senha tá rabiscada no chão, num quartinho perto da cozinha. É a última: CLEAVES. "
 "No computador tem uma lista de compras esquisita… e embaixo: código do cofre igual a sucesso em dobro. Guarda isso. "
 "Aí, quando você sai do computador… um caranguejo do tamanho de uma pessoa cai em cima de você. "
 "Ele veio do laboratório nos fundos. Gaiola de caranguejo pra todo lado, produto químico… e uma gaiola gigante, quebrada. "
 "Na prancheta, o registro dos experimentos. O espécime 0036, Leonida Blue, mais 25 quilos: sucesso. "
 "Sucesso em dobro: 36 mais 36. O código do cofre é 0072. No cofre tem mil dólares e um protocolo de emergência: 0212. "
 "Usa a visão de águia e segue o rastro de sangue até o galpão no fim do píer. Digita 0212. "
 "Lá dentro: a submetralhadora VF5 Crabshack, e uma mochila com 10 mil dólares em notas marcadas. "
 "Nota marcada não dá pra gastar direto. Leva no depósito do Brian. Ele paga depois, e pode demorar umas missões. "
 "E o espécime 0036? Pelo que ficou lá dentro, ele não atacou só você. Ele se virou contra quem criou ele. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia atrás da arma, ou fugia do caranguejo? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("david","davy").replace("cleves","cleaves").replace("pier","píer").replace("saia","saía")
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
