# Fase 49: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase44-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Oito mecânicas do GTA 6 que o jogo não te conta. A primeira já economiza muito dinheiro. "
 "Um: conserto grátis. No app da Scooter Bros, assina o Premium uma vez só, por 12.500. Aí você ganha três entregas grátis por dia: o carro aparece inteiro na sua frente. "
 "Dois: aperta triângulo duas vezes e o personagem desce com o carro ligado. Perfeito pra fuga. "
 "Três: piloto automático. Marca um ponto no mapa, segura a seta pra baixo, aperta Options e segura bolinha. Ele dirige sozinho, respeitando o trânsito. "
 "Quatro: põe um snorkel na sua off-road. É baratinho e deixa entrar na água sem estragar o motor. "
 "Cinco: no binóculo, aperta os dois analógicos. Marca todo mundo e ainda mostra o preço e a segurança dos carros de longe. "
 "Seis: antes de um assalto, usa o modo foco. Laranja é o que dá pra roubar, verde é funcionário que pode ter a senha do cofre, azul é segurança e vermelho é câmera, alarme e polícia. "
 "Sete: no mapa, prédio azul escuro dá pra entrar. Azul claro, não. "
 "E oito: com o Jason, aperta R2 duas vezes perto de um parapeito e ele joga o cara da ponte. E a Lúcia sabe jiu-jitsu. "
 "Você está na Fase Extra, e eu sou o Vyce. E aí: qual dessas você não sabia? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("12500","12500").replace("lucia","lúcia").replace("está","tá").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
