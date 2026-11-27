# Fase 31: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase31-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("No primeiro dia de GTA 6 a galera já achou segredo absurdo: tem a Anitta no rádio, o barco do Michael do GTA 5 e até um Pé Grande que te apaga no meio do mato, e eu separei os sete mais insanos, e o número um você vai querer caçar hoje. "
 "Número sete: faz carinho no bicho. Parece bobeira, mas olha o canto da tela: foco reforçado. Cachorro, gato… carinho virou bônus. "
 "Número seis: na grama perto da praia, um marombeiro chama o Jason de beta e desafia pra uma luta. Ganha a briga… e ele ainda te paga mil dólares. "
 "Número cinco: lá no alto do Monte Kalaga tem uma cratera soltando fumaça roxa. É um meteorito, e segundo os guias, dá pra pegar a pedra e vender. "
 "Número quatro, esse é nosso: liga o rádio na The Wipe. Tem um programa chamado Ask Dr. Nita, e quem faz a doutora é a Anitta. Tá confirmado pela Rockstar. "
 "Número três: em 2021, a Rockstar escondeu a foto de uma casa num quadro do San Andreas remasterizado. Ninguém entendeu. Agora acharam a casa no GTA 6, igualzinha, em Belville. E na garagem tem um seis e as iniciais J e L. Jason e Lucia. "
 "Número dois: no quintal da casa do Jason tem um barco velho em cima de cavalete. É o mesmo modelo do barco do Michael, do GTA 5. Sobe nele e olha o GPS: mapa de Los Santos. E no celular, em toques, tem o Wind Chimes, o toque do Michael. "
 "E o número um: no pântano de Grassrivers, um vulto passa no meio do mato. Segue o barulho e você acha um boneco de galho amarrado numa árvore, soltando um gás verde. Chega perto… a visão embaça, o Jason apaga, e acorda no carro sem saber o que aconteceu. É o Skunk Ape, o Pé Grande dos pântanos da Flórida. No San Andreas a galera caçou ele por anos, e ele nunca existiu. Vinte e dois anos depois, ele tá lá. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia atrás do Pé Grande ou do meteorito? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("david","davy").replace("doctor","dr").replace("doutor","dr").replace("pier","píer").replace("saia","saía")
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
