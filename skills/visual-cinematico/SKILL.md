---
name: visual-cinematico
description: Padrão visual dos vídeos 3D do usuário (decidido em 31/10/2026 a partir de 6 vídeos de referência dele) — personagens semi-realistas, luz de cinema com névoa e entardecer, desfoque de fundo, brilho e partículas, cenário brasileiro cheio de detalhe, texto em serifa elegante com palavra-chave em itálico e HUD minimalista com anel fino. Use SEMPRE que for montar, revisar ou refazer o visual de um vídeo do canal (junto com videos-e-se e roteiros-curtos), e quando o usuário reclamar que algo ficou "neutro", "quadradão", "sem graça" ou "parado".
---

# Visual cinematográfico (padrão do canal)

O usuário achou a V1 do vídeo "Imortal" **"muito neutra"**: luz chapada, tudo nítido, caixas lisas, nada brilhando e texto grande gritando. Ele trouxe 6 referências (pasta `Downloads/skills dpara vd`) e decidiu: **personagens semi-realistas** e **texto em serifa elegante com HUD de anel fino**. Este é o padrão daqui para a frente. Use a técnica das referências, nunca as cenas, falas ou marca delas.

## O que tira o "neutro" (checklist de todo plano)

1. **Luz com direção e hora do dia.** Sol baixo (entardecer dourado/rosa) ou meio-dia forte com sombra macia. Uma luz principal quente + céu frio preenchendo + **contraluz** que recorta o personagem do fundo. Nunca luz igual em tudo.
2. **Céu de verdade e névoa ao longe.** Céu em gradiente com nuvens; `fog` para os prédios do fundo sumirem no ar (perspectiva aérea). HDRI do Poly Haven (CC0) para reflexos e luz ambiente.
3. **Profundidade.** Desfoque de fundo (DOF) no assunto, borrão de movimento nos cortes rápidos, efeito miniatura (topo e base desfocados) em planos de maquete/diorama vistos de cima.
4. **Coisas que brilham de verdade.** Bloom em: sol, neon, laser, fogo, canos com água, telas, estrelas. Partículas finas (poeira na luz, faíscas, vagalumes, pontos de luz).
5. **Cenário cheio de detalhe e de vida.** Grama em folhinhas, folhagem densa, calçadão de pedra portuguesa, coqueiros, araras, bandeira do Brasil, marcos reais (Pão de Açúcar, torre de TV de Brasília, prédios da orla). Muita gente se mexendo.
6. **Acabamento final por cena.** Correção de cor (contraste + saturação moderada + tom da cena), vinheta leve e granulado sutil. Nada de tela "cinza".
7. **Primeira pessoa com mãos bonitas.** Mãos arredondadas com dedos que seguram coisas (coco, linha de pipa, celular, controle).

## Personagens: o estilo do Culturaverso (referência principal do usuário)

Três das referências (π em Copacabana, camada de ozônio, resistência do ar em Brasília) são do canal **Culturaverso**, e o usuário quer os personagens nesse estilo. Visto em quadros em resolução cheia:
- **Gente de animação estilizada**, não realista: pele **lisa e fosca, de cor única** (sem poros, sem textura de pele, sem músculo desenhado); proporção **normal e esguia**, braços e pernas um pouco alongados.
- **Rosto de desenho 3D**: olhos grandes e redondos com pálpebra, nariz pequeno, boca simples que sorri e fala; expressão viva.
- **Roupa como peça separada, de cor sólida e saturada** (regata amarela, short jeans, vestido laranja, camisa listrada), com dobras suaves de tecido.
- **Cabelo detalhado e marcante** (cachos volumosos, tranças, coque, barba).
- Aparecem muito **pequenos no quadro, em multidão** (calçadão cheio, ciclistas), e bem de perto só às vezes; a **primeira pessoa com mãos lisas cor de pêssego** segurando algo (coco, linha de pipa) é recorrente.
- O teste com o corpo-base Quaternius de pele texturizada e roupa pintada foi **reprovado** ("não gostei do visual"; "menos músculos"). Pele texturizada + roupa colada = cara de manequim. Evitar.

### O que já foi testado (31/10/2026)
- **Quaternius** (CC0): reprovado — manequim, musculoso, roupa pintada parece lycra.
- **Mixamo realistas** (remy, ch07, ch08, ch12, ch21…): mesmo com pele lisa ficam com cara de jogo/The Sims.
- **Mixamo "desenho"** (ch03, ch29, ty, ch39, the-boss): estilos muito diferentes entre si; não formam um elenco consistente.
- **Meshy**: reprovado — no plano grátis o download do modelo é pago.
- **IA grátis (FLUX → TRELLIS → Mixamo)**: funciona, mas o usuário achou "sem qualidade nenhuma" perto do Meshy, e depende de cota diária + upload manual. Abandonado (scripts `gerar-personagem.mjs`/`ia-para-mixamo.mjs` ficam só de reserva).

### ✅ CAMINHO OFICIAL (02/11/2026): `Boneco` — gente escrita em código
O próprio site do Culturaverso (culturaverso.com, curso grátis) diz: "Cenário, **gente**, câmera e física: tudo escrito em código com Claude Code, Remotion e Three.js" — a mesma pilha deste projeto. Por isso os personagens são modelados no código: `src/cinema/Boneco.tsx`.
- Uso: `<Boneco visual={{ corpo, pele, cabelo, corCabelo, barba, camisa, listras, manga, calca, perna, vestido, sapato, peso, brinco, corBone }} animacao="walking" t={s} pos giroY altura falando semente />`.
- Cabelos: `curto`, `raspado`, `black`, `coque`, `trancas` (nagô + coque + tranças soltas), `longo`, `rabo`, `careca`, `bone`. Manga: `curta` (bufante), `longa`, `regata`. Perna: `bermuda`, `short`, `calca`. `vestido` troca camisa+calça.
- O corpo usa o **esqueleto do idle.fbx do Mixamo** (em T, cm) → todas as 25 animações funcionam. Pele com pesos por "corrente" de juntas (dobra lisa no cotovelo/joelho/dedos). Cabeça, olhos, nariz, boca e cabelo presos ao osso Head.
- Rosto: olho = globo branco + íris grande + brilho + pálpebra de pele com linha de cílios (pisca sozinho, `semente` muda o ritmo); nariz com ponte/ponta/asas; lábios que abrem com `falando`.
- Anatomia do estilo (visto em quadro cheio no vídeo dos polos magnéticos): pele lisa de cor única, pescoço e membros compridos e finos, cabeça oval com queixo afinado, roupa de cor sólida (manga bufante arredondada), tênis branco arredondado de bico fino, cabelo com fios/tranças desenhados.
- Aprendido (corpo LIMPO, o usuário reclamou da virilha): o calção é **uma peça só e lisa** — tubo da cintura até a virilha com fundo achatado, começando por dentro da barra da camisa (mais estreito que ela); as pernas da bermuda não têm tampa em cima; **nunca** pôr peça/bola no meio das pernas (vira volume esquisito). Busto e barriga = deformar o próprio tronco (peça colada fica caricata e corta a listra). Braço nasce de dentro do tronco (osso do ombro), sem bolinha de boneco articulado. Conferir de perto em `EstiloBonecoDetalhe` (frente, 3/4, lado, costas, andando).
- Testes: composição `EstiloBoneco` (elenco Dandara, Seu Zé, Bia, Caio + close) e `EstiloTestePraia` (todo mundo da praia já é Boneco).
- **Caminho de IA (reserva, NÃO é o oficial)** — personagem de IA + esqueleto do Mixamo:
  1. `node scripts/gerar-personagem.mjs <nome> "<pessoa e roupa em inglês>" [semente]` (FLUX.1-schnell → TRELLIS no Hugging Face, chave em `.env.local`; cota grátis ≈ 2 personagens/dia). O mesmo trecho de estilo "adulto 1/8 de cabeça, leve Sims 4/Pixar, fosco" vale para todos → elenco consistente. Conferir em `EstiloIA`.
  2. `node scripts/ia-para-mixamo.mjs <nome>` → `out/<nome>-para-mixamo.zip`; o usuário sobe no Mixamo (Upload Character → auto-rig) e baixa o FBX.
  3. FBX em `public/modelos/mixamo/personagens/<nome>.fbx` e o nome em `PERSONAGENS` **e** `DE_IA` (`src/cinema/Mixamo.tsx`) → `PessoaMixamo` com as 25 animações.
  - Pegadinhas já resolvidas no código: o FBX da IA vem em **metros** e sem normais (o loader reescala o quadril da animação pela altura do quadril do personagem e calcula normais lisas); acabamento IA = textura + 0,32 dela como emissiva, rugosidade 0,92.
  - Primeiro aprovado como direção: `rapaz` (camiseta laranja, bermuda jeans, barba).

## Personagens: semi-realistas (técnica)

- Base: **Quaternius Universal Base Characters** (CC0) + **Universal Animation Library** (CC0, 45 animações grátis: andar, correr, sentar, nadar, rastejar, cair, gestos). Modelos em `public/modelos/` do projeto `videos-3d`, carregados com `useGLTF` do `@react-three/drei` e animados com `useAnimations`/`AnimationMixer`, sempre pelo **quadro do Remotion** (`mixer.setTime(frame / fps)`), nunca pelo relógio.
- Variedade: troque a cor/material da roupa, o cabelo, a pele e a altura (escala 0,92–1,08). Um elenco com nomes na tela quando a história acompanha alguém.
- Emoção: corpo e câmera (postura, gesto, aproximação lenta, luz no rosto). Close de rosto a ~1,2–1,6 m com DOF forte.

## Cenários: kit pronto (`src/cinema/kit/`, desde 02/11/2026)

O usuário quer **vários lugares** (todos os tipos que aparecem no Culturaverso), não só praia. Base reaproveitável:
- `Luz.tsx` → `<Ambiente hora="manha|dia|tarde|entardecer|noite|fogo|interior" foco desfoque area>`: céu HDRI (Poly Haven CC0: `dia`, `manha`, `praia-sol`, `entardecer`, `noite`, `fogo`, `estudio`), sol, luz céu/chão, névoa longe e acabamento de cor. À noite, postes, faróis, letreiros e janelas acendem sozinhos.
- `Pecas.tsx`: `pessoaAleatoria(semente)`, `Passante` (anda de A a B em loop), `Parado` (conversa/celular/ri), `Arvore` (copa redonda lisa), `Carro`, `Poste`, `Fios` (com barriga), `Morro` (mata com copas + paredão de pedra), `Letreiro`, `materialPredio(noite)` (janelas desenhadas pela posição no mundo, acendem à noite; serve também em InstancedMesh com cor por instância), `texturaCanvas`.
- `Rua.tsx` (sobrados coloridos com varanda/grade, lojas com toldo e letreiro, postes com fios, carros, morro no fim) · `Calcadao.tsx` (pedra portuguesa em ondas, ciclovia, avenida, quiosques, coqueiros, prédios da orla, morro do Leme) · `Praia.tsx` (areia PBR, mar com ondas e espuma, coqueiro, guarda-sol, placa, gaivotas) · `Mercadinho.tsx` (interior: prateleiras amarelas com garrafas instanciadas e caixas com rótulo, balcão, geladeira, fluorescentes, porta clara) · `Parque.tsx` (grama com lâminas, caminho, lago, bancos a 0,45 m p/ "sitting-*", toalha de piquenique, skyline) · `Cidade.tsx` (vista de drone: quarteirões instanciados, casas de telhado laranja, prédios, baía, morros, postes que brilham).
- Vitrine: composição `EstiloCenarios` (`kit/Vitrine.tsx`).
- Aprendido: copa de árvore precisa de `mergeVertices` antes das normais (senão fica facetada); morro grande e perto vira "paredão/pudim" — longe, mais baixo e com textura de mata; HDRI de foto mostra prédios/postes no fundo → `desfoqueCeu`; névoa das horas abertas bem longe (≥ 450 m) para o morro aparecer; câmera vertical tem campo horizontal estreito (fov 44 ≈ 26° de largura).
- **Nível de detalhe exigido (02/11, pedido do usuário: "prestar atenção aos detalhes, cenário menos quadrado, mais realista e com mais cor")** — o que o Culturaverso tem e já está no kit:
  - Casa: janela com moldura em relevo + peitoril + veneziana de madeira aberta + grade no térreo; porta de madeira com almofadas e degrau; número da casa; relógio de luz; ar-condicionado; cano de descida; friso entre andares e cornija; parede com barrado escuro, sujeira subindo do chão e manchas (shader `parede`); varanda com guarda-corpo de ferro e vaso.
  - Loja: **vão aberto de verdade** (parede montada em volta da abertura) com salão, prateleiras de garrafas/latas/pacotes, balcão e lâmpada; porta de aço enrolada; letreiro com subtítulo; toldo listrado; mesas de bar de plástico com cadeiras e cerveja (gente sentada com `sitting-*`).
  - Rua: asfalto cinza quente com remendos, faixa branca tracejada, bueiros, calçada de placas, meio-fio pintado, postes com 4 fios, carro com vidros/calotas/para-choques/retrovisor/placa.
  - Morro: granito com estrias descendo a encosta e mata com copas — tudo em cor de vértice numa malha densa (textura esticada ficou "madeira bege").
  - Luz "tarde" = sol baixo dourado; `ao` (sombra de contato N8AO) ligado no `Ambiente`.
  - Personagem: roupa desenhada no material (gola redonda, regata com alça e decote em U, listras, avental) → borda lisa; avental com saia e alça no pescoço; tranças finas (26) e nagô fino.
  - Teste de referência: `EstiloRuaDetalhe` (`kit/TesteRua.tsx`).
- Ainda falta (fazer quando um roteiro pedir): espaço/Terra (textura NASA Blue Marble, crédito no fim), quarto/casa por dentro, ônibus/metrô, avião (cabine/janela), escola, estádio, favela/morro com casas, Brasília (Esplanada), interior do Nordeste.

## Câmera: a linguagem do Culturaverso (estudada quadro a quadro no vídeo dos polos, 02/11/2026)

O usuário quer **"a câmera entra, sai, personagens aparecem muito"** e **primeira pessoa de vez em quando**. Medido no vídeo de referência (2min19): 38 planos, média de 3,7 s, mas com **planos contínuos longos (10–21 s)** alternados com **rajadas de cortes de 0,3–0,5 s** nos impactos.

Repertório (usar MISTURADO em todo vídeo):
1. **Voo contínuo** que liga lugares sem cortar: sai de dentro do bondinho → sobre a baía → rente à água passando por cima de um barco → sobe pela cidade até o Pão de Açúcar → desce até a rua (17 s). `CameraTrajeto` com pontos-chave.
2. **Entrar pela porta**: da calçada para dentro da loja, terminando por cima do ombro de alguém. (Por isso a loja precisa de salão de verdade.)
3. **Por cima do ombro** de quem faz algo (fotografa com o celular, paga com Pix). `CameraOmbro`.
4. **Primeira pessoa com as mãos**: celular na mão pagando, mão para fora da janela do carro, cabine do avião. `<Boneco primeiraPessoa naMao="celular|coco" telaCelular="pix|camera|mensagens">` — a cabeça some, a câmera fica nos olhos e as mãos aparecem; `inclinar ≈ 1` para olhar o celular na mão, `≈ 0,1` andando.
5. **Close de objeto/inserto** (bússola com contagem 3-2-1, mão com celular) e **close de reação** (rosto assustado, mãos na cabeça), lente fechada (fov 30) e fundo bem desfocado.
6. **Olho de Deus** (de cima, girando devagar) seguido de corte para o rosto. `CameraTopo`.
7. **Rente ao chão / altura de carro** andando pela rua. `CameraLivre` baixa e com leve rolo.
8. **Órbita** em volta de um grupo. `CameraOrbita`.
9. **Passagem de tempo** no mesmo enquadramento: relógio pequeno em serifa (17:58 → 18:33) e o céu escurecendo.
10. **Diagrama/maquete** explicando a ciência (gerador cortado ao meio, Terra cortada, Terra do espaço com linhas de campo).
11. **Analogia visual** (pão crescendo no forno = "o ar incha").
12. **Multidão reagindo** (gente no calçadão apontando, celular para o alto).
- Teste/vitrine: composição `EstiloCameras` (`kit/TesteCameras.tsx`), em `kit/Cameras.tsx` (+ `tremor` para câmera na mão).
- Pegadinha: na animação `texting-while-standing` as mãos ficam na altura da cintura e a palma de lado → o celular é girado (`GIRO_CELULAR`) e a primeira pessoa precisa olhar bem para baixo.

## Texto e HUD

- **Pergunta de abertura e legendas em serifa** (ex.: Source Serif 4 / Newsreader / Lora), **branca**, com sombra suave, frases curtas; a **palavra-chave em itálico** (ou negrito). Tamanho moderado: a imagem é a estrela. Legenda em 1–2 linhas no terço de baixo/meio, entrando com fade + leve subida.
- Alternativa usada em vídeos de explicação: **uma palavra por vez**, sans branca pequena, no centro.
- **HUD minimalista, sem caixa**, no canto esquerdo (meio da tela): anel fino que enche (progresso), rótulo pequeno em caixa alta espaçada ("RESISTÊNCIA DO AR"), **número grande em fonte fina** com casas decimais quando faz sentido ("0:17,200", "2.400 m"), e linha pequena de lugar/hora ("BRASÍLIA · 15:58:52").
- **Nome de personagem**: letras bem espaçadas ("J Ú L I A") com um fio fino embaixo e uma linha de contexto.
- **Diagramas holográficos** finos (círculo, régua, seta) por cima da cena em linhas brancas de 2 px, quando a ideia for difícil.
- Proibido: texto 3D gigante gritando, contorno preto grosso, caixa azul com borda dourada (estilo antigo).

## Técnica no projeto (Remotion + three.js)

- **Nunca troque o céu HDRI (`ceu`) no meio de uma cena** (ex.: fora → dentro de um prédio no mesmo Palco). No render contínuo o `Environment` recarrega, a cena "suspende" e o vídeo repete o último quadro (bug da "tela amarela" na pirâmide, 04/11/2026). Os quadros de teste saem certos, então só aparece no .mp4: confira sempre quadros extraídos do vídeo final. Para interiores, mantenha o mesmo `ceu` e baixe só `luzCeu`.
- Corrigir um trecho sem refazer tudo: `npx remotion render <bundle> <Comp> seg.mp4 --frames=A-B --muted` e emendar com ffmpeg (partes re-encodadas com libx264 cortando com `-ss/-t` depois do `-i`, depois `-f concat -c copy`, e o áudio final por cima).

- Pós-processamento: `@react-three/postprocessing` — `EffectComposer` com `Bloom` (luminanceThreshold ~0,8), `DepthOfField` (focusDistance no assunto), `Vignette`, `Noise` (opacidade ~0,04), `BrightnessContrast`/`HueSaturation`. Renderizar com `gl={{ toneMapping: ACESFilmic }}` e sombras macias.
- Ambiente: `Environment` do drei com HDRI local (baixado do Poly Haven, CC0) em `public/hdri/`; texturas PBR do Poly Haven em `public/texturas/`.
- Tudo determinístico: nada de `Math.random` nem relógio; use `random()` do Remotion e o quadro.
- Antes do render completo, sempre revisar 1 quadro por plano (`scripts/quadros.mjs`).

## Referências estudadas (o que cada uma ensina)

- **Polos magnéticos (Culturaverso, Rio/Urca, 2min19)**: elenco de bonecos lisos (tranças nagô + coque, careca de barba, boné, chapéu de palha), mercadinho com prateleiras cheias, bondinho/Pão de Açúcar, linhas de campo magnético como arcos brilhando, bússola em close com número grande, aurora verde → céu vermelho, satélites caindo, cabine de avião ("CLIMB CLIMB"), Terra com núcleo cortado; relógio pequeno em serifa (17:41 → 20:10) marcando a escalada; legendas curtas em itálico com palavra em negrito ("energia **demais** nos fios"); final com cartão de crédito à ideia do seguidor + "comenta o próximo E SE" + créditos de assets no rodapé.
- **Piquenique no Ibirapuera**: entardecer rosa/roxo, grama com folhinhas, primeira pessoa com mãos, brilhos e partículas, cidade virando partículas de luz; HUD sem caixa com decimais; serifa itálica.
- **Camada de ozônio**: semi-realista estilo jogo, Terra fotográfica do espaço, raios de luz, vista aérea com névoa.
- **Chuveiro**: maquete low-poly vivíssima (céu azul, nuvens brancas, canos ciano brilhando), corte da casa, efeito miniatura; legenda de uma palavra.
- **Resistência do ar (Brasília)**: mãos arredondadas, araras, janela do avião, HUD com anel fino e nome espaçado ("JÚLIA").
- **π = 3 (Copacabana)**: calçadão de pedra portuguesa, multidão, coco em primeira pessoa, diagramas holográficos, Pão de Açúcar ao fundo.
- **Terreno**: personagens arredondados de animação em cenário quase fotográfico, borrão de movimento, legenda curta em caixa alta.

## Lição crítica (02/11/2026): o vídeo da Terra parando ficou "muito ruim, não tem nada a ver com nosso exemplo"

Comparando quadro a quadro com `Downloads/agora` (3 vídeos novos, inclusive um exatamente em Copacabana — "π vira 3"), a V1 ficou muito abaixo do padrão já documentado acima porque **não seguiu o próprio checklist desta skill**. Não é um padrão novo, é reforço do que já estava escrito:
- **Cor viva, nunca neutra** (item do checklist "roupa de cor sólida e saturada"): um pedido pontual de "cores mais neutras" num teste anterior (personagens da telepatia) foi aplicado largo demais e vazou pro Diego do vídeo da Terra. Regra: só dessature quando o usuário pedir *especificamente para aquele teste*; o padrão do canal é sempre roupa/guarda-sol/toldo em cor saturada (laranja, azul, amarelo, pink, verde-água).
- **Cenário tem que estar CHEIO**: praia de domingo real tem dezenas de guarda-sóis (agora com padrão listrado via `GuardaSol listrado` em `Praia.tsx`) emendados quase sem espaço, muita gente andando/deitada, lojas com toldo e letreiro legível no térreo dos prédios da orla (`Fachada`/`LOJAS_CALCADAO` em `Calcadao.tsx`). Uma praia com 6 figurantes e 20 guarda-sóis espaçados fica "vazia" na hora — dobre ou triplique a densidade do que parecer suficiente.
- **Primeira pessoa com as mãos é regra, não opcional** (já era item 7 do checklist, mas a V1 não usou nenhuma vez): comece o vídeo com `<Boneco primeiraPessoa naMao="coco">` por 2–3 s antes de cortar pra câmera de fora — é a assinatura mais reconhecível do Culturaverso.
- **Brilho/partículas** (item 4): mesmo numa cena de dia, ponha uns pontinhos emissivos sutis no ar (reflexo do sol na água, poeira) — sem isso a luz "não brilha" e a cena parece renderizada sem pós-processamento, mesmo tendo bloom ligado.
- Antes de qualquer render completo, **confira se os 5 itens acima estão realmente na cena** (não só na skill) — essa é a causa raiz de "ficou muito ruim" apesar da skill já pedir tudo isso desde 31/10.
- **Pegadinha de câmera (descoberta depois, "o vídeo tá literalmente travado")**: `<Boneco primeiraPessoa>` prende a câmera no osso da cabeça. Se a animação for `idle` (parado), a cabeça quase não se desloca → a abertura em primeira pessoa fica com cara de imagem congelada, mesmo com tudo certo no resto da cena. Solução: ou usar uma animação com deslocamento real da cabeça (`walking` com o personagem realmente andando — **mexa o `pos` a cada quadro, não confie só na animação**, porque `walking` com `noLugar` no padrão não translada a raiz), ou manter a primeira pessoa bem curta (≤1 s) e cortar. **Sempre conferir quadros extraídos do** `.mp4` **final (não só do bundle) espaçados de 1 em 1 s no início do vídeo** antes de mostrar — é onde esse tipo de coisa aparece.
