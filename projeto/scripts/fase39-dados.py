# Fase 39: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase39-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Dá pra pegar uma Lamborghini Urus preta e dourada logo no começo do GTA 6, destrancada, e no final eu te conto o que quase todo mundo erra pra deixar ela sua pra sempre. "
 "Passo 1: sai da casa do Jason e vai pro norte, até La Perle, nessa rua de casas. "
 "Passo 2: a casa é de uma gangue, e tem dois caras vigiando o carro. Não precisa brigar. "
 "Passo 3: escaneia no celular. É a Pegassi Toros Carbonizado: destrancada, segurança desligada e só um rastreador comum. "
 "Passo 4: pula a primeira cerca vermelha e depois a segunda, atrás deles. Vai agachado, sem barulho. Chegou perto, corre, entra e vai embora. "
 "E ela anda muito, com uma direção absurda. "
 "Como eu prometi, o erro: por causa do rastreador, o Moses não registra. No Pay 'n' Spray dá, mas só a partir do capítulo 3. Então pega agora, curte, e quando chegar no 3, registra. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia de preta e dourada ou de toda de ouro? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
