---
name: mundo-paralelo-noticias
description: Vídeos verticais do canal Mundo Paralelo (@mundoparalelo.br) feitos a partir de notícias, com o narrador-personagem em 3D aprovado explicando dentro da cena. Separado da série AURORA. Use SEMPRE que o usuário pedir um vídeo de notícia, falar em notícia/fato recente, no personagem do narrador, em "Personagem3D" ou nesse novo formato. Junto com roteiros-curtos para o roteiro. Não vale para a série AURORA (skill serie-aurora).
---

# Mundo Paralelo: vídeos de notícia

Frente separada da série AURORA, criada em 06/11/2026. A AURORA está em pausa e tem visual, regras e skill próprios: nada dela entra aqui sem ele pedir. Formato em construção: a primeira decisão de cada coisa nova é do usuário.

## O personagem (aprovado, não mexer na cara dele sem pedido)

- Código: `src/narrador/Personagem3D.tsx` (1,80 m, unidade = metro). Teste de referência: `src/narrador/Teste3D.tsx`.
- Referências: `src/narrador/referencia/` (foto de perfil, corpo inteiro, close e `teste-movimento-aprovado.mp4`). Cópia em `Desktop\Mundo Paralelo Notícias`.
- Forma: peças lisas e arredondadas, braço redondo, pescoço e tronco inteiro. Cabelo castanho cacheado, óculos quadrados, moletom preto com cordão, jeans e tênis. **Sem logo de marca**, embora a foto tenha Nike.
- O que o usuário reprovou neste personagem: tudo em blocos, cubinhos, cabelo vinho e volumoso, e versão 2D em SVG.
- Rosto com anatomia "realista" feita de formas simples fica assustador. O realismo vem de material, luz e cenário.
- Contorno azul da foto: só em abertura e cartaz, como luz de recorte, nunca nas cenas do meio.
- Já tem `joelhoE`/`joelhoD` na pose para andar, e o aro dos óculos não projeta sombra. Boca presa na voz com `bocaEm` e passo em `poseEm`, no `tempo.ts` e no `Video.tsx` do vídeo do El Niño.

## O que ele já aprovou (primeiro vídeo: `src/noticias/el-nino/`, aprovado em 07/11/2026)

- **Pasta:** cada vídeo em `src/noticias/<assunto>/`, arquivos em `public/noticias/<assunto>/`. Entrega em `Desktop\Mundo Paralelo Notícias\Notícias\<assunto>\`.
- **Gancho:** tem de segurar a pessoa, com vontade de viral: pergunta direta ("Sua casa aguentaria…?"), texto grande e ação desde o primeiro segundo. Forte, mas verdadeiro: não dizer "mais forte do que nunca" nem nada que a notícia não confirme.
- **Visual:** muito detalhe, muita ação e realismo. O que a fala cita tem de aparecer de verdade: "beira do rio" pede um rio correndo. Cenário um pouco escuro e fechado, **personagem com a cor normal**: "tudo muito escuro" foi reprovado. O filtro por cena e a luz só dele estão no `Video.tsx`.
- **Legenda:** Montserrat 800, branca com contorno preto, palavra por palavra, com a palavra-chave pulando em cor por assunto. A serifa foi trocada por pedido dele.
- **Som limpo:** efeitos nunca por cima da voz, com `baixaEfeitos` em `tempo.ts`. Nada de plim, pi, tique de corte ou toque de mensagem: só sons naturais, sem música.
- **Voz:** Gabriel Euzébio, numa tomada. Trechos novos entram emendados na narração, gastando só os caracteres novos.
- **Final:** uma pergunta falada que puxa comentários, sem o cartaz "Siga / A melhor vira vídeo". Ele tirou o cartaz neste vídeo; pergunte nos próximos.
- **Erros que apareceram na tela:** escala zero em objeto com luz apaga a imagem inteira. No tempo negativo, `%` dá resto negativo, e isso fechou o olho dele. Rode `blackdetect` no vídeo pronto.

## Como produzir

- 3D real com `PalcoCinema` e `Acabamento` de `src/cinema/Palco.tsx`. O desfoque de fundo só funciona com `ao={0}`; `foco` = distância da câmera até ele.
- `src/cinema/` e `public/hdri/` ainda estão sem commit na pasta do projeto. Não apagar.
- Quadro parado: `npx remotion bundle <entrada> --out-dir build-<nome>` e `npx remotion still build-<nome> <composição> <arquivo> --frame=0 --gl=angle --timeout=180000`.
- Vídeo: `npx remotion render ... --gl=angle --concurrency=2 --timeout=180000`. No teste, 5 s levaram cerca de 15 s; rode em segundo plano. Cada vídeo numa pasta própria em `src/` e registrado em `src/Root.tsx`.
- Referência de formato: o vídeo em `Desktop\Mundo Paralelo Notícias\Referência de formato`. O apresentador fica dentro da cena, de corpo inteiro, fala com a câmera e aponta, e na maior parte do tempo aparece pequeno, porque a demonstração domina o quadro. Pode trocar de roupa conforme o assunto. Usar só a técnica, nunca o personagem, as cenas ou as falas.
- Cenários no mesmo jeito liso, cheios de detalhe. O usuário reprovou "3D barato": mostrar **um quadro parado** de cada cenário novo antes de produzir.
- Sem marca de cantinho.
- Final: extrair o áudio, olhar em que segundos o limitador age com `scripts/volume-final.mjs`, abaixar no mix a fala que passar do resto, e juntar com o ffmpeg do CapCut (`AppData\Local\CapCut\Apps\9.7.0.4153\ffmpeg.exe`). Quadros em folha: esse mesmo ffmpeg tem `tile`.

## Notícia: regras de apuração

- **Toda afirmação de fato vem de fonte conferida.** Pesquise antes do roteiro, com data, e prefira a fonte primária ou mais de um veículo. Liste as fontes no fim do roteiro, junto com o que é fato e o que é contexto ou opinião.
- Nunca invente número, fala, data ou estatística. Se a notícia não confirma, diga que não confirma ou corte.
- Separe na tela e na fala o que é fato, o que é suspeita ou investigação ("segundo a polícia", "é investigado") e o que é explicação do canal. Ninguém é culpado antes de condenação.
- Notícia muda: confira de novo perto de publicar e diga ao usuário a data da última checagem.
- Pessoa real: não invente fala nem cena que pareça registro real. Nada de sangue, vítima identificável nem sensacionalismo com tragédia. Assunto delicado (morte, crime, saúde, eleição): avise o usuário antes de seguir.
- Não reproduza texto de reportagem: escreva com as próprias palavras.

## Roteiro e etapas

Parar pra aprovação entre as etapas, porque o usuário quer economizar crédito e tokens:

1. Notícia e pesquisa com fontes.
2. Roteiro com `roteiros-curtos`, com gancho no primeiro segundo e a duração combinada.
3. Quadro parado dos cenários.
4. Voz, avisando o custo antes: uma tomada por geração, nível -22 LUFS, tempo por palavra com `scripts/aurora-palavras.py`.
5. Vídeo, render e entrega: copiar pra `Desktop\Mundo Paralelo Notícias\Notícias\<assunto>` e abrir no player.

Commit só quando ele pedir, só dos arquivos deste formato, com o seu nome e e-mail de autor.

## Em aberto (perguntar quando chegar a hora)

Duração (o primeiro teve 2:01), voz clonada do próprio usuário nos próximos (o aprovado até agora é o Gabriel Euzébio `r3KkFedJ4n8aabIZ0RFQ`, da AURORA) e nome do quadro. O usuário fala por áudio, em português, e às vezes a mensagem corta.
