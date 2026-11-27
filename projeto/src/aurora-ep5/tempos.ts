import { clipe } from "./falas";

// Começo de cada cena, preso às falas.
const ini = (id: string) => clipe(id).inicio;
const fim = (id: string) => clipe(id).fim;
export const S = {
  ceu: ini("n-ceu") - 0.1,
  laje: ini("n-denis"),
  obra: ini("n-martelo"),
  fisica: ini("n-fisica1") - 0.1,
  marreta: ini("n-tiao"),
  andaime: ini("n-ruim"),
  queda: ini("n-queda") - 0.05,
  calcada: ini("n-corpo") - 0.1,
  hospital: ini("n-hospital") - 0.1,
  noite: fim("n-le") + 0.2,
  olheiro: ini("n-olheiro") - 0.2,
  prancheta: fim("n-kaique") + 0.12,
  quarto: ini("o-lista") - 0.3,
  caminhao: fim("d-quem") + 0.3,
  final: ini("n-parte2") - 0.1,
};
