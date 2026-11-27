# Corrige sons do banco que vieram errados: escolhe o 1º resultado cujo nome de arquivo contém a palavra-chave.
import re, subprocess, json, urllib.parse, urllib.request, imageio_ffmpeg, os
FF = imageio_ffmpeg.get_ffmpeg_exe(); UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
DEST = "public/fase-extra/banco/sons"
CORRIGE = [  # (arquivo, busca, palavra no nome do mp3, categoria, quando)
 ("bruh", "bruh", "bruh", "decepção", "decepção, \"sério?\""),
 ("core-impacto", "deep boom", "boom", "impacto", "título/número grande, impacto seco"),
 ("gta-sa-respect", "respect", "respect", "GTA", "respeito +, feito bonito"),
 ("to-be-continued", "to be continued", "continued", "fecho", "corte no clímax, gancho"),
 ("tome", "toma", "toma", "BR", "\"toma!\", lacrou"),
 ("cha-ching", "cha ching", "ching", "dinheiro", "dinheiro na tela, preço, venda"),
 ("tururu", "tururu", "tururu", "BR", "frustração, saiu errado"),
]
dados = json.load(open(f"{DEST}/sons.json", encoding="utf-8"))
for arq, busca, chave, cat, uso in CORRIGE:
    html = urllib.request.urlopen(urllib.request.Request("https://www.myinstants.com/en/search/?name=" + urllib.parse.quote(busca), headers=UA), timeout=20).read().decode("utf-8", "ignore")
    m = [x for x in re.findall(r"play\('(/media/sounds/[^']+\.mp3)'", html) if chave in x.lower()]
    dados = [d for d in dados if d["nome"] != arq]
    if os.path.exists(f"{DEST}/{arq}.wav"): os.remove(f"{DEST}/{arq}.wav")
    if not m:
        print("tirei (não achei certo):", arq); continue
    mp3 = "https://www.myinstants.com" + m[0]
    open(f"{DEST}/{arq}.mp3", "wb").write(urllib.request.urlopen(urllib.request.Request(mp3, headers=UA), timeout=30).read())
    r = subprocess.run([FF, "-hide_banner", "-i", f"{DEST}/{arq}.mp3", "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    pico = float(re.search(r"max_volume: (-?[\d.]+) dB", r).group(1))
    subprocess.run([FF, "-v", "error", "-y", "-i", f"{DEST}/{arq}.mp3", "-af", f"volume={-3 - pico}dB", "-ar", "48000", "-ac", "2", f"{DEST}/{arq}.wav"], check=True)
    os.remove(f"{DEST}/{arq}.mp3")
    dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", subprocess.run([FF, "-i", f"{DEST}/{arq}.wav"], capture_output=True, text=True).stderr).group(3))
    dados.append({"arquivo": f"fase-extra/banco/sons/{arq}.wav", "nome": arq, "categoria": cat, "quando": uso, "duracao_s": round(dur, 2), "fonte": mp3})
    print(f"ok {arq:20s} {dur:5.2f}s {m[0]}")
# o "ahhh" completo que veio era uma música de 10 s: fica o recorte do reel (sons/virais/ahhh.wav)
dados = [d for d in dados if d["nome"] != "ahhh-alivio"]
if os.path.exists(f"{DEST}/ahhh-alivio.wav"): os.remove(f"{DEST}/ahhh-alivio.wav")
dados.sort(key=lambda d: (d["categoria"], d["nome"]))
json.dump(dados, open(f"{DEST}/sons.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(dados), "sons no banco")
