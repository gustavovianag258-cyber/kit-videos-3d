"""Trata as falas do roteiro v4 do alerta (parte 1). Tudo local, sem gastar crédito.

Uso: python scripts/vozes-alerta4.py
Entrada: public/alerta/voz4/*.wav (44,1 kHz mono). Saída: public/alerta/voz4/final/*.wav + duracoes.json
  - apara silêncio das pontas de todas
  - 03 (áudio do Rafa no WhatsApp): alto-falante de celular
  - 11 (Rafa lá fora): abafado pelo vidro
  - 14 e 17 (Rafa depois de olhar pro céu): voz robótica
  - msg-robo: o 14 robótico + alto-falante (o "outro áudio" que chega na cena 5)
  - coro: 19a + 19b + 17, robóticos, sobrepostos com eco (as sombras)
"""
import json
import os
import wave

import numpy as np

P = "public/alerta/voz4"
S = f"{P}/final"
os.makedirs(S, exist_ok=True)
SR = 44100


def ler(n):
    with wave.open(f"{P}/{n}.wav") as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def gravar(n, a):
    a = a / max(1e-6, np.abs(a).max()) * 0.89
    with wave.open(f"{S}/{n}.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    return round(len(a) / SR, 2)


def aparar(a):
    n = int(SR * 0.01)
    e = np.array([np.sqrt(np.mean(a[k : k + n] ** 2) + 1e-12) for k in range(0, len(a) - n, n)])
    voz = np.where(e > max(e.max() * 0.03, 0.004))[0]
    if len(voz) == 0:
        return a
    b = a[max(0, voz[0] * n - int(0.04 * SR)) : min(len(a), (voz[-1] + 1) * n + int(0.15 * SR))].copy()
    f = int(0.01 * SR)
    b[:f] *= np.linspace(0, 1, f)
    b[-f:] *= np.linspace(1, 0, f)
    return b


def faixa(a, lo, hi):
    A = np.fft.rfft(a)
    f = np.fft.rfftfreq(len(a), 1 / SR)
    A[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(A, len(a)).astype(np.float32)


def celular(a):
    b = faixa(a, 320, 3300)
    return np.tanh(b / max(1e-6, np.abs(b).max()) * 2.2) * 0.8


def vidro(a):
    return faixa(a, 60, 1100) * 1.4


def reamostra(a, k):
    """muda o tom (k < 1 = mais grave e mais lento)"""
    idx = np.arange(0, len(a) - 1, k)
    return np.interp(idx, np.arange(len(a)), a).astype(np.float32)


def robo(a):
    t = np.arange(len(a)) / SR
    metal = a * (0.6 + 0.4 * np.sin(2 * np.pi * 48 * t))  # modulação metálica
    grave = reamostra(a, 0.86)[: len(a)]  # cópia mais grave por baixo
    grave = np.pad(grave, (0, len(a) - len(grave)))
    y = metal * 0.8 + grave * 0.55
    d = int(0.0065 * SR)  # ressonância curta (pente) = timbre "de máquina"
    out = y.copy()
    for i in range(d, len(out)):
        out[i] += out[i - d] * 0.45
    return out


def eco(a, atrasos=((0.11, 0.35), (0.23, 0.22), (0.41, 0.12))):
    out = np.zeros(len(a) + int(SR * 0.6), np.float32)
    out[: len(a)] += a
    for t, g in atrasos:
        k = int(t * SR)
        out[k : k + len(a)] += a * g
    return out


dur = {}
nomes = sorted(f[:-4] for f in os.listdir(P) if f.endswith(".wav"))
for n in nomes:
    a = aparar(ler(n))
    if n.startswith("03"):
        a = celular(a)
    elif n.startswith("11"):
        a = vidro(a)
    elif n.startswith("14") or n.startswith("17"):
        a = robo(a)
    elif n.startswith("19"):
        continue
    dur[n] = gravar(n, a)

dur["msg-robo"] = gravar("msg-robo", celular(robo(aparar(ler("14-rafa-marmita")))))

# coro das sombras: três vozes robóticas desencontradas + eco
partes = [robo(aparar(ler("19a-coro"))), robo(aparar(ler("19b-coro"))), robo(aparar(ler("17-rafa-olha")))]
tam = max(len(p) for p in partes) + int(SR * 0.9)
coro = np.zeros(tam, np.float32)
for k, (p, off, g) in enumerate(zip(partes, (0.0, 0.35, 0.7), (1.0, 0.85, 0.7))):
    i = int(off * SR)
    coro[i : i + len(p)] += p / max(1e-6, np.abs(p).max()) * g
dur["coro"] = gravar("coro", eco(coro))

json.dump(dur, open(f"{S}/duracoes.json", "w"), indent=1)
for k, v in dur.items():
    print(f"{k:22s} {v:5.2f} s")
