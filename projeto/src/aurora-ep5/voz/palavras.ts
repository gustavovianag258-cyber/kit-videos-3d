// Tempo por palavra (faster-whisper local + silêncios medidos na forma de onda), com o texto
// corrigido pelo roteiro. Tempos em segundos dentro de cada arquivo de public/aurora-ep5/voz.
type P = { w: string; s: number; e: number };
const lista = (txt: string): P[] =>
  txt
    .trim()
    .split(/\s+/)
    .map((x) => {
      const [w, s, e] = x.split("|");
      return { w, s: Number(s), e: Number(e) };
    });

export const narrador = lista(`
E|0.0|0.14 se|0.14|0.22 cê|0.22|0.36 acordasse|0.36|0.84 amanhã|0.84|1.27 invencível?|1.44|2.33
Ontem,|2.75|3.18 às|3.41|3.6 três|3.6|3.85 e|3.85|3.95 dezessete,|3.95|4.7 o|4.91|5.02 céu|5.02|5.18 de|5.18|5.32 São|5.32|5.46 Paulo|5.46|5.8 ficou|5.8|6.04 verde.|6.04|6.6
O|7.02|7.18 Denis|7.18|7.36 tava|7.36|7.58 acordado,|7.58|8.16 de|8.38|8.5 vigia|8.5|8.78 na|8.78|8.92 obra.|8.92|9.26 Trinta|9.64|9.88 e|9.88|10.02 quatro|10.02|10.22 anos,|10.22|10.79 pedreiro.|10.93|11.43
De|11.77|11.9 manhã,|11.9|12.28 errou|12.46|12.78 o|12.78|12.92 prego|12.92|13.28 e|13.28|13.38 acertou|13.38|13.76 o|13.76|13.96 próprio|13.96|14.16 dedo.|14.16|14.59
O|14.89|14.98 dedo|14.98|15.2 tava|15.2|15.36 inteiro.|15.36|15.92 O|16.25|16.36 prego,|16.36|16.78 entortou|17.02|17.46 na|17.46|17.6 mão|17.6|17.74 dele.|17.74|18.03
Só|18.39|18.52 que|18.52|18.64 a|18.64|18.7 física|18.7|19.0 cobra.|19.0|19.61 A|19.93|20.0 pancada|20.0|20.42 não|20.42|20.62 some.|20.62|21.05 Gente|21.43|21.76 amassa,|21.86|22.24 e|22.43|22.5 é|22.5|22.62 isso|22.62|22.8 que|22.8|22.94 amortece.|22.94|23.5
O|23.88|23.98 Denis|23.98|24.22 não|24.22|24.44 amassa.|24.44|24.91 Então|25.24|25.38 a|25.38|25.52 pancada|25.52|25.96 inteira|25.96|26.38 volta|26.56|26.72 pra|26.72|26.94 quem|26.94|27.06 bateu,|27.06|27.51 ou|27.82|27.94 vai|27.94|28.08 pro|28.08|28.2 chão.|28.2|28.48
Firmeza.|28.8|29.5 Até|29.65|29.92 o|29.92|30.04 Tião|30.04|30.38 bateu|30.38|30.7 de|30.7|30.78 marreta.|30.78|31.22 Quebrou|31.53|31.92 a|31.92|32.04 marreta,|32.04|32.52 e|32.68|32.74 quase|32.88|33.14 o|33.14|33.32 pulso|33.32|33.58 do|33.58|33.7 Tião.|33.7|34.05
Aí|34.37|34.54 deu|34.54|34.7 ruim.|34.7|34.99 O|35.4|35.48 andaime|35.48|35.72 soltou.|35.72|36.29
Quatro|36.68|36.98 andares,|36.98|37.4 cinquenta|37.66|38.16 e|38.16|38.26 cinco|38.26|38.48 por|38.48|38.72 hora.|38.72|38.96
Corpo|39.37|39.62 de|39.62|39.74 gente|39.74|39.96 amortece.|39.96|40.68 O|41.05|41.14 dele|41.14|41.3 não.|41.3|41.58 Quem|41.97|42.06 levou|42.06|42.3 a|42.3|42.38 pancada|42.38|42.82 foi|42.82|43.03 a|43.12|43.26 calçada.|43.26|43.81
Levaram|44.11|44.42 ele|44.42|44.58 pro|44.58|44.72 hospital|44.72|45.06 mesmo|45.06|45.46 assim.|45.46|45.9
Três|46.31|46.54 agulhas|46.54|46.88 tortas.|46.88|47.45
A|47.74|47.8 enfermeira|47.8|48.24 anotou|48.24|48.55 tudo|48.74|48.84 no|48.84|49.0 sistema.|49.0|49.49
E|49.81|49.9 esse|49.9|50.06 sistema|50.06|50.6 não|50.6|50.68 é|50.85|51.16 só|51.16|51.32 o|51.32|51.42 hospital|51.42|51.74 que|51.74|51.96 lê.|51.96|52.15
Só|52.51|52.64 que|52.64|52.76 o|52.76|52.84 Olheiro|52.84|53.18 já|53.18|53.42 conhecia|53.42|53.84 esse|53.84|54.1 carro.|54.1|54.46
Tava|54.79|54.9 na|54.9|55.02 rua|55.02|55.18 do|55.18|55.32 Jonas.|55.32|55.87
Na|56.09|56.16 portaria|56.16|56.54 do|56.54|56.66 Seu|56.66|56.82 Edson.|56.82|57.27
Na|57.56|57.66 porta|57.81|57.98 do|57.98|58.16 Kaique.|58.16|58.69
Só|59.04|59.14 que|59.14|59.26 ninguém|59.26|59.54 contou|59.54|60.0 pra|60.0|60.1 ele|60.1|60.3 uma|60.3|60.44 coisa…|60.44|60.92
invencível|61.32|62.04 não|62.04|62.26 quebra.|62.26|62.91 Mas|63.32|63.44 também|63.44|63.78 não|63.78|63.96 ficou|63.96|64.18 mais|64.18|64.4 forte.|64.4|64.87 E|65.15|65.24 ainda|65.24|65.5 precisa|65.5|65.98 respirar.|65.98|66.58
Continua|66.92|67.38 na|67.38|67.46 parte|67.46|67.74 dois.|67.74|68.2
`);

export const denis = lista(`
Céu|0.0|0.52 verde.|0.52|1.49 Só|1.72|1.9 falta|1.9|2.2 chover,|2.2|2.95 e|3.1|3.35 amanhã|3.51|3.88 tem|3.88|4.18 laje|4.18|4.44 pra|4.44|4.6 bater.|4.6|5.16
Porra!|5.43|6.08
Ué.|6.68|6.92 Não|7.35|7.54 doeu.|7.54|7.92
Então|8.49|8.74 eu|8.74|8.96 sou|8.96|9.16 uma|9.16|9.3 parede,|9.3|9.82 é|9.88|9.96 isso?|9.96|10.29
Caralho!|10.56|11.33
Tô|12.36|12.82 vivo?|12.82|13.34
Quem|13.59|13.74 é|13.74|13.94 O?|13.94|14.27
Puta|14.7|15.08 merda.|15.08|15.65
`);

export const agente = lista(`
Seu|0.0|0.3 Denis?|0.3|0.68 Departamento|0.94|1.6 de|1.6|1.76 Eventos|1.76|2.2 Atmosféricos.|2.2|3.26 É|3.4|3.52 sobre|3.52|3.74 o|3.74|3.86 céu.|3.86|4.06
Quem|4.44|4.64 não|4.64|4.78 morre,|4.78|5.24 seu|5.26|5.4 Denis,|5.4|5.92 não|6.1|6.3 precisa|6.3|6.62 ser|6.62|6.9 solto.|6.9|7.36
`);

export const olheiro = lista(`
Não|0.0|0.16 abre|0.16|0.42 o|0.42|0.54 portão,|0.54|0.88 pedreiro.|0.96|1.42 Eles|1.78|1.96 têm|1.96|2.18 a|2.18|2.26 mesma|2.26|2.58 lista|2.58|2.92 que|2.92|3.16 eu.|3.16|3.3
`);
