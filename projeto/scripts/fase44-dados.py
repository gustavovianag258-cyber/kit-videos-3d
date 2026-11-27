# Fase 44: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase44-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Esses são os 10 carros mais raros do GTA 6 que quase ninguém achou, e o número 1 é uma Lamborghini da polícia que liga a sirene e abre o trânsito pra você. "
 "10: o Vapid Dominator vermelho, com o motor pra fora. Fica na frente do motel da gangue Colt, em Port Gellhorn. É só chegar e pegar. "
 "9: o Albany Buccaneer verde e dourado, um clássico dos anos 60 restaurado. Ele tá na operação da gangue M7, no lago Tolocco. "
 "8: o Red Hot Hustler, um hot rod roxo com chamas, esquecido no canto do estacionamento de um hotel em Capri. "
 "7: o Bravado Gauntlet verde, escondido na garagem da Hog Stars, em Ambrosia. Se não quiser ficar com ele, vende por 22 mil. "
 "6: ainda em Ambrosia, numa garagem, um Bravado azul e dourado com cara de filme de ação. Pra registrar, sai por mais de 28 mil. "
 "5: o Buckingham Windsor dourado, o Rolls-Royce do jogo. Fica no estúdio de clipe da gangue San4San, e registrar custa só 9 mil. "
 "4: uma Coquette da polícia, branca, parada na frente da delegacia de Capri. Ninguém ia ser doido de roubar ali, né? Com o clonador de chave, dá. Só cuidado com o rastreador. "
 "3: o Pegassi Infernus com detalhes dourados, um dos carros mais clássicos de GTA, parado na entrada de uma casa em Ambrosia. Precisa do clonador. Vende por 17 mil, ou fica com ele por 34. "
 "2: o Zorrusso Tsunami, com as cores do BMW do Need for Speed. Fica em Peacock Estates: pula o portão, vai pra garagem e usa o clonador. E ele voa. "
 "E o número 1, como eu prometi: a Pegassi Valiant Tempesta, a Lamborghini da polícia, na frente do museu de Vice City. É a única do mapa, tem segurança e rastreador, mas liga a sirene e todo mundo sai da sua frente. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia de Lambo da polícia ou de Need for Speed? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("está","tá").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
