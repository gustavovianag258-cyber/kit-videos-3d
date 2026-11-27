# Fase 45: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase44-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("O GTA 6 tem um portal secreto que te leva de volta pra Vice City de 2002. E eu vou te mostrar como abrir. "
 "No final você ganha a camisa do Tommy Vercetti e a moto dele. Mas é longo, então presta atenção. "
 "Começa na torre de rádio de Key Lento. Sobe até o topo, liga a chave de força e aperta o botão na parede. Vai tocar um som esquisito. "
 "Agora vem a parte chata: 12 subestações de energia espalhadas pelo mapa, na ordem, sem viagem rápida. Se usar, perde tudo. "
 "Em cada uma tem um painel com botões, e você aperta só um: D, A, W ou o ponto. A ordem e os lugares tão na tela. "
 "A galera da gringa diz que as pistas formam um código do Vice City antigo: “Life is passing me by”. "
 "Morrer pode, não reseta. Só não machuca ninguém, que aí a polícia fica em uma estrela e você foge fácil. "
 "Na última, chega uma mensagem estranha. É a pista da usina T.H., e você só pode ir de noite, entre 7 da noite e 6 da manhã. "
 "A usina é cheia de segurança, mas tem uma porta do lado. Lá dentro, o reator 2 tá com esse portal. Puxa a alavanca da esquerda. "
 "E pronto: você tá na Vice City antiga, com um gráfico de PlayStation 2, dentro da boate Malibu. "
 "Vai na sala do lado esquerdo do bar. Quem tá lá é o Kent Paul, do Vice City original, e ele volta junto com você pro GTA 6. "
 "Quando volta, a camisa do Tommy e a moto já são suas. E depois o Kent ainda te liga, perdido, perguntando onde é que ele tá. "
 "Você está na Fase Extra, e eu sou o Vyce. E aí: vai encarar as 12 subestações ou dá preguiça? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("tomy","tommy").replace("tome","tommy").replace("verset","vercetti").replace("viciss","vyce").replace("killento","key").replace("th","th").replace("está","tá").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
