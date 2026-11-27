// Tempo por palavra (faster-whisper local + silêncios medidos na forma de onda), com o texto
// corrigido pelo roteiro. Tempos em segundos dentro de cada arquivo de public/aurora-ep5b/voz.
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
E|0.0|0.14 se|0.14|0.2 cê|0.2|0.36 acordasse|0.36|0.86 amanhã|0.86|1.24 invencível…|1.24|2.12 e|2.12|2.58 te|2.58|2.7 enterrassem|2.7|3.22 vivo?|3.22|3.56
O|3.94|4.12 Denis|4.12|4.4 não|4.4|4.6 quebra.|4.6|4.98 Mas|5.34|5.54 oitenta|5.54|6.06 quilos|6.06|6.48 continuam|6.48|7.04 sendo|7.04|7.26 oitenta|7.26|7.74 quilos.|7.74|8.26
Quatro|8.54|8.86 agentes|8.86|9.28 levaram|9.28|9.76 ele|9.76|9.92 igual|9.92|10.18 saco|10.18|10.72 de|10.72|10.82 cimento.|10.82|11.32
Acordou|11.6|12.08 num|12.08|12.2 galpão,|12.2|12.7 dentro|12.7|13.12 de|13.12|13.32 uma|13.32|13.44 forma|13.44|13.8 de|13.8|13.96 madeira.|13.96|14.38
Em|14.66|14.84 volta,|14.84|15.08 um|15.4|15.52 monte|15.52|15.86 de|15.86|16.02 bloco|16.02|16.34 de|16.34|16.46 concreto,|16.46|16.9 cada|17.18|17.42 um|17.42|17.72 com|17.72|17.84 um|17.84|17.96 número.|17.96|18.28
Só|18.62|18.84 que|18.84|18.96 a|18.96|19.04 física|19.04|19.36 cobra.|19.36|19.86
Concreto|20.26|20.58 fresco|20.58|21.14 pesa|21.14|21.46 mais|21.46|21.66 que|21.66|21.82 o|21.82|21.88 dobro|21.88|22.3 da|22.3|22.48 água.|22.48|22.76
O|23.12|23.2 corpo|23.2|23.42 boia,|23.42|23.88 a|24.16|24.2 tampa|24.2|24.56 segura,|24.56|24.98 e|24.98|25.34 ele|25.34|25.44 aperta|25.44|25.86 o|25.86|25.98 peito.|25.98|26.3
Cada|26.62|26.84 respirada|26.84|27.46 entra|27.46|27.74 menor.|27.74|28.12
E|28.48|28.66 concreto|28.66|29.08 não|29.08|29.26 seca:|29.26|29.74 ele|30.1|30.18 cura.|30.18|30.72
É|30.96|31.02 reação|31.02|31.28 química.|31.28|31.78 Esquenta,|32.14|32.6 e|32.6|32.98 em|32.98|33.1 poucas|33.1|33.5 horas|33.5|33.84 vira|33.84|34.16 pedra.|34.16|34.56
Aí|34.92|35.12 deu|35.12|35.3 ruim.|35.3|35.56 Chegou|35.96|36.22 na|36.22|36.38 boca.|36.38|36.68
Aí|37.18|37.4 veio|37.4|37.66 o|37.66|37.8 apito.|37.8|38.2 E|38.5|38.66 a|38.66|38.74 luz|38.74|38.86 apagou.|38.86|39.34
Mais|39.68|39.86 de|39.86|40.04 vinte|40.04|40.44 toneladas|40.44|41.02 de|41.02|41.26 ré,|41.26|41.52 em|41.52|41.8 cima|41.8|42.08 de|42.08|42.2 uma|42.2|42.3 forma|42.3|42.64 mal|42.64|42.94 escorada.|42.94|43.52
Só|43.72|43.96 que|43.96|44.08 ninguém|44.08|44.32 contou|44.32|44.78 pra|44.78|44.9 ele|44.9|45.08 uma|45.08|45.24 coisa…|45.24|45.66
essa|46.12|46.36 não|46.36|46.64 foi|46.64|46.96 a|46.96|47.06 primeira|47.06|47.28 vez.|47.28|47.64
Em|48.1|48.2 oitenta|48.2|48.5 e|48.5|48.56 nove,|48.56|48.8 o|49.34|49.36 céu|49.36|49.56 já|49.56|49.76 tinha|49.76|50.02 ficado|50.02|50.4 verde.|50.4|50.74
E|51.22|51.26 o|51.26|51.34 governo|51.34|51.68 também|51.68|52.18 tava|52.18|52.5 contratando.|52.5|53.18
Continua|53.52|54.0 na|54.0|54.1 parte|54.1|54.26 três.|54.26|54.6
`);

export const denis = lista(`
Moço,|0.0|0.5 eu|0.5|0.86 tenho|0.86|1.06 laje|1.06|1.46 pra|1.46|1.62 bater|1.62|1.86 amanhã!|1.86|2.5
Esse|2.85|2.98 concreto|2.98|3.4 tá|3.4|3.58 aguado.|3.58|4.08 E|4.3|4.56 essa|4.56|4.7 forma|4.7|5.0 tá|5.0|5.16 mal|5.16|5.34 escorada,|5.34|5.92 vai|5.92|6.12 estourar.|6.12|6.62
Caralho,|6.88|7.42 tá|7.42|7.66 apertando!|7.66|8.3
(tosse)|8.58|9.09 Porra…|9.3|9.8 eu|9.8|10.18 falei|10.18|10.52 que|10.52|10.66 ia|10.66|10.76 estourar.|10.76|11.34
Quem|11.72|11.86 é|11.86|12.02 o|12.02|12.04 senhor?|12.04|12.5
E|12.81|12.9 aqueles|12.9|13.08 blocos|13.08|13.48 lá|13.48|13.66 do|13.66|13.74 galpão?|13.74|14.14
Puta|14.58|14.98 merda.|15.02|15.6
`);

export const agente = lista(`
Anota|0.0|0.38 aí.|0.38|0.6
É|1.12|1.18 simples,|1.18|1.58 seu|1.68|1.82 Denis.|1.82|2.04 O|2.52|2.6 senhor|2.6|2.78 não|2.78|2.96 morre.|2.96|3.38 Só|3.66|3.86 não|3.86|4.0 sai.|4.0|4.28
Assina|4.74|5.06 aqui,|5.06|5.26 seu|5.36|5.48 Edson.|5.48|5.82
`);

export const olheiro = lista(`
Falou.|0.0|0.86 Eu|1.28|1.52 ouvi.|1.52|1.92
Eles|2.4|2.66 têm|2.66|2.86 a|2.86|2.96 mesma|2.96|3.26 lista|3.26|3.64 que|3.64|3.84 eu|3.84|4.04 porque|4.14|4.34 fui|4.34|4.56 eu|4.56|4.78 que|4.78|4.94 fiz.|4.94|5.24
Eu|5.88|6.06 apontava.|6.06|6.68 Eles|7.24|7.38 levavam.|7.38|7.9
Trinta|8.44|8.58 e|8.58|8.64 um.|8.64|8.86 Tudo|9.44|9.52 vivo.|9.52|9.88
Eu|10.42|10.48 preciso|10.48|10.76 de|10.76|10.94 um|10.94|11.02 pedreiro|11.02|11.46 que|11.46|11.58 não|11.58|11.78 quebra.|11.78|12.24
`);

export const edson = lista(`
Trinta|0.0|0.3 anos|0.4|0.78 abrindo|0.78|1.22 portão|1.32|1.66 pros|1.66|1.98 outros…|1.98|2.3 e|2.72|2.88 cês|2.88|3.02 vão|3.02|3.26 me|3.26|3.4 pagar|3.4|3.86 pra|3.86|4.12 atravessar|4.12|4.62 parede?|4.64|5.14
`);
