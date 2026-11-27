# Fase 04: troca SÓ a música, sem renderizar a imagem de novo.
# novo = áudio do render aprovado - trilha antiga * DUCK + trilha nova * DUCK
# (voz e efeitos ficam exatamente como no render; DUCK igual ao do Video.tsx: 0,42 sob a voz, suavizado ±6 quadros)
# uso: python scripts/fase04-trocar-musica.py <audio_do_render.wav> <trilha_antiga.wav> <trilha_nova.wav> <saida.wav>
import json, sys, wave
import numpy as np

FPS, SR = 30, 48000
d = json.load(open("src/pagina-games/fase04/dados.json", encoding="utf-8"))
PAL = d["palavras"]


def ler(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR and w.getnchannels() == 2, p
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32768


def falando(t):
    return any(p["s"] - 0.04 <= t <= p["e"] + 0.04 for p in PAL)


base = ler(sys.argv[1])
N = len(base)
NQ = int(np.ceil(N / SR * FPS))
bruto = np.array([0.42 if falando(i / FPS) else 1.0 for i in range(NQ)])
duck = np.array([bruto[max(0, i - 6): i + 7].mean() for i in range(NQ)])
ganho = np.repeat(duck, SR // FPS)[:N][:, None]


def trilha(p):
    m = ler(p)
    out = np.zeros((N, 2), np.float32)
    out[: min(N, len(m))] = m[:N]
    return out


novo = base + ganho * (trilha(sys.argv[3]) - trilha(sys.argv[2]))
with wave.open(sys.argv[4], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(novo, -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", round(N / SR, 2), "s")
