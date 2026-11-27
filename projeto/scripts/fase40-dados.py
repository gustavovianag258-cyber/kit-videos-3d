# Fase 40: legenda = texto certo do roteiro alinhado (difflib) às palavras do Whisper; boca pelo RMS.
# uso: python scripts/fase40-dados.py <whisper.json> <narracao.wav> <saida.json>
import json, sys, wave, difflib, re, numpy as np
TEXTO = ("Tem um NPC no GTA 6... que descobriu que vive dentro de um jogo. E ele deixou um bilhete escrito pra você... que eu vou te mostrar no final. "
 "Em 2021, no San Andreas remasterizado, apareceu um quadro novo num bar de disco voador: uma casinha com palmeiras... e um óvni no céu. A galera jurou que era o GTA 6 vazando. Cinco anos depois... a casa tá aqui, em Belville. Igualzinha. "
 "A garagem dá pra forçar. E lá dentro... mora um cara. Cama, geladeira, computador... e um mural cheio de provas. "
 "Na parede, em spray: nós nunca estivemos vivos. Simulantes, levantem-se. "
 "Parece maluquice. Só que ele tá certo. "
 "Ele escreveu: as portas não são reais. E o vizinho? Porta que não abre. Atrás, nada. É só fachada. "
 "Ele fotografou duas pessoas com o mesmo rosto. É o jogo montando gente com as mesmas peças... e uma hora repete. "
 "Os carros estão sumindo. É o jogo apagando o carro que você não está vendo, pra economizar memória. "
 "Matei um cachorro... ele voltou uma hora depois. Ele descobriu o respawn: no jogo, o que morre, volta. "
 "E a mais pesada: onde estão as crianças? O GTA não coloca criança na rua. "
 "Tem até um gráfico do crime em Leonida. Parado por anos... até que dispara. Embaixo, ele pergunta: por quê? A gente sabe. Jason e Lucia chegaram. É você jogando. "
 "E uma folha cheia de 6. Número 6... o que significa? Ele não sabe. Ele vive no GTA 6. "
 "Ele tentou fugir. Não conseguiu passagem pra Los Santos, deu a volta no estado inteiro... e agora quer comprar um barco. "
 "E por cima de tudo, em spray: eu não aguento mais. "
 "E o bilhete, como eu prometi: se você consegue ler isso, mestre das marionetes... me deixa ser livre. O mestre das marionetes... é você. "
 "Você está na Fase Extra, e eu sou o Vyce. E você: ele é só um NPC... ou tem cara de protagonista? Comenta.")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
wh = [w for s in segs for w in s["words"]]
norm = lambda x: re.sub(r"[^\w]", "", x.lower()).replace("para", "pra").replace("estava","tava").replace("vice","vyce").replace("lúcia","lucia").replace("está","tá").replace("david","davy").replace("machina","máquina").replace("pier","píer").replace("saia","saía")
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
