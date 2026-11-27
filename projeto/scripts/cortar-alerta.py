"""Corta as falas do vídeo do alerta (parte 1) no ponto mais silencioso e apara o silêncio das pontas.

Uso: python scripts/cortar-alerta.py
Lê public/alerta/voz/*.wav (44,1 kHz mono) e grava public/alerta/voz/cortes/*.wav + duracoes.json.
"""
import json
import os
import wave

import numpy as np

PASTA = "public/alerta/voz"
SAIDA = f"{PASTA}/cortes"
os.makedirs(SAIDA, exist_ok=True)

# arquivo → lista de (nome do corte, início da janela de busca do corte, fim da janela) ;
# sem cortes = só aparar. "fim" corta o resto fora (repetição indesejada).
PLANO = {
    "rafa-teste": [("rafa-abre", None), ("rafa-bem", (2.7, 3.5))],
    "thais-teste": [("thais-ceu", None), ("thais-rafa", (2.2, 2.7))],
    "n-morrer": [("n-morrer1", None), ("n-morrer2", (2.3, 3.4))],
    "n-mensagem": [("n-msg1", None), ("n-msg2", (2.1, 2.9))],
    "jair-teste": [("jair", None), ("descarte", (1.5, 2.3))],
    "n-pergunta": [("n-pergunta", None)],
    "n-domingo": [("n-domingo", None)],
    "n-segundo": [("n-segundo", None)],
    "n-escolha": [("n-escolha", None)],
    "cliente-vai": [("cliente-vai", None)],
    "thais-bem": [("thais-bem", None)],
    "neide-porta": [("neide-porta", None)],
    "beto-piscou": [("beto-piscou", None)],
}


def ler(p):
    with wave.open(p) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a, sr


def gravar(p, a, sr):
    with wave.open(p, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def energia(a, sr, j=0.01):
    n = int(sr * j)
    return np.array([np.sqrt(np.mean(a[k : k + n] ** 2) + 1e-12) for k in range(0, len(a) - n, n)]), n


def aparar(a, sr):
    e, n = energia(a, sr)
    lim = max(e.max() * 0.03, 0.004)
    voz = np.where(e > lim)[0]
    if len(voz) == 0:
        return a
    i0 = max(0, voz[0] * n - int(0.04 * sr))
    i1 = min(len(a), (voz[-1] + 1) * n + int(0.12 * sr))
    b = a[i0:i1].copy()
    f = int(0.01 * sr)  # rampinha para não estalar
    b[:f] *= np.linspace(0, 1, f)
    b[-f:] *= np.linspace(1, 0, f)
    return b


dur = {}
for arq, cortes in PLANO.items():
    a, sr = ler(f"{PASTA}/{arq}.wav")
    pontos = [0]
    for nome, janela in cortes[1:]:
        e, n = energia(a, sr, 0.05)
        k0, k1 = int(janela[0] / 0.05), int(janela[1] / 0.05)
        k = k0 + int(np.argmin(e[k0:k1]))
        pontos.append(k * n + n // 2)
    pontos.append(len(a))
    for (nome, _), i0, i1 in zip(cortes, pontos[:-1], pontos[1:]):
        if nome == "descarte":
            continue
        b = aparar(a[i0:i1], sr)
        gravar(f"{SAIDA}/{nome}.wav", b, sr)
        dur[nome] = round(len(b) / sr, 2)
json.dump(dur, open(f"{SAIDA}/duracoes.json", "w"), indent=1)
for k, v in dur.items():
    print(f"{k:12s} {v:5.2f} s")
