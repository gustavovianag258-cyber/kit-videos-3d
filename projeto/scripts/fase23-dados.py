# Fase 23: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase23-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Quase 8 milhões de pessoas assistindo GTA 6 ao vivo. Ao mesmo tempo. Nunca um jogo juntou tanta gente em live. E o Brasil tava no topo. Vou te mostrar os números. "
 "O recorde antes era do Valorant, em 2020: 1 milhão e 700 mil pessoas. O GTA 6 fez mais de 4 vezes isso. Em poucas horas. "
 "Só na Twitch, foram mais de 3 milhões ao mesmo tempo. Virou a categoria mais vista da história, passando até o mundial de League of Legends. "
 "No YouTube, mais 3 milhões. E na Kick, quase 1 milhão e meio. "
 "E o Brasil nem precisou esperar a meia-noite: a galera abriu live às 8 da manhã, pelo horário da Nova Zelândia. "
 "Resultado: 2 dos 3 maiores streamers do mundo no lançamento eram brasileiros. O Alanzoka passou de 300 mil pessoas assistindo ao mesmo tempo. "
 "O Paulinho o Loko e o Davy Jones também passaram de 200 mil cada um, no YouTube. "
 "E na Kick, mais de mil canais transmitindo o mesmo jogo ao mesmo tempo. Recorde da plataforma. "
 "E o jogo? Nota 99. Empatado com o Zelda Ocarina of Time, o mais bem avaliado da história. "
 "Quase 8 milhões de pessoas. Fala aí: você tava assistindo quem? Você está na Fase Extra, e eu sou o Vyce. Comenta quem você assistiu no lançamento.")
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
