import { clipe } from "./falas";

// Começo de cada cena, preso às falas.
const ini = (id: string) => clipe(id).inicio;
const fim = (id: string) => clipe(id).fim;
export const S = {
  captura: ini("n-denis") - 0.1,
  galpao: ini("n-galpao") - 0.15,
  fisica: ini("n-fisica") - 0.1,
  regra: ini("n-cura") - 0.1,
  ruim: ini("n-ruim") - 0.2,
  apito: fim("n-boca") + 2.0,
  cabine: ini("o-ouvi") - 0.5,
  antes: ini("n-vez") - 0.25,
  blocos: ini("d-blocos") - 0.2,
  contrato: ini("n-contrato") - 0.7,
  final: ini("n-parte3") - 0.1,
};
