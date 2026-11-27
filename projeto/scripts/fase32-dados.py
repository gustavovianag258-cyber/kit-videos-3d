# Fase 32: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase32-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Dá pra fazer dinheiro infinito logo no começo do GTA 6 só salvando e carregando o jogo, e eu te mostro o passo a passo, e no final o detalhe que ninguém te conta pra você não perder tudo. "
 "Passo um: vai pro galpão vermelho no sul de Vice-Dale, logo acima de Key Lento. A porta tá trancada: arromba. "
 "Passo dois: lá dentro já tá todo mundo morto. Pega as bolsas de mercadoria da van, das mesas e abre o cofre. Só na primeira volta, dá uns dez mil. "
 "Passo três: joga as bolsas no porta-malas da caminhonete do Jason. Tem que ser o carro dele, ou da Lucia. Em outro carro, as bolsas somem. "
 "Passo quatro: salva o jogo na mão, salvamento automático não vale, e carrega esse mesmo save. O Jason acorda em casa… e as bolsas continuam no porta-malas. "
 "Passo cinco: volta no galpão. Parte da mercadoria nasceu de novo. Pega, porta-malas, salva, carrega. E repete. Cabe até quatro bolsas no porta-malas. "
 "Passo seis: leva tudo no depósito do Brian, no sudoeste de Key Lento. A senha é 7700. O dinheiro cai depois, na caixa de correio do Jason. "
 "Como eu prometi, o detalhe: tem coisa na história que pode fazer o Jason perder o dinheiro guardado. Então não junta: gasta. Arma, carro, roupa. E faz logo, antes da Rockstar corrigir. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: usava o glitch ou jogava limpo? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("david","davy").replace("vicedale","vicedale").replace("pier","píer").replace("saia","saía")
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
