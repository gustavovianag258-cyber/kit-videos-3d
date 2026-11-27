# Gera public/fase-extra/banco/CATALOGO.md (o índice do banco de sons, músicas e memes) a partir dos JSONs e das pastas.
# uso: python scripts/banco-catalogo.py
import json, os, re, subprocess, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
B = "public/fase-extra"


def dur(p):
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", subprocess.run([FF, "-i", p], capture_output=True, text=True).stderr)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else 0


def mmss(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


sons = json.load(open(f"{B}/banco/sons/sons.json", encoding="utf-8"))
memes = json.load(open(f"{B}/banco/memes/memes.json", encoding="utf-8"))

# memes de reação (1 quadro, servem como "inserto" no meio do vídeo) e o momento certo de cada um
REACAO = {
    "Surprised Pikachu": "surpresa óbvia (\"quem diria\")",
    "This Is Fine": "tudo pegando fogo e o cara tranquilo",
    "Hide the Pain Harold": "sorriso de dor, deu ruim mas tá tudo bem",
    "Disaster Girl": "causou o caos e saiu de boa",
    "Roll Safe Think About It": "\"plano genial\" (que não é)",
    "Monkey Puppet": "olhar desconfiado, constrangimento",
    "Sad Pablo Escobar": "esperando, solidão, nada acontece",
    "Waiting Skeleton": "esperando muito (GTA 6, chapter 3…)",
    "Is This A Pigeon": "confundiu tudo",
    "Laughing Leo": "rindo da cara de alguém",
    "Leonardo Dicaprio Cheers": "brinde, conquista",
    "Futurama Fry": "desconfiado, \"não sei se…\"",
    "Third World Skeptical Kid": "desconfiança total",
    "Megamind peeking": "\"no bitches?\"/espiando",
    "Absolute Cinema": "momento épico, cinema",
    "They're The Same Picture": "duas coisas iguais (carros, NPCs repetidos)",
    "Mocking Spongebob": "zoando o que alguém disse",
    "Squidward window": "olhando os outros se divertirem",
    "Evil Kermit": "a voz da tentação (roubar o carro)",
    "Bike Fall": "se sabotou sozinho",
    "Grim Reaper Knocking Door": "um por um, todos caindo",
    "Inhaling Seagull": "grito crescente",
    "Spider Man Triple": "três iguais, apontando",
    "spiderman pointing at spiderman": "dois iguais se apontando (sósias!)",
    "Ancient Aliens": "\"aliens\" (teorias, mistério)",
    "Charlie Conspiracy (Always Sunny in Philidelphia)": "teoria da conspiração (mural com linha vermelha)",
    "Scooby doo mask reveal": "revelação de quem era de verdade",
    "Drake Hotline Bling": "não × sim (comparação)",
    "Two Buttons": "escolha difícil",
    "Distracted Boyfriend": "trocando o certo pelo novo",
    "Gru's Plan": "plano que dá errado no fim",
    "Expanding Brain": "nível de genialidade crescente",
    "Panik Kalm Panik": "pânico, calma, pânico",
    "Buff Doge vs. Cheems": "antes forte × agora fraco (GTA 5 × GTA 6)",
    "Bell Curve": "o burro e o gênio concordam",
    "Woman Yelling At Cat": "discussão",
    "Batman Slapping Robin": "cala a boca, tapa",
    "Pawn Stars Best I Can Do": "oferta baixa, regateio",
    "Trade Offer": "proposta de troca",
    "Flex Tape": "gambiarra pra esconder o problema",
    "Clown Applying Makeup": "se fazendo de palhaço aos poucos",
    "Anime Girl Hiding from Terminator": "se escondendo da polícia",
    "Sleeping Shaq": "dormindo × acordando ligado",
    "Tuxedo Winnie The Pooh": "versão normal × versão chique",
}

L = []
L.append("# Banco da Fase Extra — sons, músicas e memes\n")
L.append("Pedido do usuário (22/11/2026): juntar num lugar só os efeitos sonoros e as músicas **completos**, mais sons de meme parecidos e **imagens de meme** pra colocar no meio dos vídeos. Ele liberou usar sem se preocupar com direitos; mesmo assim, as músicas de gravadora grande continuam fora (podem silenciar o vídeo).\n")
L.append("Tudo dentro de `public/fase-extra/` (use `staticFile(\"fase-extra/…\")`). No bundle leve, copie/faça hardlink só dos arquivos que o vídeo usa.\n")
L.append("Atualizar: `python scripts/banco-sons.py` (baixa de novo), `python scripts/banco-sons-corrige.py` (troca os que vieram errados), `python scripts/banco-memes.py`, `python scripts/banco-catalogo.py` (refaz este arquivo).\n")

L.append("\n## 1. Efeitos sonoros\n")
L.append("### 1a. Recortes curtos já testados nos vídeos (`sons/virais/`)\n")
L.append("Os 18 cortados dos reels que o usuário mandou (pico -3 dBFS, já no ponto certo). **Prefira estes nos vídeos**: são curtos e entram no quadro exato. Lista e regras na habilidade `efeitos-virais`.\n")
for f in sorted(os.listdir(f"{B}/sons/virais")):
    if f.endswith(".wav"):
        L.append(f"- `sons/virais/{f}` ({dur(f'{B}/sons/virais/{f}'):.2f} s)")
L.append("\n### 1b. Versões completas e sons de meme parecidos (`banco/sons/`)\n")
L.append("Baixados do MyInstants (versão inteira), 48 kHz estéreo, pico -3 dBFS. Os longos (Dexter, X-Files, To Be Continued, sitcom…) devem ser cortados com `durationInFrames`/`startFrom`.\n")
L.append("| Arquivo | Duração | Categoria | Quando usar |")
L.append("|---|---|---|---|")
for s in sorted(sons, key=lambda d: (d["categoria"], d["nome"])):
    L.append(f"| `banco/sons/{s['nome']}.wav` | {s['duracao_s']:.1f} s | {s['categoria']} | {s['quando']} |")

L.append("\n## 2. Músicas\n")
L.append("### 2a. Liberadas pelo usuário — completas (`musicas-liberadas/completas/`)\n")
L.append("Artistas independentes (do reel @ogarciaaxis). Uma por vídeo, como trilha a 0,12 × DUCK. Trechos curtos (\"carimbo\" de vibe) em `musicas-liberadas/*.wav`.\n")
for f in sorted(os.listdir(f"{B}/musicas-liberadas/completas")):
    L.append(f"- `musicas-liberadas/completas/{f}` ({mmss(dur(f'{B}/musicas-liberadas/completas/{f}'))})")
L.append("\n### 2b. Mixkit — completas, sem risco de direitos (`musicas-mixkit/`)\n")
L.append("Normalizar a -26 LUFS na hora de virar `trilha.wav` (como nas Fases). Vibes na habilidade `efeitos-virais`.\n")
VIBE = {
    "driving-ambition": "motivacional", "super-strong": "motivacional", "sleepy-cat": "cinemático/chill", "beautiful-dream": "cinemático/luxo",
    "ode-to-loneliness": "dramático", "silent-descent": "dramático", "fashion": "poderoso", "hip-hop-02": "poderoso",
    "staring-at-the-night-sky": "nostálgico", "forest-mist-whispers": "nostálgico", "shame": "misterioso/crime", "torn-threads": "misterioso",
    "funkee-monkeee": "caótico/divertido", "mi-gente": "caótico/divertido", "dark-shadows": "mistério (Fase 40)", "fright-night": "mistério (Fase 43)",
    "feedback-dreams": "mistério", "spirit-in-the-woods": "mistério", "delirium": "mistério/tensão", "sci-fi-score": "ficção científica",
    "greed": "crime/tensão", "sparta": "épico", "trap-electro-vibes": "trap", "cyberpunk-city": "eletrônico noturno", "trapanomics": "trap",
    "waka-floka-type": "trap pesado", "need-for-speed": "corrida",
}
for f in sorted(os.listdir(f"{B}/musicas-mixkit")):
    if f.endswith(".mp3"):
        n = f[:-4]
        L.append(f"- `musicas-mixkit/{f}` ({mmss(dur(f'{B}/musicas-mixkit/{f}'))}) — {VIBE.get(n, '')}")

L.append("\n## 3. Imagens de meme (`banco/memes/`)\n")
L.append("Os 98 memes mais usados do Imgflip (lista oficial `api.imgflip.com/get_memes`), na resolução original. Como usar no vídeo: **inserto rápido de 0,6–1,2 s** no meio da gameplay (pula com escala 0→1,15→1, borda branca, leve giro), no quadro exato da piada, junto com um som do banco. No máximo 1 meme a cada 10–15 s e nunca por cima de informação importante (mapa, nome de lugar).\n")
L.append("### Memes de reação (1 quadro — os melhores pra inserir)\n")
L.append("| Arquivo | Quando usar |")
L.append("|---|---|")
por_nome = {m["nome"]: m for m in memes}
for n, uso in REACAO.items():
    if n in por_nome:
        L.append(f"| `{por_nome[n]['arquivo'].replace('fase-extra/', '')}` | {uso} |")
L.append("\n### Todos (incluindo os de vários painéis, que precisam de texto nosso em português)\n")
for m in memes:
    L.append(f"- `{m['arquivo'].replace('fase-extra/', '')}` — {m['nome']} ({m['paineis']} painéis)")
L.append("\nCuidado: alguns memes falam de tragédia ou religião/política (ex.: \"Mother Ignoring Kid Drowning\", \"A train hitting a school bus\", \"Bugs bunny communist\"). Só usar se a piada for leve e não tiver vítima real; os de 11 de setembro foram tirados do banco.\n")

open(f"{B}/banco/CATALOGO.md", "w", encoding="utf-8").write("\n".join(L) + "\n")
print("ok", len(sons), "sons,", len(memes), "memes")
