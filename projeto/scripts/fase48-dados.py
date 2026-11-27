# Fase 48: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase44-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Quatro motos raras do GTA 6, e uma delas tá pendurada numa árvore. "
 "A primeira: Dinka Double-T, numa mansão em Vespucci Island. Ela fica do lado de fora, perto do portão. Sem alarme e sem clonador: é só subir e sair. "
 "A segunda tá em Leonard County, numa curva da estrada. Alguém fez uma festinha debaixo de uma árvore e pendurou uma moto lá em cima. "
 "Atira nas duas correntes e ela cai. Ainda libera uma pintura nova pra comprar. "
 "E as duas melhores ficam juntas, numa mansão em Starfish Island. A cerca tem ponta, então sobe nas pedras do lado e pula. "
 "Na garagem dos fundos tem a Nagasaki SFB 1000 e a Principe Alvino V1. Desliga o alarme e pode levar. "
 "Quatro motos, zero real gasto. "
 "Você está na Fase Extra, e eu sou o Vyce. E aí: qual você ia buscar primeiro? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("príncipe","principe").replace("doublet","doublet").replace("está","tá").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
