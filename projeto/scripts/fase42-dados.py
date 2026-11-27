# Fase 42: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase42-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("A melhor casa do GTA 6 vem com 8 supercarros de graça, um helicóptero no teto e uma garagem no céu, e no final eu te conto o porém que quase ninguém fala. "
 "1: fica em Tequesta Retreat, essa ilhinha em forma de diamante, no prédio Pegassi Residences, a torre mais alta. "
 "2: só o elevador já tem heliponto, 3 andares, 2 garagens no céu e 4 estacionamentos. "
 "3: no teto tem um helicóptero esperando por você, a qualquer hora. "
 "4: lá dentro tem adega, mesa de sinuca, closet pra trocar de roupa e um videogame que você joga de verdade na TV da sala. "
 "5: no andar de baixo tem banheira, sauna, vestiário e essa vista da cidade inteira. "
 "E 6, a melhor: a garagem no céu. São 8 supercarros, motos e até um patinete. Entra e dirige: sem arrombar e sem chave. O elevador desce com o carro e você sai pela cidade. E se bater, ele volta pra garagem. "
 "Como eu prometi, o porém: não dá pra comprar. A cobertura só chega nas últimas missões da história. O cara do vídeo levou umas 45 horas. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia mais pela cobertura ou pela garagem no céu? Comenta.")
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
