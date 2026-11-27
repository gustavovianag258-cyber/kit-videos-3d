# Baixa sons de meme COMPLETOS do MyInstants (1º resultado da busca) para public/fase-extra/banco/sons/
# uso: python scripts/banco-sons.py
import re, subprocess, json, urllib.parse, urllib.request, imageio_ffmpeg, os
FF = imageio_ffmpeg.get_ffmpeg_exe()
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
DEST = "public/fase-extra/banco/sons"
os.makedirs(DEST, exist_ok=True)
# (arquivo, busca no myinstants, categoria, quando usar)
SONS = [
 # --- versões completas dos 18 virais que a gente já usa ---
 ("faah", "faahhh", "susto/fail", "erro feio, fail, \"não faz isso\""),
 ("taco-bell-bong", "taco bell bong", "revelação", "revelação absurda, virada"),
 ("cha-ching", "cha ching", "dinheiro", "dinheiro na tela, preço, venda"),
 ("erro-windows", "windows xp error", "erro/bug", "bug, glitch, deu ruim"),
 ("huh-gato", "huh cat", "confusão", "algo sem sentido, NPC esquisito"),
 ("rizz", "rizz sound effect", "flerte", "personagem dando em cima"),
 ("dexter-meme", "dexter meme", "ironia/tensão", "plano perfeito, vilania irônica"),
 ("minecraft-caverna", "minecraft cave sound", "mistério/susto", "coisa sinistra, mistério"),
 ("minecraft-dano", "minecraft damage", "dano", "soco, queda, bater o carro"),
 ("discord-notificacao", "discord notification", "notificação", "mensagem no celular"),
 ("ding", "ding sound effect", "acerto", "dica, check, acerto"),
 ("magic-reveal", "magic sparkle", "revelação", "segredo, easter egg"),
 ("whoosh", "whoosh", "transição", "troca de tela, passagem"),
 ("sino-boxe", "boxing bell", "desafio", "começo de briga, round 1"),
 ("peido", "fart", "zoeira", "piada escrachada (raramente)"),
 ("ahhh-alivio", "ahhh relief", "alívio", "finalmente, satisfatório"),
 ("click", "mouse click", "clique", "botão, menu, seleção"),
 ("core-impacto", "bass boom", "impacto", "título/número grande, impacto seco"),
 # --- memes parecidos (novos) ---
 ("vine-boom", "vine boom", "impacto", "revelação seca, olhar pra câmera"),
 ("bruh", "bruh", "decepção", "decepção, \"sério?\""),
 ("violino-triste", "sad violin", "tristeza", "perdeu tudo, momento triste irônico"),
 ("oh-no-no-no", "oh no no no no laugh", "fail", "algo dando muito errado"),
 ("emotional-damage", "emotional damage", "zoeira", "humilhação, tomou na cara"),
 ("cano-metal", "metal pipe falling", "impacto", "susto cômico, queda"),
 ("among-us-sus", "among us", "suspeita", "suspeito, traidor"),
 ("gta-wasted", "gta wasted", "GTA", "morreu, se ferrou"),
 ("gta-mission-passed", "gta mission passed", "GTA", "conseguiu, missão cumprida"),
 ("gta-sa-respect", "respect plus", "GTA", "respeito +, feito bonito"),
 ("anime-wow", "anime wow", "surpresa", "uau, coisa incrível"),
 ("nani", "nani", "surpresa", "o quê?!"),
 ("to-be-continued", "to be continued", "fecho", "corte no clímax, gancho"),
 ("suspense-dun-dun", "dun dun dunnn", "suspense", "revelação dramática"),
 ("x-files", "x files", "mistério", "teoria, conspiração, alien"),
 ("ba-dum-tss", "ba dum tss", "piada", "fecho de piada"),
 ("airhorn", "mlg air horn", "hype", "momento épico, hype"),
 ("bob-esponja-momentos-depois", "a few moments later", "tempo", "passagem de tempo"),
 ("erro-buzzer", "wrong answer buzzer", "erro", "resposta errada, não pode"),
 ("acerto-correct", "correct answer", "acerto", "resposta certa"),
 ("omg-wow", "omg wow", "surpresa", "reação de espanto"),
 ("hehe-boy", "hehe boy", "zoeira", "esperteza, malandragem"),
 ("spongebob-boowomp", "boowomp", "tristeza", "fail fofo, desânimo"),
 ("cricket", "crickets", "silêncio", "silêncio constrangedor"),
 ("caixa-registradora-dinheiro", "money", "dinheiro", "chuva de dinheiro"),
 ("explosao", "explosion meme", "impacto", "explosão cômica"),
 ("risada-sitcom", "sitcom laugh", "piada", "risada de plateia"),
 ("tome", "toma ratinho", "BR", "\"toma!\" (Ratinho), lacrou"),
 ("que-isso-meu-filho", "que isso meu filho calma", "BR", "calma, exagero"),
 ("cavalo", "cavalo", "BR", "zoeira, burrice (Faustão)"),
 ("ai-que-delicia", "ai que delicia cara", "BR", "coisa muito boa"),
 ("tururu", "tururu", "BR", "frustração, saiu errado"),
]
out = []
for arq, busca, cat, uso in SONS:
    try:
        url = "https://www.myinstants.com/en/search/?name=" + urllib.parse.quote(busca)
        html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read().decode("utf-8", "ignore")
        m = re.findall(r"play\('(/media/sounds/[^']+\.mp3)'", html)
        if not m:
            print("SEM RESULTADO", arq); continue
        mp3 = "https://www.myinstants.com" + m[0]
        dado = urllib.request.urlopen(urllib.request.Request(mp3, headers=UA), timeout=30).read()
        tmp = f"{DEST}/{arq}.mp3"
        open(tmp, "wb").write(dado)
        # wav 48 kHz estéreo, pico -3 dBFS (só ganho)
        r = subprocess.run([FF, "-hide_banner", "-i", tmp, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
        pico = float(re.search(r"max_volume: (-?[\d.]+) dB", r).group(1))
        subprocess.run([FF, "-v", "error", "-y", "-i", tmp, "-af", f"volume={-3 - pico}dB", "-ar", "48000", "-ac", "2", f"{DEST}/{arq}.wav"], check=True)
        dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", subprocess.run([FF, "-i", f"{DEST}/{arq}.wav"], capture_output=True, text=True).stderr).group(3))
        os.remove(tmp)
        out.append({"arquivo": f"fase-extra/banco/sons/{arq}.wav", "nome": arq, "categoria": cat, "quando": uso, "duracao_s": round(dur, 2), "fonte": mp3})
        print(f"ok {arq:28s} {dur:5.2f}s  {m[0]}")
    except Exception as e:
        print("FALHOU", arq, e)
json.dump(out, open(f"{DEST}/sons.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "sons")
