import { clipe } from "./falas";

// Começo de cada cena, preso às falas.
const ini = (id: string) => clipe(id).inicio;
const fim = (id: string) => clipe(id).fim;
export const S = {
  ceu: ini("n-ceu") - 0.1,
  guarita: ini("n-edson"),
  lixo: ini("n-lixo"),
  porta: ini("n-porta") - 0.2,
  fisica: ini("n-fisica"),
  folego: ini("n-ar"),
  parede: ini("n-atrito"),
  portao: ini("n-travou") - 0.1,
  queda: ini("n-ruim") - 0.1,
  rolha: ini("e-puta") - 0.5,
  bruno: ini("n-portao"),
  livro: fim("e-filho") + 0.3,
  casa: ini("n-apneia") - 0.1,
  final: ini("n-parte2") - 0.1,
};
