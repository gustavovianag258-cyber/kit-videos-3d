# Fase 21: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase21-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("O carro do Brian, do primeiro Velozes e Furiosos, tá escondido no GTA 6. E a placa é uma zoeira com ele. "
 "Vou te mostrar onde fica, como pegar, e os 3 detalhes que provam que é ele. Ele fica nas Rialto Islands, as ilhinhas no caminho entre Vice City e Vice Beach. "
 "Entra numa das ruas de casa, e procura a garagem marcada no mapa. O carro fica sempre no mesmo lugar. "
 "É só abrir o portão, entrar e sair dirigindo. Se dá pra guardar ele pra sempre, ninguém confirmou ainda. "
 "Detalhe 1: no jogo ele se chama Maibatsu Penumbra. Mas olha a cara dele: é o Eclipse. "
 "2: verde limão, a asa gigante atrás, os adesivos de corrida. Igualzinho ao do filme. "
 "E 3, o melhor: a placa diz “HAD YOU”. No filme, o Brian perde o racha pro Toretto e fala: “eu quase te peguei”. E o Toretto: “você nunca me pegou”. "
 "Detalhe: ele tinha apostado o próprio carro nesse racha. E nem deu tempo de entregar: o Eclipse foi destruído logo depois. "
 "E a Rockstar já tinha feito essa piada: no GTA Online, em 2020, esse carro tinha uma pintura chamada “quase te peguei”. Agora ela escondeu o carro inteiro. "
 "Uma homenagem ao Paul Walker, quase 13 anos depois. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: vai buscar o Eclipse, ou tá esperando o Charger do Toretto? Comenta.")
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
