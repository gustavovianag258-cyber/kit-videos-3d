import { clipe } from "./falas";

// Começo de cada cena, preso às falas.
const ini = (id: string) => clipe(id).inicio;
export const S = {
  ceu: ini("n-ceu") - 0.1,
  laje: ini("n-kaique"),
  osso: ini("n-osso"),
  regra: ini("n-regra"),
  fisica: ini("n-fisica1") - 0.1,
  pizza: ini("n-vantagem"),
  portaria: ini("e-andar") - 0.3,
  fila: ini("n-escolhe") - 0.1,
  ruim: ini("n-ruim") - 0.1,
  esqueleto: ini("n-esqueleto") - 0.1,
  celular: ini("o-encomenda") - 0.6,
  caixa: ini("n-ninguem") - 0.1,
  final: ini("n-parte2") - 0.1,
};
