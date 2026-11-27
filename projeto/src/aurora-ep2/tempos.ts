import { clipe } from "./falas";

// Começo de cada cena, preso às falas.
const ini = (id: string) => clipe(id).inicio;
const fim = (id: string) => clipe(id).fim;
export const S = {
  ceu: ini("n-ceu") - 0.1,
  laje: ini("n-bruno"),
  quarto: ini("n-manha"),
  geladeira: ini("b-geladeira") - 0.2,
  bussola: ini("n-bussola"),
  distancia: ini("n-rua"),
  ponto: ini("n-busao") - 0.1,
  dentro: fim("n-busao") + 0.15,
  ruim: ini("n-ruim") - 0.1,
  atrito: ini("n-atrito"),
  regra: ini("b-respira") - 0.3,
  mensagem: ini("o-final") - 1.0,
  quadra: ini("n-trave") - 0.1,
  sefudeu: ini("b-fudeu") - 0.15,
  final: ini("n-parte2") - 0.1,
};
