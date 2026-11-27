# Fase 38: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase38-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Tem cinco armas raras de graça no GTA 6 que você não perde nem quando morre, e no final eu te mostro a mais difícil, que só a Lucia consegue pegar. "
 "Arma de nome amarelo é única: se perder, ela volta no armário de armas. "
 "Um: o rifle Kingfishers W-22, com mira e silenciador. Fica nas cabanas de pesca da gangue Kingfisher, nas Keys. Vai armado: tem uns vinte caras. "
 "Dois e três, numa viagem só: numa cabana abandonada no pântano de Pelican Valley tem o revólver Swamp Bait e o sniper Cruel Huntsman. Só cuidado com o jacaré: na água, ele te pega de uma vez. "
 "Quatro: num depósito em Vice-Dale, derruba a pilha de papel higiênico. Atrás tem a carabina Cockroach Xtreme e um lança-granadas. Mas o lança-granadas não é único: esse você perde se morrer. "
 "E a cinco, como eu prometi: a Black Eagle M306, no galpão da Black Eagle em Balsero. Ela fica atrás de uma fresta que só a Lucia passa: encosta na parede e vai se espremendo. "
 "Salva o jogo antes: se um funcionário chamar a polícia, o galpão lota e você não pega mais. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ia de sniper ou de M306? Comenta.")
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
