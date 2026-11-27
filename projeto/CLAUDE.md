# CLAUDE.md — Canal "E se…?" (vídeos 3D em bloco)

Projeto Remotion + Three.js (`three`, `@react-three/fiber`, `@remotion/three`) para vídeos verticais **1080x1920, 30 fps**. Já está configurado: não recrie nem reinstale. Prévia: `npm run dev`. Só pergunte ao usuário antes de instalar algo **fora desta pasta**.

## Permissão total: skills e MCPs

Você pode usar **todas as skills instaladas** e **todos os MCPs/integrações conectados**, sem pedir licença. No início de cada vídeo, liste as skills e as ferramentas `mcp__*` disponíveis e use tudo o que ajudar. Esta lista é um ponto de partida, não um limite.

### Skills do canal (obrigatórias em todo vídeo)
- `videos-e-se`: formato padrão dos vídeos (pergunta "E se…?" no 1º segundo, escalada, HUD, legendas, som, produção).
- `roteiros-curtos`: qualidade do roteiro (planejamento, diálogos naturais, revisão crítica, formato por cenas).
- `visual-cinematico`: padrão visual (estilo Culturaverso, aprovado em 02/11/2026): personagens `Boneco` escritos em código, kit de cenários com muito detalhe, kit de câmeras (voo contínuo, primeira pessoa, ombro, close, olho de Deus…), serifa elegante e HUD de anel fino.

### Skills do Remotion (em `.claude/skills/`)
- `remotion-best-practices`: roteador de todas as skills do Remotion; comece por ela.
- `remotion-create`: criar um vídeo novo.
- `remotion-markup`: conteúdo, animação e efeitos.
- `remotion-captions`: transcrever, exibir e animar legendas.
- `remotion-multimedia`: áudio e vídeo (Mediabunny).
- `remotion-studio`: prévia no Studio.
- `remotion-render`: exportar o vídeo.
- `remotion-docs`: buscar na documentação.
- `remotion-interactivity`, `remotion-maps`, `remotion-saas`, `remotion-upgrade`: use quando o caso pedir.

### Skills globais (use quando ajudarem)
- Arte e design: `artifact-design`, `artifact-diagramming`, `dataviz` (cartazes, HUD, gráficos).
- Navegador e computador: `anthropic-skills:built-in-browser`, `anthropic-skills:chrome-browser`, `anthropic-skills:computer-use` (pesquisar fatos, conferir referências).
- Pesquisa: `anthropic-skills:deep-research`.
- Documentos: `anthropic-skills:docx`, `anthropic-skills:pdf`, `anthropic-skills:pptx`, `anthropic-skills:xlsx`, `anthropic-skills:docs`.
- Código: `code-review`, `simplify`, `run`, `security-review`.
- Rotinas: `loop`, `schedule`.
- Se surgir uma skill nova ou mais adequada, use-a.

### MCPs (integrações)
- **ElevenLabs** (`creative_*`): voz (`creative_list_voices`, `creative_design_voice`, `creative_get_voice_design_previews`, `creative_save_designed_voice`, `creative_generate_speech`), transcrição com tempo por palavra (`creative_transcribe_audio`), e geração de mídia em fluxos (`creative_generate_in_flow` e relacionados).
- Navegador (`mcp__Claude_Browser__*`, `mcp__claude-in-chrome__*`): pesquisa e conferência de fatos.
- Terminal e arquivos: render, ffmpeg, scripts.
- Qualquer outro MCP de imagem, vídeo, som ou música conectado.

## Regras fixas do canal

- **Estilo (aprovado em 02/11/2026, igual ao canal Culturaverso — que também é Claude Code + Remotion + Three.js; detalhes na skill `visual-cinematico`):**
  - **Personagens:** `src/cinema/Boneco.tsx` (gente escrita em código: pele lisa, rosto de desenho que pisca e fala, roupa de cor sólida, cabelos variados, 25 animações do Mixamo). Quaternius, Mixamo realista, IA (FLUX/TRELLIS) e Meshy foram REPROVADOS.
  - **Cenários:** `src/cinema/kit/` — `Ambiente` com 7 horas do dia (manhã, dia, tarde, entardecer, noite, céu em chamas, interior), `Rua`, `Calcadao`, `Praia`, `Mercadinho`, `Parque`, `Cidade` (vista de cima). **Atenção aos detalhes sempre** (janela com moldura e veneziana, loja com salão de verdade, mesas de bar, fios, manchas na parede…). Lugar novo = mesmo padrão de detalhe.
  - **Câmera:** `src/cinema/kit/Cameras.tsx` + `<Boneco primeiraPessoa naMao>` — misturar voo contínuo que entra e sai dos lugares, primeira pessoa com as mãos, por cima do ombro, close de reação, olho de Deus, rente ao chão, órbita, passagem de tempo, maquete explicativa e rajadas de cortes rápidos nos impactos.
  - Testes de referência: composições `EstiloCameras`, `EstiloRuaDetalhe`, `EstiloCenarios`, `EstiloBoneco` (bundle em `build-estilo`, render com `--timeout=180000 --concurrency=3`).
- **Pergunta "E se…?" na tela no 1º segundo**, em **serifa elegante branca com a palavra-chave em itálico** (nada de Anton 3D amarelo). Pergunta concreta: hipótese + lugar real do Brasil + horário movimentado.
- **Legendas** curtas no terço inferior, em serifa branca com sombra suave (palavra-chave em itálico), sincronizadas com a voz.
- **HUD minimalista, sem caixa**: anel fino de progresso, rótulo pequeno espaçado, número grande em fonte fina, linha de lugar/hora.
- **Dinamismo:** corte novo a cada 1–2 s, câmera sempre em movimento, **primeira pessoa** sempre que der, elementos 3D reais (Three.js), muita gente e vida, transições com personalidade (nada de fade genérico).
- **Voz (ElevenLabs):** homem jovem brasileiro, tom de conversa, rápido, humor seco; nada robotizado nem de locutor. Gerar por frase, testar 2–3 vozes com o usuário antes. **Nunca mexa na voz aprovada.** Normalize o áudio final para ~−14 LUFS com ganho **linear** (loudnorm em 2 passadas com `linear=true`); sem compressão dinâmica na voz.
- **Som:** efeito em todo corte e momento importante, entrando no quadro exato; tratamento por cena (reverb curto no quarto, eco frio no espaço). **Música** pronta e livre (Mixkit), tranquila, ~30 dB abaixo da voz, sem vocal, quase imperceptível. **Proibido chiado contínuo** por baixo da voz.
- **Ciência:** a hipótese pode ser impossível, mas as consequências seguem a física real ou a ficção é declarada na tela. Confira números e fatos antes de renderizar; nunca invente estatística.
- **Marca:** use o @ do usuário (pergunte na entrega se não souber). Nunca use marca, cartaz ou falas de outro canal. Use técnicas de referências, nunca as cenas ou falas delas.
- **Chamada final padrão:** pedir nos comentários o próximo "E se" (com crédito ao seguidor quando a ideia vier dele).

## Código do projeto

- Cada vídeo numa pasta própria em `src/` e registrado em `src/Root.tsx`. Existentes: `src/v2/`, `src/cenas/`, `src/gravidade/`, `src/namorada/`, `src/imortal/`.
- **Reaproveite antes de criar:** `src/v2/ui.tsx` (Legendas, Vinheta, FiltroCor, TextoFinal, Recapitulacao), `src/v2/Diagramas.tsx`, `src/v2/tempo.ts`, `src/v2/mundo.tsx` (Camera, Estrelas), `src/legendas.ts`; do vídeo de gravidade: `texto3d.tsx`, `ui.tsx` (Pergunta, HUD, cartaz), `CenaRua.tsx`, `vida.tsx`, `sons.tsx`; do vídeo da namorada: `Bloco.tsx` (personagens em bloco), `Globo.tsx`, `Mundo.tsx`, `Quarto.tsx`.

## Vídeos em andamento

- **Projeção astral** (`src/astral/`, composição `ProjecaoAstral`): cópia fiel, traduzida, de um reel gringo (`Downloads/copy-videos.inst`). Visual em blocos igual ao original, mãos de fantasma em camada própria (`maos.tsx`). Regras dessa variante na skill `videos-e-se` ("cópia fiel de vídeo gringo"). V1 em `out/astral/`.

- **Imortal**: ARQUIVADO (o usuário não gostou do resultado na prática). Não retomar sem ele pedir.
- **Próximo vídeo:** o usuário vai trazer uma ideia nova. Roteiro primeiro (feito aqui, com `roteiros-curtos` + `videos-e-se`), aprovado por ele, depois voz e vídeo no padrão novo.
- **Página do usuário: Mundo Paralelo.br — @mundoparalelo.br.** Todo vídeo termina com o cartaz "Siga nas redes / MUNDO PARALELO / @mundoparalelo.br / Comenta a sua ideia pro próximo vídeo. A melhor vira vídeo." (`CartazPagina` em `src/astral/ui.tsx`, fala pronta em `public/astral/voz/fcartaz.wav`).

