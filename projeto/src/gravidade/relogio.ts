import { createContext, useContext } from "react";

// Tempo-guia do quadro atual (ver MAPA_TEMPO em tempo.ts) e o frame real, para animações contínuas
// (piscar, respirar) que não devem acelerar nem frear junto com o mapa.
export const TempoGuia = createContext({ s: 0, frame: 0 });
export const useTempoGuia = () => useContext(TempoGuia);
