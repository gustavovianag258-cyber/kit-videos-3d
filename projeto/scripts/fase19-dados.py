# Fase 19: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase19-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("O GTA 6 levou 37 minutos pra ganhar o primeiro bug famoso. Eu fui atrás dos vídeos. Separei os 5 mais compartilhados, "
 "e no fim eu te digo se o jogo tá quebrado ou não. Bug 1: logo na primeira missão, a Lucia atravessa o chão e cai pra fora do mapa. "
 "Esse post passou de 33 mil curtidas. A dica da galera: espera uns segundos, que ela volta. Não voltou? Reinicia a missão. "
 "Bug 2: na missão do hidroavião, a porta não abre. O Jason simplesmente atravessa a lataria e aparece sentado no banco do piloto. "
 "Bug 3, o mais compartilhado: o Jason agarra um policial, e os dois atravessam o balcão da loja. O streamer que postou ficou bravo: 13 anos pra isso. "
 "Bug 4: nas Keys, um navio aparece em cima da ponte, com carro passando do lado. Até o kosky, ao vivo, ficou sem palavras. "
 "Bug 5, o mais polêmico: você abre a geladeira e a cerveja aparece na mão. Sem pegar. Metade diz que é bug, metade diz que é só preguiça de animação. "
 "E cuidado com o boato: o post dizendo que a Rockstar pediu desculpas e marcou correção pro dia 25 é falso. Até agora, ela não falou nada dos bugs. "
 "E o Brasil também entrou na história: às 8h41, o kosky postou o bug dele. E agora ele quer o título. "
 "Ou seja: 37 minutos pro primeiro bug. Mas é bug feio e engraçado. Ninguém mostrou o jogo quebrando de vez. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: já achou bug, ou tá liso até agora? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra")
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
