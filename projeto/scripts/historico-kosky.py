# Corte "HISTÓRICO" (kosky, primeiro brasileiro a sofrer um bug no GTA 6).
# Emenda trechos da live + o bug dele (do compilado @ClipOverdose, que veio da própria live) num vídeo 1920x1080,
# áudio da live a -14 LUFS, e gera src/cortes/kosky/historico.json (trechos, recortes e legendas).
# Uso: python scripts/historico-kosky.py   (-l refaz só o json)
import json, os, subprocess, sys, glob
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
LIVE = sorted(glob.glob("live/kosky/live-*.mp4"))[-1]
COMP = "public/fase-extra/fase19/x/ClipOverdose.mp4"
OUT = "public/cortes/kosky/historico.mp4"
JS = "src/cortes/kosky/historico.json"

DESK = {"x": 0, "y": 126, "w": 456, "h": 256}  # câmera dele com o navegador aberto
MEIO = {"x": 0, "y": 318, "w": 456, "h": 256}  # câmera dele durante o jogo
JOGO = {"x": 460, "y": 100, "w": 1120, "h": 944}  # jogo sem câmera e sem chat
TWEET = {"x": 680, "y": 60, "w": 460, "h": 1000}  # coluna do post no X
POST10 = {"x": 400, "y": 110, "w": 680, "h": 880}  # o post das "10 e 20"
CAM_COMP = {"x": 0, "y": 0, "w": 450, "h": 252}  # câmera dele dentro do clipe do compilado
JOGO_COMP = {"x": 240, "y": 60, "w": 1440, "h": 1020}

# (cena, fonte, início, fim, câmera, tela, legendas [(ini, fim, texto)] com * = destaque, b-roll)
# b-roll = (fonte, início): a tela de baixo mostra outro trecho (gameplay em movimento) no lugar do navegador parado.
TRECHOS = [
    ("abre", LIVE, 22024.75, 22028.5, DESK, JOGO_COMP, [
        (22024.84, 22027.26, "Eu sou o *primeiro *brasileiro a sofrer um *bug no GTA 6,"),
        (22027.32, 22028.42, "no *GTA 6!")], (COMP, 18.0)),
    ("historico1", LIVE, 20115.6, 20116.95, MEIO, JOGO, [
        (20115.8, 20116.9, "Caralho, *histórico!")], None),
    ("coroa", LIVE, 22018.0, 22024.3, DESK, JOGO, [
        (22018.0, 22019.28, "Já fui *coroado, mano!"),
        (22020.3, 22024.24, "Mano, eu preciso ir em *entrevista, em *palestras, cara!")], (LIVE, 17330.0)),
    ("arquivo", COMP, 24.9, 31.1, CAM_COMP, JOGO_COMP, [
        (25.0, 27.0, "Ixi, *véi! Ixi, *mano!"),
        (30.4, 31.05, "*Nããão!")], None),
    ("placa", LIVE, 22028.85, 22035.0, DESK, JOGO, [
        (22028.9, 22030.88, "A gente tá falando do jogo *antológico, cara!"),
        (22031.24, 22032.42, "Eu fui o *pioneiro!"),
        (22033.1, 22034.96, "Eu quero dar *palestra, pai!")], (LIVE, 18440.0)),
    ("livro", LIVE, 19560.6, 19568.5, MEIO, JOGO, [
        (19560.6, 19562.0, "O *primeiro *brasileiro da *história."),
        (19562.44, 19564.44, "O GTA 6 é só *um, né?"),
        (19564.78, 19568.42, "Então o primeiro brasileiro da história vê um *bug no GTA 6.")], None),
    ("seta", LIVE, 13989.0, 13994.1, MEIO, JOGO, [
        (13989.07, 13990.67, "Outra coisa que eu posso ser *pioneiro:"),
        (13991.03, 13994.05, "eu posso ser o primeiro cara a usar *seta no *Brasil, velho.")], None),
    ("horario", LIVE, 22290.6, 22295.05, DESK, JOGO, [
        (22290.62, 22293.32, "Mas eu quero que me *desminta o *horário."),
        (22293.66, 22295.02, "*10 e *20 postado.")], (LIVE, 20000.0)),
    ("mantido", LIVE, 22296.7, 22298.5, DESK, JOGO, [
        (22296.8, 22298.4, "Quero continuar com o *título, velho.")], (LIVE, 20004.45)),
    ("brisa1", LIVE, 22180.0, 22181.15, DESK, JOGO, [
        (22180.06, 22181.1, "É um bagulho pra *sempre, mano!")], (LIVE, 13996.0)),
    ("brisa2", LIVE, 22189.6, 22190.9, DESK, JOGO, [
        (22189.77, 22190.85, "*Histórico, mano, geral.")], (LIVE, 13997.15)),
    ("voltou", LIVE, 25720.75, 25723.3, MEIO, JOGO, [
        (25720.8, 25723.24, "O *primeiro *BR voltou! Gostei, gostei.")], None),
    ("maisum", LIVE, 25729.0, 25735.85, MEIO, JOGO, [
        (25729.16, 25731.14, "Nossa, mano! *Mais *um!"),
        (25732.16, 25733.56, "Mais um, pia!"),
        (25734.7, 25735.76, "O jogo tá *quebrado!")], None),
]


def legendas():
    out, off = [], 0.0
    for _, _, a, b, _, _, blocos, _ in TRECHOS:
        for x, y, txt in blocos:
            de, ate = off + max(0, x - a), off + min(y, b) - a
            ws = txt.split()
            pesos = [len(w.strip("*")) + 2 for w in ws]
            tot, acc, pal = sum(pesos), 0, []
            for w, p in zip(ws, pesos):
                pal.append({"t": w.strip("*"), "s": round(de + (ate - de) * acc / tot, 3), "d": w.startswith("*")})
                acc += p
            grupos, g = [], []  # no máximo 3 palavras (~18 letras) por vez
            for q in pal:
                if g and (len(g) >= 3 or sum(len(z["t"]) + 1 for z in g) + len(q["t"]) > 18):
                    grupos.append(g)
                    g = []
                g.append(q)
            grupos.append(g)
            for i, g in enumerate(grupos):
                ini = de if i == 0 else g[0]["s"]
                fim = grupos[i + 1][0]["s"] if i + 1 < len(grupos) else max(ate, de + 0.6)
                out.append({"de": round(ini, 3), "ate": round(fim, 3), "palavras": g})
        off += b - a
    for i in range(len(out) - 1):
        out[i]["ate"] = min(out[i]["ate"], out[i + 1]["de"])
    return out


def cortar():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    tmp, tmpb = [], []
    for i, (_, fonte, a, b, _c, _t, _l, broll) in enumerate(TRECHOS):
        bf, ba = broll if broll else (fonte, a)
        pb = f"public/cortes/kosky/_b{i}.mkv"
        subprocess.run([FF, "-v", "error", "-y", "-ss", str(ba), "-i", bf, "-t", f"{b - a:.3f}", "-vf", "scale=1920:1080:flags=lanczos,fps=30,setsar=1", "-an",
                        "-fps_mode", "cfr", "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", pb], check=True)
        tmpb.append(pb)
        p = f"public/cortes/kosky/_h{i}.mp4"
        vf = "scale=1920:1080:flags=lanczos,fps=30,setsar=1"
        af = f"aresample=48000,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.04:.3f}:d=0.04"
        subprocess.run([FF, "-v", "error", "-y", "-ss", str(a), "-i", fonte, "-t", f"{b - a:.3f}", "-vf", vf, "-af", af, "-ac", "2", "-fps_mode", "cfr", "-r", "30",
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", p.replace(".mp4", ".mkv")], check=True)
        tmp.append(p.replace(".mp4", ".mkv"))
    ins = sum([["-i", p] for p in tmp], [])
    pre = "".join(f"[{i}:v]setpts=PTS-STARTPTS[v{i}];[{i}:a]asetpts=PTS-STARTPTS[a{i}];" for i in range(len(tmp)))
    fc = pre + "".join(f"[v{i}][a{i}]" for i in range(len(tmp))) + f"concat=n={len(tmp)}:v=1:a=1[v][a0];[a0]loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    subprocess.run([FF, "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast",
                    "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-fps_mode", "cfr", "-r", "30", OUT], check=True)
    insb = sum([["-i", p] for p in tmpb], [])
    fcb = "".join(f"[{i}:v]setpts=PTS-STARTPTS[v{i}];" for i in range(len(tmpb))) + "".join(f"[v{i}]" for i in range(len(tmpb))) + f"concat=n={len(tmpb)}:v=1:a=0[v]"
    subprocess.run([FF, "-v", "error", "-y", *insb, "-filter_complex", fcb, "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
                    "-pix_fmt", "yuv420p", "-fps_mode", "cfr", "-r", "30", OUT.replace(".mp4", "-broll.mp4")], check=True)
    for p in tmpb:
        os.remove(p)
    for p in tmp:
        print(p, subprocess.run([FF, "-i", p], capture_output=True, text=True).stderr.split("Duration: ")[1][:11])
        os.remove(p)


if "-l" not in sys.argv:
    cortar()
cenas, off = [], 0.0
for cena, _, a, b, cam, tela, _, broll in TRECHOS:
    cenas.append({"cena": cena, "de": round(off, 3), "ate": round(off + b - a, 3), "cam": cam, "tela": tela, "broll": bool(broll)})
    off += b - a
json.dump({"segundos": round(off, 3), "cenas": cenas, "legendas": legendas()}, open(JS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(round(off, 2), "s,", len(cenas), "cenas")
