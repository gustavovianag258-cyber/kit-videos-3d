# Kit de vídeos 3D (Claude Code + Remotion + Three.js)

Este kit tem tudo o que é usado para fazer os vídeos verticais em 3D do canal: as **skills** que ensinam o Claude o formato e o visual, e o **projeto de código** com os personagens, os cenários, as câmeras e os scripts de som.

Os vídeos são feitos pelo **Claude Code**: você pede o vídeo em português, e ele escreve o roteiro, gera a narração, monta as cenas em código e renderiza o MP4.

## O que tem aqui

```
kit-videos-3d/
├── skills/                      ← copiar para a pasta de skills do Claude
│   ├── videos-e-se/             formato "E se…?" em 3D (estrutura, narração, som, produção)
│   ├── visual-cinematico/       padrão visual: Boneco, kit de cenários, câmeras, texto e HUD
│   ├── mundo-paralelo-noticias/ vídeos de notícia com narrador 3D
│   └── roteiros-curtos/         qualidade do roteiro (gancho, diálogos, revisão)
└── projeto/                     ← o projeto Remotion (abrir esta pasta no Claude Code)
    ├── CLAUDE.md                regras do canal que o Claude lê sozinho
    ├── .claude/skills/          skills oficiais do Remotion
    ├── src/                     código de todos os vídeos
    │   ├── cinema/              Boneco.tsx (personagens) e kit/ (cenários, luz, câmeras)
    │   ├── gravidade/ namorada/ astral/ imortal/ ...  vídeos prontos que servem de modelo
    │   └── Root.tsx             lista de todas as composições
    ├── scripts/                 som, narração, legendas e revisão de quadros
    └── public/hdri, texturas/   céus e texturas (Poly Haven, CC0)
```

## 1. Aplicativos para instalar

No Windows, abra o PowerShell e rode um por vez:

| App | Para que serve | Como instalar |
|---|---|---|
| **Claude (app)** com Claude Code | É quem faz os vídeos | Baixe em https://claude.ai/download e entre com a sua conta (plano Pro ou Max) |
| **Node.js 22** | Roda o Remotion | `winget install OpenJS.NodeJS.LTS` |
| **Git** | Baixar este kit | `winget install Git.Git` |
| **FFmpeg** | Juntar áudio e vídeo, cortar trechos | `winget install Gyan.FFmpeg` |
| **Python 3.12** | Scripts de legenda e tempo das palavras | `winget install Python.Python.3.12` |
| **VS Code** (opcional) | Ver e editar o código | `winget install Microsoft.VisualStudioCode` |

Pacotes de Python usados por alguns scripts:

```powershell
pip install faster-whisper numpy imageio-ffmpeg edge-tts
```

## 2. Contas e conectores

- **ElevenLabs** (voz e transcrição): crie uma conta em https://elevenlabs.io. No app do Claude, vá em **Configurações → Conectores** e adicione o conector da ElevenLabs. As vozes citadas nas skills ("Narrador E se", "Davi Menegon", "Gabriel Euzébio") ficam na biblioteca de vozes da ElevenLabs; busque pelo nome e adicione à sua conta, ou escolha outra.
- **Adobe Mixamo** (animações dos personagens): conta grátis da Adobe em https://www.mixamo.com.
- **Hugging Face** (opcional, só para o caminho reserva de personagem por IA): crie um token e salve em `projeto/.env.local` como `HF_TOKEN=seu_token`. Nunca suba esse arquivo para o GitHub.

## 3. Instalar as skills

Copie as 4 pastas de `skills/` para a pasta de skills do Claude no seu computador:

```powershell
Copy-Item -Recurse skills\* "$env:USERPROFILE\.claude\skills\"
```

Depois, abra o Claude Code e pergunte "quais skills temos aqui?". As quatro devem aparecer.

## 4. Preparar o projeto

```powershell
cd projeto
npm install
```

### Baixar as animações do Mixamo (obrigatório para o `Boneco`)

Os arquivos do Mixamo não vêm no kit, porque a licença da Adobe não permite redistribuí-los. Baixe você mesmo (5 minutos):

1. Entre em https://www.mixamo.com, aba **Animations**, com o personagem padrão (Y Bot).
2. Para cada animação abaixo, busque, clique em **Download**, escolha **FBX Binary**, **With Skin**, 30 fps.
3. Salve em `projeto/public/modelos/mixamo/animacoes/` com **exatamente** estes nomes:

```
idle.fbx  walking.fbx  running.fbx  talking.fbx  laughing.fbx  waving.fbx  pointing.fbx
surprised.fbx  sitting-idle.fbx  texting-while-standing.fbx  clapping.fbx  standing-thumbs-up.fbx
shrugging.fbx  terrified.fbx  sad-idle.fbx  crying.fbx  sitting-talking.fbx  laying-sleeping.fbx
getting-up.fbx  neck-stretching.fbx  jumping.fbx  falling.fbx  treading-water.fbx  drinking.fbx
hip-hop-dancing.fbx
```

O `idle.fbx` é o mais importante: o esqueleto de todos os personagens sai dele.

### Música e efeitos (baixar quando precisar)

- **Música**: Mixkit (https://mixkit.co/free-stock-music/), grátis para vídeo. A usada nos vídeos é "Coffee or Tea" (Michael Ramir C.). Salve em `projeto/public/<pasta-do-video>/sons/`.
- **Efeitos**: os scripts `scripts/sons-*.mjs` e `scripts/sintese.mjs` geram muitos efeitos sozinhos. Para mais, use os sons CC0 da Kenney (https://kenney.nl/assets?q=audio).
- **Céus e texturas**: os 7 céus HDRI já estão em `public/hdri/`. Mais em https://polyhaven.com (CC0).

## 5. Abrir e testar

```powershell
npm run dev
```

Isso abre o **Remotion Studio** no navegador, com a lista de composições. Para ver se está tudo certo, abra estas:

- `EstiloBoneco`: os personagens
- `EstiloCenarios`: os cenários (rua, calçadão, praia, mercadinho, parque, cidade)
- `EstiloCameras`: os tipos de câmera

Os vídeos antigos (gravidade, namorada, astral…) aparecem na lista, mas vão dar erro de arquivo faltando, porque as narrações e músicas deles não vêm no kit. Eles servem como **modelo de código**, não para renderizar de novo.

## 6. Fazer um vídeo

Abra a pasta `projeto` no Claude Code (app do Claude → aba **Code** → escolher a pasta) e peça, por exemplo:

> Quero um vídeo "E se a gravidade caísse pela metade na Avenida Paulista ao meio-dia?"

O Claude vai seguir as skills: primeiro o roteiro (para você aprovar), depois a narração na ElevenLabs, as cenas, a revisão quadro a quadro e o render final em `out/`.

Para renderizar na mão:

```powershell
npx remotion render <NomeDaComposicao> out/video.mp4 --gl=angle --concurrency=2 --timeout=180000
```

## Observações

- As skills citam nomes de canais, vozes e datas de decisões do criador original. Troque o `@` da página, o cartaz final e as vozes pelos seus.
- Em `src/narrador/` está o personagem narrador de um canal específico. As fotos de referência foram retiradas do kit.
- O Remotion é grátis para pessoas e equipes pequenas. Empresas maiores precisam de licença: https://www.remotion.dev/license.
