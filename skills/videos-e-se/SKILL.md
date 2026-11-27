---
name: videos-e-se
description: Formato padrão dos vídeos do usuário — vídeos curtos verticais em 3D no estilo "E se…?" científico, ambientados no Brasil, com consequências que escalam do cotidiano até o catastrófico, legendas curtas com palavra-chave em destaque e HUD com relógio ou contador. Inclui a variante de humor "E se o [amigo] arrumasse uma namorada?" (prompt mestre cena a cena, 60 s, 3D blocado). Use sempre que o usuário pedir um vídeo, um "E se", uma ideia ou um roteiro de vídeo, mesmo sem explicar o estilo. Funciona junto com a skill roteiros-curtos.
---

# Vídeos "E se…?" em 3D

Quando o usuário pedir um vídeo, este é o formato que ele quer, mesmo que não descreva o estilo. Use também a skill `roteiros-curtos` para a qualidade da história (planejamento, diálogos, revisão crítica) e para a produção no projeto a pasta `projeto/` deste kit.

Este formato foi aprendido com dois vídeos de referência (inversão dos polos magnéticos; velocidade da luz a 30 km/h). Use as técnicas, nunca as falas, cenas, personagens, marca ou cartaz final deles.

## A fórmula

Uma hipótese científica impossível ou extrema, aplicada a um lugar real e comum do Brasil, mostrada pelas consequências na vida de pessoas comuns, que vão piorando até virar catástrofe, e fecha com a volta ao mundo real.

## Estrutura (cerca de 2 minutos)

0. **Regra fixa do usuário: TODO vídeo começa com a pergunta "E se…?" na tela, já no 1º segundo**, em texto 3D animado (palavras entrando uma a uma, palavra-chave em amarelo). A pergunta é completa e concreta: hipótese + lugar real + horário movimentado. Modelo: "E se a gravidade da Terra caísse pela **metade** na [placa azul AVENIDA PAULISTA] ao **meio-dia?**". A narração pode começar junto, e a pergunta fica uns 4 s na tela. Componente pronto: `Pergunta` em `src/gravidade/ui.tsx`.
1. **Gancho (0–3 s)**: a pergunta "E se…?" escrita grande no centro da tela, sobre uma cena cotidiana já em movimento (gente num bondinho, alguém andando na rua mexendo no celular). A pergunta é precisa e concreta. Um número exato chama mais atenção que uma ideia vaga ("99,999997% menor" é melhor que "muito menor").
2. **Base em uma frase (3–15 s)**: o conceito que o público precisa saber, numa imagem e numa legenda curta ("a Terra é um ímã"). Use uma metáfora visual ("o guarda-chuva da Terra", com linhas de campo sobre a cidade).
3. **O gatilho**: o momento em que a hipótese acontece, com contagem regressiva, um "bum" ou um contador que começa a correr.
4. **Escalada de consequências (o corpo do vídeo)**: uma consequência nova a cada 5 a 10 segundos, cada uma maior que a anterior:
   - **pessoal e pequena** (a bússola gira; o quarto escurece devagar quando a luz desliga);
   - **do bairro** (falta energia no bar; a amiga correndo parece atrasada);
   - **da cidade** (sem internet; som chegando antes da imagem);
   - **planetária e catastrófica** (satélites caindo, avião sem GPS; átomos colapsando, cidade derretendo).
   Cada consequência é **causa e efeito** da anterior, não uma lista solta.
5. **Clímax**: a imagem mais extrema do vídeo, com cor e câmera no limite.
6. **Volta ao real**: uma frase curta que separa fato de hipótese ("na vida real isso leva **séculos**"), com uma imagem científica calma (corte da Terra, planeta no espaço).
7. **Chamada final**: um cartaz pedindo que o público comente o próximo "E se". Se o tema veio de um seguidor, dê o crédito na tela. Termine com os créditos das fontes de mapas e texturas, quando houver. Use a identidade do usuário, nunca a do vídeo de referência.

## Variante de humor: "E se o [amigo]…?" (aprovada pelo usuário: "muito bom")

Às vezes o usuário manda um **prompt mestre pronto** (roteiro cena a cena com tempos, legendas e textos na tela). Nesse caso:

- **Siga o prompt cena a cena.** Não reescreva a história. Corrija só furos óbvios, como legenda duplicada ou faltando uma frase que a narração diz, e avise o que mudou.
- **Formato:** uma pessoa comum, com nome trocável, causa uma catástrofe absurda: namorada → onda de choque → terremoto global → explosão da Terra. Depois vem a volta ("por isso ele continua solteiro") e o "marca aquele amigo".
- **Ritmo:** cerca de 60 s, com **um corte a cada 1 a 2 s** e câmera sempre andando devagar (zoom ou órbita).
- **Narrador seco, quase sério, contando o absurdo como fofoca.** A narração fala exatamente o texto das legendas.
- **Visual:** 3D blocado/low-poly, com personagem de cabeça quadrada e sobrancelhas grossas pretas.
- **Legenda em CAIXA ALTA:** Montserrat 900, branca, com contorno preto e palavra-chave amarela (#F5C518), um pouco abaixo do meio da tela.
- **Etiquetas:** pílulas pretas com borda branca, em Anton.
- **HUD:** caixa azul-marinho com borda dourada fina, rótulo pequeno e número gigante. Fica vermelho no alerta.
- **Selos:** amarelos e inclinados ("×1.000.000", "12 > 9,5").
- **Aviso fixo:** "ILUSTRAÇÃO · NÃO É REAL" durante toda a catástrofe.
- **Silêncio depois da explosão:** a explosão corta a música, e o corte seco para a Terra inteira fica em silêncio por cerca de 1,4 s antes da piada final.
- **Modelo pronto:** `src/namorada/` (composição `NamoradaTesteV3`; cada pedido de mudança vira uma versão nova: V1, V2, V3…). Para outro amigo, troque `NOME`/`AMIGO`/`ARROBA` em `tempo.ts` e gere a narração de novo com o nome novo.

## Variante "cópia fiel de vídeo gringo" (02/11/2026 — projeção astral)

Quando o usuário traz um reel de fora e diz "quero exatamente igual, só que em português": **não reescreva nada**. Mesmas cenas, mesma ordem, mesmo tempo, mesmos lugares e piadas de cenário; só traduza (legendas, HUD, placas, TV) e grave a narração. Visual do próprio original (se ele é em blocos, fica em blocos), não o `Boneco`.

1. **Mapear o original quadro a quadro**: o ffmpeg do Remotion (`node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`) não tem filtro `fps`/`select`: tire quadros com `-ss T -frames:v 1` (2 em 2 s, depois os ímpares em 270x480). Cortes: exporte `-vf scale=90:160 -pix_fmt gray -c:v rawvideo -f avi` e compare quadros vizinhos em Node (script em `scratchpad`). Anote, por segundo: lugar, câmera, legenda, HUD.
2. **Ver se tem voz antes de transcrever**: reels "What if" com legenda queimada costumam ser **só música** (a transcrição de 75 s custou 410 créditos e voltou vazia). A narração em PT-BR fala exatamente as legendas.
3. **Narração numa geração só** (voz "Narrador E se", tom calmo de sonho com tags), transcrição de graça no mesmo flow, `scripts/cortar-astral.mjs` corta frase por frase no ponto mais silencioso e cada frase entra no segundo em que a legenda do original aparece (`Video.tsx`, `inicioVoz`).
4. **Tempos do original** viram `tempo.ts` (cenas, legendas, HUDs). HUD em 24 h ("03:30", "15:30"); lugares traduzidos (VIZINHO, CIDADE DO VATICANO, GIZÉ, ÁREA 51 · NEVADA, EUA, "UTC · 14.600 KM DE ALTITUDE").
5. Modelo pronto: `src/astral/` (composição `ProjecaoAstral`).
6. **Cartaz da página no fim (padrão do usuário desde 04/11/2026)**: depois da história (cópia fiel), +6,5 s de cartaz por cima da última cena escurecida: "SIGA NAS REDES" / **MUNDO PARALELO** (Garamond grande, espaçamento abrindo) / *@mundoparalelo.br* (itálico amarelo `#f3cf5e`) / "Comenta a sua ideia pro próximo vídeo." / "A melhor *vira vídeo.*" Narração com a voz aprovada: "Segue o Mundo Paralelo... e comenta a sua ideia pro próximo vídeo. A melhor vira vídeo!" (`public/astral/voz/fcartaz.wav`, 5,2 s — reaproveite em outros vídeos, sem gastar créditos). Código: `CartazPagina` em `src/astral/ui.tsx` + `CARTAZ` em `tempo.ts`. Para pôr num vídeo já renderizado: renderize só o trecho final (`--frames`) e o áudio inteiro (`--codec=wav`), e emende.

Peças novas reaproveitáveis (`src/astral/`):
- `maos.tsx` → **mãos de fantasma em primeira pessoa numa camada própria** (ThreeCanvas por cima da cena, câmera fixa): uma passada azul com `filter: blur(20px)` + `mix-blend-mode: screen` (halo macio de verdade) e outra nítida por cima. Casca fresnel/RoundedBox em volta da mão ficou "gelatinosa" — não usar. Poses por tempo (`maosEm`): sobem do corpo, encostam na parede, empurram porta, mãos normais de pele + pijama ao acordar.
- `pecas.tsx` → `Gente` em blocos (rosto desenhado em textura de canvas: dormindo com cílios e batom, aberto, sério; penteados cacheado/grisalho/coque/lateral; terno, vestido; ações andar, correr, dançar, conversar sentado), `Ondulacao` (anéis ao atravessar superfície), `CidadeNoite` (avenida com faróis e janelas acesas), `CeuNoite`, `CeuDia`.
- `cidade.tsx` → `Instancias` (milhares de caixas coloridas num InstancedMesh), `Eixample` (quarteirões octogonais), `CarrosGrade`, `texturaFachada`, `Multidao`.
- Espelho de verdade: `Reflector` do three (`three/examples/jsm/objects/Reflector.js`) funciona no render do Remotion. Posicione o espelho onde a linha câmera → reflexo cai nele (senão só reflete o chão).
- Terra realista: `CenaEspaco.tsx` (shader dia/noite com luzes das cidades, brilho do sol no mar, borda azul + casca de atmosfera; texturas NASA em `public/astral/terra/`; nas nuvens use o canal **alfa**). 1 unidade = 1.000 km, câmera saindo de 430 km a 14.600 km.
- Trilha calma de sonho: "Vastness" (Mixkit 184) — volume constante (variação 3 dB), escura, sem chiado. `scratchpad/tools/analisa.mjs` mede variação de volume e brilho de candidatas antes de escolher.

## Linguagem visual

> **Atualização de 02/11/2026 (aprovado pelo usuário):** personagens = **`Boneco`** escrito em código (estilo Culturaverso), cenários do **kit `src/cinema/kit/`** com muito detalhe e **kit de câmeras** (voo contínuo que entra e sai dos lugares, primeira pessoa com as mãos, por cima do ombro, close de reação, olho de Deus, rajadas de cortes nos impactos). Tudo na skill `visual-cinematico`.
>
> **Atualização de 31/10/2026 (decisão do usuário):** o visual passou a seguir a skill **`visual-cinematico`**: personagens **semi-realistas**, luz de cinema, névoa, desfoque de fundo, brilho, **texto em serifa elegante com palavra-chave em itálico** e **HUD minimalista com anel fino, sem caixa**. Onde esta seção falar em blocos, Anton 3D amarelo ou HUD em caixa, **vale a `visual-cinematico`**. O resto (Brasil real, muita gente, primeira pessoa, escalada, cor por cena) continua valendo.

- **Brasil real e cotidiano**: lugares reconhecíveis (Rio, Urca, Pão de Açúcar, calçadão de pedra portuguesa, praça, bar de esquina, mercearia, quarto comum). Placas com nomes brasileiros (bar, padaria, mercadinho com nome de dono) dão vida ao cenário.
- **Personagens 3D estilizados** fazendo coisas comuns: tomando cerveja no bar, correndo, sentados no banco da praça. Com nome na tela quando forem acompanhados (etiqueta pequena com o nome).
- **HUD fixo no canto superior esquerdo** que conta a história em números:
  - local + relógio que avança entre as cenas (17:41 → 18:04 → 20:10) para mostrar a escalada; ou
  - a variável da hipótese + um cronômetro ("VELOCIDADE DA LUZ 30 km/h", "DESDE O BUM 0:04").
- **Texto em 3D e animado (pedido do usuário; fonte simples e parada ele não gosta)**: letras grossas (Anton) com espessura, palavras que entram girando uma a uma, balanço leve contínuo e a palavra-chave em amarelo com "soco" de escala. O título de abertura também é 3D e cita o lugar real (ex.: "na [placa azul AVENIDA PAULISTA]?").
- **Muita gente e dinamismo**: a cena tem que parecer viva. Vários figurantes perto da câmera, reagindo ao mesmo tempo (espanto, braços, pulos), multidão andando ao fundo e câmera na mão (balanço leve). Planos em **primeira pessoa** sempre que der (pelos olhos do personagem: pulo, celular na mão, o carro vindo na direção dele, mãos levantadas no susto).
- **Cenário vivo (pedido do usuário para a versão final)**: nada parado no fundo. Encha o lugar de coisas que se mexem e são típicas dele. Na Paulista foram: multidão andando, rodinhas de gente conversando, árvores balançando, folhas caindo, pombos, ciclovia com ciclistas, ônibus, fila de carros, semáforo que muda, banca, pipoqueiro e marcos reais como o MASP e as antenas. Tudo reage à hipótese: os pombos levantam voo, os carros dão um pulinho na suspensão e as pessoas dão pulinhos. Modelo pronto: `src/gravidade/vida.tsx`.
- **Narração sem buracos**: nada de pausa morta. O narrador para, o personagem reage ("Opa!") e a narração volta logo em seguida. Na pergunta de abertura, a frase sai corrida, sem pausa longa no meio.
- **Legendas curtas** (2 a 6 palavras) no terço inferior, no mesmo estilo 3D, com a palavra-chave em destaque. Muitas são "equações" visuais:
  - "sem energia = sem internet"
  - "ímã girando perto de fio = energia"
  - "Sol → Terra: 8 min → 570 anos"
  - "som 343 m/s · luz 8 m/s"
- **Comparações do dia a dia** para os números ("30 km/h · velocidade de bicicleta").
- **Diagramas por cima da cena 3D** quando a ideia é difícil: círculos, setas tracejadas, rótulos do tipo "ela de verdade" × "o que ele vê".
- **Etiquetas de contexto** pequenas: "CÂMERA LENTA", alertas no estilo de painel ("CLIMB CLIMB" em caixa vermelha).
- **Câmeras variadas**: drone sobre a cidade, primeira pessoa (mão segurando o celular), close no rosto, plano visto de cima, janela de avião, câmera tremendo ou girando no caos.
- **Cor que acompanha a escalada**: entardecer dourado (normal) → noite azulada (estranho) → vermelho ou branco estourado (catástrofe).

## Ciência

- A hipótese pode ser impossível, mas as consequências devem seguir a física de verdade, ou o roteiro deve dizer que é especulação.
- Faça as contas antes de escrever e confira os números. Exemplo: luz 99,999997% mais lenta dá cerca de 9 m/s, ou ~30 km/h. Mostre o número que importa no HUD ou na legenda.
- Verifique os fatos quando houver ferramenta disponível. Nunca invente estatística.

## Roteiro

- Narração em português brasileiro natural, de quem conta uma coisa incrível a um amigo, nunca de aula. A legenda não repete a narração. Ela resume a ideia em poucas palavras.

### Jeito de narrar (aprendido com uma narração de referência — use a técnica, nunca as falas)

- **Abertura com algo que todo mundo conhece**: uma frase do dia a dia ou da escola que o público reconhece na hora, seguida da virada que liga isso à hipótese. Ex. de técnica: "todo mundo já ouviu X… hoje, o universo levou isso a sério."
- **Defina o conceito em uma frase, e diga para que ele serve em três palavras**: "X é o que faz Y. Ele deixa você A, B e C."
- **Mostre primeiro, explique depois**: a imagem do caos vem antes. A explicação vem logo atrás, curta, revelando quem era o "herói invisível" que segurava aquilo.
- **Frases curtas**, de 3 a 10 palavras, faladas rápido e soltas (cerca de 3,5 a 4 palavras por segundo dentro da frase). Entre uma frase e outra, uma pausa curta, de cerca de 0,4 s.
- **Deixe o vídeo respirar**: de vez em quando, de 2 a 5 segundos sem narração, só com ação, som e a reação dos personagens.
- **Reações curtas dos personagens são permitidas** ("Opa!", "Não, não, não", "Freia, freia!"). São gritos e exclamações, nunca conversa nem explicação.
- **Humor brasileiro do cotidiano**: um vira-lata, o café caindo, o ônibus lotado. O humor serve de alívio entre os momentos de tensão.
- **Frases-paradoxo** que viram a lógica e soam meio sombrias: "o ônibus parou; os passageiros, não."
- **Listas rápidas de regras novas**: "isso funciona. Aquilo também. Aquilo outro, mais ou menos."
- **Final com piada** depois da volta ao normal: uma última reação engraçada antes da chamada.
- **Chamada pessoal**: o narrador fala como criador ("o próximo vai sair de uma sugestão daqui, comenta").
- **Voz**: homem jovem, tom de conversa, rápido e seguro. Humor seco, quase sério enquanto conta coisas absurdas. Nunca empolgado demais nem com cara de locutor.
  - **Vídeos científicos:** voz "Narrador E se" (ElevenLabs).
  - **Emoção é obrigatória (o usuário reprovou uma narração "sem emoção, com cara de feito por IA").** Gere a narração **inteira numa geração só**, nunca frase por frase: separada, cada frase começa "do zero" e soa como leitura fria. Use **uma tag de emoção diferente em quase toda frase** ([curious], [amused], [chuckles], [excited], [mischievously], [sighs], [sad], [laughs softly], [sarcastic], [whispers], [in awe], [warmly], [exhales]), reticências para respirar e exclamação na empolgação. **Não use [deadpan] no texto todo**, porque achata a voz. O humor seco vem do texto, não da tag. Depois, corte entre as frases no ponto mais silencioso (`scripts/montar-imortal.mjs`) para encaixar reações e respiros.
  - **Reações dos personagens** também com emoção física: [groans in pain], [breathing heavily], [weak laugh], [exhausted sigh].
  - **Variante de humor:** "Davi Menegon" (voice_id `1yAZgIF8C92U9qOmXARZ`), modelo eleven_v4 com tags [deadpan]/[serious]. Escreva os números por extenso no texto da voz ("zero vírgula zero zero zero um por cento").
  - **Custo:** cerca de 1.000 créditos por take de 54 s, e saem 2 takes por geração. Use o take mais curto e seco.
- No formato da `roteiros-curtos`, cada cena inclui também **HUD** (o que o canto mostra) e **Legenda** (o texto curto na tela).
- Duração padrão: cerca de 2 minutos. Se o usuário pedir outra, adapte, mas mantenha gancho, escalada, volta ao real e chamada final.

## Produção

- Projeto: a pasta `projeto/` deste kit (Remotion + Three.js, 1080x1920, 30 fps).
- Antes de criar um componente novo, reaproveite o que o projeto já tem:
  - `src/v2/ui.tsx`: `Legendas`, `Vinheta`, `FiltroCor`, `TextoFinal`, `Recapitulacao`;
  - `src/v2/Diagramas.tsx`: `Seta3D`, setas e diagramas;
  - `src/v2/tempo.ts`: `seg()`, `lerp`, `ease`, marcos de tempo;
  - `src/v2/mundo.tsx`: `Camera`, `Estrelas`;
  - `src/legendas.ts`: formato das legendas por palavra.
- Organize cada vídeo numa pasta própria em `src/` e registre a composição em `src/Root.tsx`.
- Modelo pronto do 1º vídeo, `src/gravidade/`: `texto3d.tsx` (texto 3D, fontes), `ui.tsx` (título, HUD, legendas, cartaz), `CenaRua.tsx` (figurantes reagindo e primeira pessoa), `sons.tsx` (trilha e efeitos).
- Modelo pronto do 2º vídeo, `src/namorada/`, com peças que servem para qualquer vídeo:
  - **`Bloco.tsx`**: personagem blocado.
    - Expressões: sobrancelha, espanto, olhos fechados e as bocas neutra, sorriso, meio-sorriso, aberta e tremendo.
    - Poses: sentado, curvado, braços, `cotoveloDentro` (mãos juntas no peito ou no celular) e celular na mão.
    - Visuais prontos: `GABRIEL`, `MAE` e `CIENTISTA(i)` (de jaleco).
  - **`Globo.tsx`**: Terra com continentes de verdade.
    - Fontes: Natural Earth, domínio público, e bordas das placas tectônicas do PB2002. O JSON compacto está em `mundo-dados.json`.
    - `focar(lat, lon)` gira a Terra até um lugar.
    - Efeitos: brilho no Brasil, placas acesas, rachaduras, planeta laranja, ondas sísmicas (shader), alvo pulsando num ponto, lasers convergindo e `Explosao`.
  - **`Sala.tsx`**: sala de controle com grade neon, monitores com chiado e telão desenhado em canvas (emoji ou mapa com traço de sinal). Tem versão azul, de calma, e vermelha, de alerta.
  - **`Quarto.tsx`**: quarto de noite, com o celular iluminando o rosto, ou de dia. Também tem a medalha.
  - **`Bairro.tsx`**: bairro noturno com onda de choque e corações, e vista do telhado como epicentro.
  - **`Mundo.tsx`**: cozinha (mãe chorando), Cristo dando um passo, Torre Eiffel com treliça que enverga e Muralha que vira zigue-zague.
  - **`ui.tsx`**:
    - legenda em caixa alta;
    - etiquetas, HUD, selos e o aviso de ilustração;
    - balões de chat com "digitando…" e texto digitado letra por letra;
    - grupo de WhatsApp com a tela rachando;
    - clarões e cartaz final "STATUS ATUAL".
  - **`comum.tsx`**:
    - `Palco`: canvas com tonemapping;
    - `CameraLenta`: sempre em movimento, com tremor e rolo;
    - `tremor`, `entre` e `texturaCanvas`.

### Fluxo de trabalho que funcionou

1. **Narração primeiro.** Gere a voz na ElevenLabs num flow próprio do vídeo.
   - Transcrever um take gerado no mesmo flow (`creative_add_flow_asset_node` com o generation_id + `creative_transcribe_audio`) sai de graça e dá o tempo de cada palavra.
   - Transcrever arquivo enviado custa cerca de 5,5 créditos por segundo.
2. **Linha do tempo em segundos reais**, presa às palavras (`tempo.ts`):
   - `PLANOS` (id + início);
   - `LEGENDAS`;
   - `HUDS`, `SELOS` e `ETIQUETAS`;
   - `TRECHOS_NARRACAO`, para inserir respiros cortando a narração num silêncio medido.
3. **Revise um quadro do meio de cada plano** com `node scripts/quadros.mjs <bundle> <Composição> <pasta> 0.25 <quadros…>`. Ele reaproveita o mesmo navegador: cerca de 35 quadros em 35 s.
   - Olhe todos.
   - Corrija enquadramento, pose e luz.
   - Re-renderize só os planos alterados.
   - Só então faça o render completo.
4. **Pós do áudio** (detalhes em "Som").

### Lições de enquadramento (vídeo vertical)

- **Portrait estreita a visão lateral.** Com fov 40, a largura visível é só cerca de 0,4 × a distância.
  - Close de rosto: câmera a cerca de 1,8–2 m.
  - Plano médio (rosto e mãos): cerca de 2,6–3 m.
  - Corpo inteiro: mais de 4 m.
  - Mais perto que isso a câmera "entra" na cabeça.
- **Etiquetas embaixo** (top ≈ 1480), nunca no meio da tela, porque lá cobrem rostos e monumentos.
- **Legendas:** a pontuação gruda na palavra anterior. Nunca deixe "ANOS ," solto.
- **Celular na mão:** a tela fica virada para o personagem, então ilumine o rosto com uma luz no celular.
- **Personagem deitado:** câmera de cima, com `rolo` para o rosto ficar em pé na tela.
- **Monumentos low-poly** precisam de proporção real (Eiffel: base de 11 m, 30 m de altura, treliça em X, curva mais forte no alto). Afaste nuvens e objetos que fiquem entre a câmera e o assunto.
- **Sala escura:** ponha luz de preenchimento (hemisphere + direcional). Se não, só o telão aparece.
- **Explosão:** pedaços pequenos e numerosos, e o núcleo some rápido. Um núcleo grande e translúcido deixa a tela cinza.
- **Coisas lado a lado não cabem na tela vertical** (aprendido no vídeo do Imortal): a largura visível é ~0,4 × a distância. Três retratos: em pirâmide (dois em cima, um embaixo). Dois personagens frente a frente (xadrez): câmera no eixo deles, um de costas perto e o outro de frente longe. Planeta inteiro: câmera a ~6 × o raio.
- **Personagem deitado de barriga para cima** olha para o teto: a câmera vem de cima do travesseiro, senão só aparece o topo da cabeça ou a cabeceira tampa.
- **Primeira pessoa olhando para baixo** (queda): "na frente" é −y; os braços entram pelas bordas da tela (mãos a ~0,2 do centro, a 0,6 abaixo da câmera).
- **Texto no topo + personagem embaixo:** mire a câmera acima do personagem (alvo mais alto) para ele cair na metade de baixo da tela; deixe a pergunta de abertura abaixo do HUD (top ≈ 410).
- **Cor misturada em THREE.Color.lerp é linear:** amarelo → vermelho dá salmão no meio. Para "gigante vermelha" use o vermelho puro.
- **Vapor, fumaça e objetos do cenário** atravessam os planos em primeira pessoa: tire o que fica entre a câmera e o assunto.
- **Música mais curta que o vídeo:** `scripts/musica-imortal.mjs` estende a faixa emendando onde a batida combina (correlação do envelope) e gera a versão abafada sincronizada para os climas.

### Som (pedido do usuário)

- **Música de fundo: faixa pronta, animada mas tranquila, quase imperceptível** (o usuário recusou a lo-fi sintetizada, a trilha de documentário sintetizada e uma pop a 120 BPM alta demais). Use música produzida de verdade, com licença livre para vídeo: Mixkit (https://mixkit.co/free-stock-music/; lista em JSON-LD na página de cada tag, MP3 em assets.mixkit.co/music/ID/ID.mp3). Prefira ~95–110 BPM, volume constante, pouca energia na faixa da voz (300–3.400 Hz), sem vocal, e corte os agudos acima de ~4,5 kHz antes de usar. No 1º vídeo: "Coffee or Tea" (Michael Ramir C.). **A música nunca chama mais atenção que a narração, os efeitos ou o vídeo**: ~30 dB abaixo da voz enquanto alguém fala e ~22 dB abaixo nos respiros, abaixando sozinha. "Se ninguém notar a música, está certo."
- **Nada de chiado contínuo** (burburinho de gente, vento, ondas, "espaço"): ruído por baixo da voz soa como sussurro e o usuário odeia. Sons de ambiente só com timbre definido (coração, fervura, zumbido), baixos.
- **Efeitos sonoros em todo momento importante** (corte de cena, pulo, impacto, motor, relógio, sino), com qualidade, duração e volume cuidados, entrando no quadro exato da ação. Os efeitos ficam à frente da música. **Nada extravagante**: whooshes curtos e baixos e um golpe forte só no clímax.
- **Efeitos sintetizados:**
  - `scripts/sintese.mjs` reúne as funções de síntese: filtros, reverb, whoosh e WAV.
  - `scripts/sons-gravidade.mjs` e `scripts/sons-namorada.mjs` geram os efeitos de cada vídeo. O segundo tem ding, ping, mensagem, vidro rachando, estrondo, passo, ronco grave em loop, explosão, teclado, alarme e medalha.
  - Também dá para usar os sons livres (CC0) da Kenney (repositório `kapishdima/soundcn`, pasta `assets`), convertidos para WAV.
- **Variante de humor:**
  - **Música: uma faixa só, de boa e CONSTANTE**, para o vídeo nunca ficar calado. O usuário reclamou do narrador falando "sem nada no fundo". Ele quer um vídeo fluido, constante e com dinamismo.
  - Use "Coffee or Tea" (`public/gravidade/sons/musica-coffee-or-tea.wav`) com abaixamento pequeno: ~23 dB abaixo da voz na fala e ~19 dB nos respiros.
  - Não corte a música na explosão: só uma respirada curta (cai para 25% e volta em ~1,5 s).
  - **Fade out no fim (pedido do usuário):** a música desce devagar nos últimos ~4 s, a partir de quando o narrador termina, em curva (1−x)^2,2, com degraus de volume finos para não soar em escadinha.
  - **PROIBIDAS (o usuário odiou, nunca usar):**
    - tambores de tensão ("Epical Drums");
    - "Games Music" (trailer);
    - "Kidding Around" (infantil/cômica);
    - trocar de música no meio do vídeo (abertura impactante + parte engraçada).
  - Terremoto: só ronco grave (passa-baixa ~75 Hz), nada de chiado.
- **O usuário quer MUITOS efeitos, sutis e no quadro exato.** Lista que funcionou no vídeo da namorada:
  - whoosh em cada corte;
  - blip quando HUD, selo ou etiqueta entra (gerado direto das listas de `tempo.ts`);
  - "errado!" baixinho no telão;
  - tique-taque às 2 da manhã;
  - ding, plop e teclado nas mensagens;
  - "dum" grave nas revelações;
  - **onda de choque** (`onda-de-choque.wav`): golpe seco + ar empurrado que abre de lado a lado e fica grave + cauda com brilho. O usuário pediu algo "estrondoso, mas de onda se espalhando", diferente do terremoto;
  - pops dos corações;
  - brilhinhos na mãe e na medalha;
  - vidro rachando;
  - pedra rachando, estrondo, ronco e desmoronamento;
  - rangido de metal + mola na Eiffel;
  - alarme;
  - lasers em sequência;
  - riser até a explosão.
- **Antes de usar uma música**, corte os agudos com `node scripts/suavizar-musica.mjs entrada.wav saida.wav segundos`.
- **Nunca mexa na voz aprovada.** No pós, extraia o áudio do render e rode `node scripts/volume-final.mjs mix.wav saida.wav <ganhoDb> -1.8`. Ele aplica ganho linear com um limitador de pico e mostra em que segundos o limitador agiu.
  - Escolha o maior ganho em que o limitador só pega efeitos (estrondo, explosão), nunca a fala.
  - Depois, junte vídeo e áudio com `-c:v copy -c:a aac`.
  - Isso dá cerca de −16 a −17 LUFS, e tudo bem.
  - O loudnorm dinâmico (de uma passada) comprime e muda a entonação do locutor: não use.
- **O ffmpeg do Remotion é mínimo.** Tem loudnorm, volume e silencedetect. Não tem alimiter, lowpass, tile nem rawvideo. Por isso esses passos são feitos em Node.
