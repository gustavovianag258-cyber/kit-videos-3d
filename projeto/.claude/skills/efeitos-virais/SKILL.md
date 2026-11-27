---
name: efeitos-virais
description: Biblioteca de efeitos sonoros virais (FAAH, taco bell bong, cha-ching, Windows error, huh, rizz, Dexter meme, Minecraft…) e músicas liberadas pelo usuário para os vídeos da Fase Extra (@faseextra.br) e do Mundo Paralelo. Use SEMPRE que for montar o som de um vídeo, colocar efeito numa piada, num número, numa virada, num "erro", num ganho de dinheiro ou num susto, ou quando o usuário pedir "efeito sonoro", "som viral", "entrar na onda" ou citar o nome de algum desses sons.
---

# Efeitos sonoros virais (e músicas liberadas)

Pedido do usuário (20/11/2026): "colocar como habilidade pra usar nos vídeos, às vezes pra encaixar, pra gente entrar na onda dos efeitos sonoros". Ele liberou baixar e usar esses áudios (sem se preocupar com direito autoral).

Fontes analisadas:
- Reel @suellensocialmediia "Tops sons que você procura e não acha" (Instagram DcWsGD4v9TP, 162 mil curtidas).
- Reel @hugosaadeditor "Efeitos Sonoros Virais pt 2" (Instagram DeEvOJ4s0Ge, 71 mil curtidas).

Os dois são listas de sons com o nome de cada um na linha do tempo. Cada som foi recortado nas pausas, com 30 ms antes e fade de 60 ms no fim, e normalizado para pico de -3 dBFS.

## Onde estão
`public/fase-extra/sons/virais/<nome>.wav` (48 kHz, estéreo). No bundle leve, faça hardlink da pasta `fase-extra/sons/virais` para o `--public-dir` (como já é feito com `fase-extra/sons`).

## Catálogo — o que é e quando encaixar

| Arquivo | Duração | O que é | Quando usar (Fase Extra) |
|---|---|---|---|
| `faah.wav` | 2,0 s | o "FAAAH" de quem se assusta/desaprova (meme) | erro feio, fail, "não faz isso", o Jason se ferrando |
| `core.wav` | 0,75 s | batida grave curta ("core") | entrada de título, número grande, impacto seco |
| `click.wav` | 0,25 s | clique de mouse/botão | apertar botão no menu, "salva o jogo", seleção, código digitado |
| `taco-bell-bong.wav` | 1,5 s | o "BONG" do Taco Bell (meme) | revelação absurda, virada inesperada, fecho de piada |
| `ding.wav` | 0,3 s | "ding" curto e agudo | dica, acerto, check, item da lista ✓ |
| `discord-notificacao.wav` | 0,85 s | notificação do Discord | mensagem/ligação no celular do jogo, "chegou o dinheiro" |
| `woosh.wav` | 0,55 s | passada de ar | troca de tela, carro passando, transição |
| `cha-ching-dinheiro.wav` | 0,9 s | caixa registradora "cha-ching" | dinheiro na tela, valor, venda, "$10 mil" |
| `magic-reveal.wav` | 0,9 s | brilho mágico de revelação | segredo revelado, easter egg, "olha isso" |
| `dexter-meme.wav` | 4,5 s | trilha do meme do Dexter (tensão/ironia) | "plano perfeito", vilania, momento sinistro irônico (usar trecho curto) |
| `rizz.wav` | 1,5 s | o "rizz" (galanteio, boing sedutor) | personagem dando em cima, NPC charmoso, flerte |
| `ahhh.wav` | 1,9 s | "ahhh" de alívio/prazer (meme) | alívio, "finalmente", algo muito satisfatório |
| `hit-minecraft.wav` | 0,2 s | dano do Minecraft ("uh") | soco, queda, levar dano, bater o carro |
| `peido.wav` | 1,5 s | peido (meme) | só em piada escrachada; usar raramente |
| `sino.wav` | 1,7 s | sino de luta/boxe | começo de briga, "round 1", desafio |
| `erro-windows.wav` | 0,9 s | erro do Windows | bug do jogo, glitch, "deu ruim", sistema recusando |
| `minecraft-caverna.wav` | 2,0 s | som assustador de caverna do Minecraft | mistério, susto, coisa sinistra no mato (Pé Grande, alien) |
| `huh.wav` | 0,5 s | o "huh?" confuso (meme do gato) | algo sem sentido, NPC esquisito, pergunta no ar |

Obs.: `ding` (4,54 s no reel) e `discord-notificacao` (4,92 s) foram separados pela ordem da linha do tempo; se soarem trocados, é só trocar os nomes.

## Regras de uso
- **Encaixar, sem deixar o vídeo calado (pedido de 25/11/2026, vale da Fase 47 em diante):** 1 meme sonoro a cada 6–8 s, só nos momentos certos (piada, número, virada, erro, revelação), sem repetir. **Sem whoosh/pop automático em toda troca de tela** (ele acha estranho). Junto com isso, o som do próprio jogo por baixo da voz (baixo), subindo quando o Vyce para e alto nos momentos fortes, só em trechos sem a voz do criador do vídeo base. Música da trilha ~0,2 × DUCK.
- **Nunca por cima de palavra importante:** entra na pausa da voz ou logo depois da palavra-chave (use as âncoras `em("palavra")` do código). Nunca cobrir a voz.
- **Volume:** efeitos virais entre 0,15 e 0,35 no `<Audio volume>` (a voz é 1,0; a música fica em ~0,2 × DUCK). Sons longos (dexter-meme, minecraft-caverna, faah) a 0,15–0,2 e cortados com `durationInFrames`.
- **Quadro exato:** o som entra no mesmo quadro da coisa na tela (título que pula, dinheiro que aparece, soco).
- **Não repetir o mesmo meme duas vezes no vídeo.**
- **Peido e Dexter:** só quando a pauta for de zoeira (tipo Fase 14). Em vídeo de guia/passo a passo, preferir click, ding, cha-ching, woosh, erro-windows, magic-reveal.

## Exemplo no Remotion
```tsx
<Sequence from={Math.round((em("mil") - 0.05) * FPS)} durationInFrames={45}>
  <Audio src={staticFile("fase-extra/sons/virais/cha-ching-dinheiro.wav")} volume={0.25} />
</Sequence>
```

## Músicas liberadas pelo usuário
Fonte: reel @ogarciaaxis "Meus áudios virais mais usados separados por vibe" (Instagram Dd9DrjvRuwt), 7 músicas. **Regra do usuário (20/11/2026): não usar música que pode dar aviso de direitos ou ser silenciada.** Por isso ficaram só as 3 de artistas independentes; as 4 de gravadora grande (Runaway/Kanye West, Timeless/The Weeknd & Playboi Carti, Lost in the Fire/Gesaffelstein & The Weeknd, Without Me/Eminem) foram apagadas e NÃO entram nos vídeos.

| Vibe | Música | Trecho curto (~3–4 s) | Completa (mp3, -26 LUFS) | Trecho viral começa em | Quando usar |
|---|---|---|---|---|---|
| motivacional | Now or Never – TKANDZ | `musicas-liberadas/now-or-never_motivacional.wav` | `musicas-liberadas/completas/now-or-never_tkandz_motivacional.mp3` (2:04) | 0,1 s | abertura de "dá pra pegar/fazer…", virada pra cima, conquista |
| cinemático | A Good Man With a Broken Heart – LoVibe. | `musicas-liberadas/good-man-with-a-broken-heart_cinematico.wav` | `musicas-liberadas/completas/good-man-with-a-broken-heart_lovibe_cinematico.mp3` (1:59) | 14,7 s | paisagem de Leonida, estrada ao pôr do sol, momento bonito |
| nostálgico | Snowfall – Øneheart x reidenshi | `musicas-liberadas/snowfall_nostalgico.wav` | `musicas-liberadas/completas/snowfall_oneheart-reidenshi_nostalgico.mp3` (2:03) | 28,9 s | homenagem a GTA antigo (Michael, San Andreas), mistério calmo |

Caminhos dentro de `public/fase-extra/`. As completas foram conferidas com o trecho do reel (cromagrama, acerto ≥ 0,93).

Como usar:
- **Completa como trilha de fundo:** no lugar da música do Mixkit, no mesmo nível (0,12 × DUCK sob a voz), com `startFrom` no trecho viral ou na parte instrumental. As três são quase instrumentais.
- **Trecho curto como "carimbo" de vibe:** num momento só (abertura, virada ou fecho), abaixando a trilha e tocando o trecho a 0,25–0,4.
- Uma por vídeo. Mesmo sendo de artistas independentes, faixas distribuídas em loja podem, raramente, ser reconhecidas pelo app; se algum vídeo receber aviso, avisar o usuário e trocar por música do Mixkit.

### Parecidas, sem risco de direitos (Mixkit)
Pedido dele (20/11/2026): "procurar algumas parecidas com essas". Todas do Mixkit (licença livre, não são reconhecidas pelos apps), em `public/fase-extra/musicas-mixkit/` (mp3 original; normalizar a -26 LUFS na hora de virar `trilha.wav`, como nas Fases). Duas por vibe, escolhidas pelo gênero e pelo clima parecidos com a música viral daquela vibe:

| Vibe | Parecida com | Arquivos (Mixkit nº) | Clima |
|---|---|---|---|
| motivacional | Now or Never | `driving-ambition.mp3` (32) · `super-strong.mp3` (1010) | trilha que sobe, esperançosa · EDM confiante de treino |
| cinemático | Good Man With a Broken Heart | `sleepy-cat.mp3` (135) · `beautiful-dream.mp3` (493) | downtempo/chill noturno · jazz melancólico com violão |
| dramático | Runaway (Kanye) | `ode-to-loneliness.mp3` (520) · `silent-descent.mp3` (614) | piano dramático e misterioso · piano e cordas tristes |
| poderoso | Timeless (The Weeknd) | `fashion.mp3` (228) · `hip-hop-02.mp3` (738) | R&B contemporâneo confiante · hip hop/R&B de cidade |
| nostálgico | Snowfall | `staring-at-the-night-sky.mp3` (168) · `forest-mist-whispers.mp3` (148) | cello e piano atmosféricos · ambiente esperançoso |
| misterioso | Lost in the Fire | `shame.mp3` (553) · `torn-threads.mp3` (73) | eletrônica sombria de crime/cidade · eletrônica misteriosa com batida |
| caótico | Without Me (Eminem) | `funkee-monkeee.mp3` (1140) · `mi-gente.mp3` (284) | funk/disco confiante e bagunçado · reggaeton divertido |

Já usadas em Fases (variar): Greed, Sparta, Trap Electro Vibes, Cyberpunk City, Trapanomics, Waka Floka Type, Tapis, Sci-Fi Score, My Last Mojito.

## Banco completo (sons, músicas e MEMES) — desde 22/11/2026
Pedido do usuário: "pega eles completos… uma base de dados com os efeitos sonoros, as músicas… sons parecidos, uma espécie de meme… e até imagens de meme pra colocar no meio dos vídeos".
**Índice: `public/fase-extra/banco/CATALOGO.md`** (gerado por `python scripts/banco-catalogo.py`).
- `banco/sons/*.wav` — 47 sons de meme COMPLETOS (MyInstants): as versões inteiras dos virais + parecidos (vine boom, bruh, violino triste, emotional damage, cano de metal, among us, GTA wasted/mission passed, anime wow, nani, to be continued, dun dun dun, X-Files, ba dum tss, airhorn, "momentos depois", buzzer de erro, grilo, sitcom, e BR: que isso meu filho, cavalo, ai que delícia, tururu). Lista com categoria e "quando usar" em `banco/sons/sons.json`. Nos vídeos, **prefira os recortes curtos de `sons/virais/`**; os do banco servem quando precisar de um som que não tem lá (cortar os longos com `durationInFrames`).
- `musicas-liberadas/completas/` e `musicas-mixkit/` — todas as músicas completas, com a vibe de cada uma no catálogo (mistério: dark-shadows, fright-night, feedback-dreams, delirium, sci-fi-score).
- `banco/memes/` — 98 imagens de meme (top do Imgflip). Os de REAÇÃO (1 quadro) estão listados no catálogo com o momento certo (Surprised Pikachu, This Is Fine, Hide the Pain Harold, Monkey Puppet, Sad Pablo Escobar, Waiting Skeleton, Laughing Leo, Absolute Cinema, They're The Same Picture, Charlie Conspiracy…).

### Meme no meio do vídeo (regra)
- Inserto de **0,6–1,2 s**, no quadro exato da piada, pulando (escala 0 → 1,15 → 1 em ~0,2 s), borda branca, leve giro, por cima da gameplay; junto com 1 som do banco/virais.
- No máximo **1 meme a cada 10–15 s**; nunca por cima de mapa, nome de lugar ou informação do passo a passo.
- Nada de meme com tragédia/vítima real (os de 11 de setembro foram tirados).

```tsx
const pula = (t: number, a: number) => interpolate(t, [a, a + 0.12, a + 0.22], [0, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
{t >= Q && t < Q + 1 && (
  <Img src={staticFile("fase-extra/banco/memes/surprised-pikachu.jpg")} style={{ position: "absolute", left: 240, top: 700, width: 600, border: "8px solid #fff", borderRadius: 18, transform: `scale(${pula(t, Q)}) rotate(-3deg)` }} />
)}
```
