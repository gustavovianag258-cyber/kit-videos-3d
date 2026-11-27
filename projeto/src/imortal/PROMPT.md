# Prompt de produção — "E se você acordasse e não pudesse mais morrer?"

Cole tudo abaixo no Claude que vai produzir o vídeo.

---

## 0. Permissões e ferramentas (leia primeiro)

Você tem permissão para usar **todas as skills instaladas** e **todos os MCPs/integrações conectados**. Não pergunte antes de usar. Antes de começar:

1. Liste as skills disponíveis e carregue, no mínimo: `videos-e-se` (formato do canal), `roteiros-curtos` (qualidade do roteiro), as skills do Remotion em `%USERPROFILE%\videos-3d\.claude\skills\` e qualquer skill de áudio, vídeo, 3D ou design que existir.
2. Liste os MCPs conectados (ferramentas `mcp__*`) e use o que ajudar:
   - **ElevenLabs** (voz): `creative_list_voices`, `creative_design_voice`, `creative_get_voice_design_previews`, `creative_save_designed_voice`, `creative_generate_speech`, `creative_transcribe_audio`.
   - Qualquer MCP de geração de imagem, vídeo, som ou música que esteja conectado: use quando melhorar o resultado.
   - Navegador (para pesquisar e conferir fatos), terminal, arquivos.
3. Só pergunte ao usuário antes de **instalar algo fora da pasta do projeto**.

## 1. Projeto

- Pasta: `projeto/` (já configurada; não recrie nem reinstale).
- Remotion + Three.js (`three`, `@react-three/fiber`, `@remotion/three`), **1080x1920, 30 fps, ~100 s** (cerca de 3000 quadros).
- Crie `src/imortal/` e registre a composição em `src/Root.tsx`.
- **Reaproveite antes de criar:** `src/v2/ui.tsx` (Legendas, Vinheta, FiltroCor, TextoFinal), `src/v2/Diagramas.tsx`, `src/v2/tempo.ts`, `src/v2/mundo.tsx` (Camera, Estrelas), `src/legendas.ts`, e do vídeo de gravidade: `texto3d.tsx`, `ui.tsx` (Pergunta, HUD, legendas, cartaz), `CenaRua.tsx`, `vida.tsx`, `sons.tsx`.
- Prévia: `npm run dev`. Confira quadros-chave antes do render final.

## 2. Estilo (regras fixas do canal)

- **3D estilizado, blocado (low-poly)**, cores saturadas, cenário vivo (nada parado no fundo).
- **Personagens sempre em bloco** (decisão do usuário, para manter a identidade da página). Para dar emoção sem mudar o estilo: iluminação dramática, câmera mais lenta e olhos expressivos nos closes das cenas 4, 7 e 8; envelhecimento mostrado por cabelo branco, postura curvada e mudança de cor. O espaço (cenas 6 a 8) é mais limpo e bonito que o resto, com Terra, estrelas e ∞ bem iluminados, para o boneco quadrado parecer minúsculo diante do universo.
- **Texto em 3D animado**: letras grossas (Anton) com espessura, palavras entrando girando uma a uma, balanço leve, **palavra-chave em amarelo** com "soco" de escala. A pergunta de abertura é 3D e já está na tela no 1º segundo.
- **Legendas curtas** (2 a 6 palavras) no terço inferior, no mesmo estilo 3D.
- **HUD no canto superior esquerdo**: caixa azul-marinho, borda dourada, rótulo pequeno + número grande. Aqui o HUD conta a história em **anos**: IDADE 31 · ANOS IMORTAL (0 → 10 → 40 → 150 → 400 → 3.000 → 1 bi → 100 tri → ∞).
- **Cor acompanha a escalada**: manhã normal → dourado de família → azul frio (séculos) → vermelho (fim da Terra) → preto total (espaço).
- Marca: use o @ do usuário (pergunte na entrega se não souber). Nunca use marca de outro canal.

## 3. Dinamismo (peça central do usuário)

- **Cortes rápidos: um plano novo a cada 1–2 s**, câmera sempre em movimento (zoom lento, órbita, câmera na mão com balanço leve, tremor no caos).
- **Primeira pessoa em várias cenas** (pelos olhos do personagem): a queda do prédio e do paraquedas olhando o chão se aproximar (cena 2), as mãos dele segurando o bebê e depois o filho já grande (cena 3), a vela do bolo vindo na direção do rosto (cena 4), o laser do alienígena vindo na direção da câmera (cena 5), as mãos mexendo as peças de xadrez no escuro (cena 8).
- **Câmeras variadas**: drone sobre o Recife, close no rosto, plano de cima, plano subjetivo, câmera orbitando a Terra.
- **Elementos 3D de verdade** (Three.js), não só fundo plano: tubarões nadando em volta, prédio de 30 andares visto de cima e da queda, Terra com oceanos que evaporam, Sol que incha e fica vermelho, disco voador com raio, estrelas que se apagam uma a uma, símbolo ∞ em 3D com o personagem minúsculo dentro, tabuleiro de xadrez flutuando no vazio.
- **Muita gente e vida**: figurantes reagindo, multidão ao fundo, folhas, pássaros, carros; no futuro, carros voadores. Tudo reage à ação.
- **Transições com personalidade**: whip pan, zoom-through, flash, glitch curto. Nada de fade genérico.

## 4. Voz (ElevenLabs) — nada robotizado

- Voz **masculina jovem, brasileira, tom de conversa**, rápida e segura, **humor seco**, quase sério enquanto conta coisas absurdas. Nunca locutor, nunca empolgado demais.
- Use `creative_list_voices` e teste candidatas; se nenhuma servir, crie com `creative_design_voice` e salve. Mostre ao usuário 2–3 opções curtas (uma frase só) antes de gerar tudo.
- **Gere por frase/cena**, não tudo de uma vez, para controlar emoção e pausa: leveza no humor, mais baixo e lento na cena 4 e na cena 7, seco no alien.
- Reações curtas dos personagens ("Ai!", "Ainda tô aqui.") com voz própria, em tom natural.
- Depois, use `creative_transcribe_audio` para pegar o tempo exato de cada palavra e **sincronizar as legendas palavra a palavra** (formato de `src/legendas.ts`).
- **Nunca mexa na voz aprovada depois**: normalize o áudio final para ~−14 LUFS com ganho **linear** (loudnorm em 2 passadas com `linear=true`, ou só volume). Nada de compressão dinâmica na voz.
- Sem pausa morta: narração corrida, com respiros intencionais só onde o roteiro pede (cena 7).

## 5. Som e efeitos

- **Efeito sonoro em todo corte e momento importante**, entrando no quadro exato da ação: whoosh curto e baixo nos cortes, impacto nos golpes, mordida/água dos tubarões, queda de vento, bip do despertador, "ding" de notificação, sino, bolo/velas, laser do alien, estrondo na Terra, silêncio quase total no espaço.
- **Filtro/tratamento**: reverb curto no quarto, eco longo e frio no espaço, abafado nas cenas de dor, voz mais "seca" na cena 8.
- **Música**: faixa pronta e livre (Mixkit), animada mas tranquila, **~30 dB abaixo da voz**, quase imperceptível, sem vocal, cortar agudos acima de ~4,5 kHz. Troca de clima por cena (leve → emocional → frio → quase silêncio). "Se ninguém notar a música, está certo."
- **Proibido chiado contínuo** (vento, ruído branco, "espaço" com hiss) por baixo da voz. Ambiente só com timbre definido e baixo.
- Efeitos à frente da música; golpe forte só no clímax (fim da Terra).

## 6. Roteiro cena a cena (siga exatamente)

**Regras da hipótese:** o personagem não envelhece e nada o mata (nem sem ar), mas **sente tudo**. Nome do personagem: **Ícaro** (idade 31, mora no Recife).

| Tempo | Cena | Visual | Narração / diálogo | Legenda | HUD |
|---|---|---|---|---|---|
| 0–5 s | 1. Quarto, Recife, segunda 7h | Despertador toca, Ícaro acorda e se espreguiça. Pergunta 3D na tela. | "E se você acordasse amanhã e não pudesse mais morrer?" | E SE VOCÊ **NÃO PUDESSE** MAIS MORRER? | SEG 07:00 · IDADE 31 · ANOS IMORTAL 0 |
| 5–17 s | 2. Os testes | Corte rápido: Boa Viagem cheia de tubarões, prédio de 30 andares, queda sem paraquedas (1ª pessoa). Sempre machucado, mas de pé. | "Você não acredita. Normal. Então testa. Mar de tubarões. Prédio de 30 andares. Paraquedas? Sem paraquedas. Doeu. Muito. Mas você continua aqui." / Ícaro: "Ai! …Ainda tô aqui." | TESTE 1·2·3 / **DOEU.** MAS NÃO MORREU. | ÍCARO · QUEDA LIVRE · 200 km/h SEM PARAQUEDAS |
| 17–24 s | 3. Casa, 10 anos depois | Ainda 31; esposa e filhos pequenos no almoço, depois adolescentes (mãos na 1ª pessoa). | "Dez anos depois, você ainda tem 31. Casou. Teve filhos. Vê eles crescerem." | 10 ANOS DEPOIS: **AINDA 31.** | ANOS IMORTAL 10 |
| 24–36 s | 4. As famílias | Velório em câmera lenta, filho de cabelo branco, nova casa, nova família; velas de aniversário em sequência (1ª pessoa). | "Aí os filhos envelhecem. E você não. Você recomeça. Duas vezes. Três. Já foi em quatrocentos aniversários. Já cansou de bolo." | 3 FAMÍLIAS / **400** ANIVERSÁRIOS | 40 → 80 → 150 → 400 |
| 36–48 s | 5. Alienígenas | Séculos depois, carros voadores; disco voador invade; aliens atiram nele (laser vindo na câmera), nada acontece. | "Passam séculos. Chegam os alienígenas. Invadem a Terra. E atiram em você. Nada." / Alien (legendado): "Por que ele não morre?" / Ícaro, cansado: "Já tentei de tudo, parceiro." | ALIENS vs **IMORTAL** · ILUSTRAÇÃO (NÃO É CIÊNCIA) | ANOS IMORTAL 3.000 |
| 48–60 s | 6. O fim da Terra | Terra esvaziando; oceanos evaporam; Sol incha e fica vermelho; a Terra se desfaz; Ícaro sai flutuando. Clímax visual, câmera no limite, golpe forte. | "Um dia, não sobra mais ninguém. Só você. Em 1 bilhão de anos, os oceanos evaporam. Em 5, o Sol incha. A Terra acaba. Você não." | SÓ SOBROU **VOCÊ.** | 1 BILHÃO → 5 BILHÕES |
| 60–72 s | 7. Espaço, silêncio | Ele flutuando, minúsculo; estrelas se apagam uma a uma. **4 s de silêncio** só com som do espaço (sem chiado). | (depois do silêncio) "Passam trilhões de anos. As últimas estrelas se apagam." | AS ÚLTIMAS **ESTRELAS** SE APAGAM | 100 TRILHÕES DE ANOS |
| 72–85 s | 8. O infinito | Escuro total, close no rosto; conta nos dedos; joga xadrez sozinho (mãos em 1ª pessoa); surge o ∞ em 3D e ele fica pequeno dentro. | "Escuro total. Você já contou até um milhão. Já ganhou de você mesmo no xadrez, dos dois lados. E o tempo vira… infinito." | JÁ GANHOU **DE SI MESMO.** | ÍCARO · IDADE 31 · ∞ ANOS IMORTAL |
| 85–95 s | 9. Volta ao real | Corte seco: quarto do Recife, de manhã, despertador toca; ele sorri, normal. Imagem calma. | "Na vida real, o recorde humano é 122 anos. Parece pouco. Mas é o prazo que faz a gente ligar pra mãe hoje." | RECORDE REAL: **122 ANOS** | — |
| 95–100 s | 10. Chamada | Terra pequena e calma ao fundo; selo 3D "E SE…?" e caixa "PRÓXIMO E SE: VOCÊ DECIDE" com seta para os comentários; @ do usuário; "ding" de notificação. | "Qual vai ser o próximo 'E se'? Deixa nos comentários. A gente usa a sua ideia." | QUAL SERÁ O **PRÓXIMO** "E SE"? / DEIXA NOS **COMENTÁRIOS** | — |

## 7. Ciência (confira antes de renderizar)

- Real: velocidade de queda humana ~200 km/h; recorde de longevidade 122 anos (Jeanne Calment); oceanos evaporam em ~1 bilhão de anos.
- Simplificações a manter sinalizadas: Sol que "incha" (incerto se engole a Terra ou só a torra); "100 trilhões de anos" é estimativa aproximada para o fim das estrelas.
- Ficção declarada na tela: alienígenas, sobreviver no vácuo.
- **Verificar:** risco de tubarões em Boa Viagem (Recife) antes de gravar; se não se sustentar, trocar por outro mar com tubarões e manter a piada.

## 8. Entrega

1. Mostre as 2–3 vozes de teste e espere o OK do usuário.
2. Gere voz, efeitos e música; monte a composição; confira quadros-chave de cada cena.
3. Renderize o MP4 vertical, normalize o áudio (~−14 LUFS, linear) e entregue o arquivo.
4. Na entrega, liste em poucas linhas o que mudou em relação a este prompt e o que ficou pendente (por exemplo, o @ do perfil).
