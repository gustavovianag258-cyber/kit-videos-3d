import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Vinheta } from "../v2/ui";
import { CenaRua } from "./CenaRua";
import { CenaEspaco, CenaLaser, CenaLua, CenaPanela } from "./CenasLonge";
import { TempoGuia } from "./relogio";
import { Sons } from "./sons";
import { CENAS, clamp, FPS, MARCOS, paraGuia, REACOES, seg, TEM_NARRACAO, TRECHOS_NARRACAO } from "./tempo";
import { Alerta, CartazFinal, Etiqueta, Hud, Legendas, Pergunta, Promessa, Tinta } from "./ui";

// "E se a gravidade caísse pela metade?" — versão de teste.
// Cada bloco é um trecho contínuo de câmera (em tempo-GUIA); a Paulista volta várias vezes.
const BLOCOS: { inicio: number; fim: number; Cena: React.FC<{ inicio: number }> }[] = [
  { inicio: 0, fim: 44, Cena: CenaRua },
  { inicio: 44, fim: CENAS.frio.inicio, Cena: CenaPanela },
  { inicio: CENAS.frio.inicio, fim: CENAS.frio.fim, Cena: CenaRua },
  { inicio: CENAS.lua.inicio, fim: CENAS.lua.fim, Cena: CenaLua },
  { inicio: CENAS.terra.inicio, fim: MARCOS.paulistaCongelada, Cena: CenaEspaco },
  { inicio: MARCOS.paulistaCongelada, fim: CENAS.terra.fim, Cena: CenaRua },
  { inicio: CENAS.real.inicio, fim: CENAS.real.fim, Cena: CenaLaser },
  { inicio: CENAS.final.inicio, fim: Infinity, Cena: CenaRua },
];

export const VideoGravidade: React.FC = () => {
  const frame = useCurrentFrame();
  const real = frame / FPS;
  const s = paraGuia(real);
  const q = MARCOS.quedaGravidade;
  const bloco = BLOCOS.find((b) => s >= b.inicio && s < b.fim) ?? BLOCOS[BLOCOS.length - 1];

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TempoGuia.Provider value={{ s, frame }}>
        <bloco.Cena inicio={bloco.inicio} />
      </TempoGuia.Provider>

      {/* Clima por cima da imagem */}
      <Tinta cor="#ffffff" opacidade={interpolate(s, [q, q + 0.05, q + 0.35], [0, 0.45, 0], clamp)} />
      <Tinta
        cor="#bcd7ff"
        modo="soft-light"
        opacidade={
          s >= CENAS.frio.inicio && s < CENAS.frio.fim
            ? interpolate(s, [47, 50], [0, 0.6], clamp)
            : s >= MARCOS.paulistaCongelada && s < CENAS.terra.fim
              ? 0.6
              : 0
        }
      />
      <Vinheta forca={0.45} />

      {/* Textos (as legendas seguem a narração, em tempo real) */}
      <Pergunta segundos={s} />
      <Etiqueta segundos={s} texto="BIA" inicio={4.2} fim={7.2} topo={1500} />
      <Promessa segundos={s} />
      <Alerta segundos={s} inicio={25.4} fim={27.6} texto="SEM ADERÊNCIA" />
      <Legendas segundos={real} />
      <Hud segundos={s} />
      <CartazFinal segundos={s} />

      {TEM_NARRACAO && (
        <>
          {TRECHOS_NARRACAO.map((t) => (
            <Sequence key={t.em} from={seg(t.em)}>
              <Audio
                src={staticFile(`gravidade/${t.arquivo ?? "narracao"}.mp3`)}
                trimBefore={seg(t.de)}
                trimAfter={seg(t.ate)}
                volume={t.vol ?? 1}
              />
            </Sequence>
          ))}
          {REACOES.map((r) => (
            <Sequence key={r.id} from={seg(r.inicio)}>
              <Audio src={staticFile(`gravidade/${r.id}.wav`)} volume={0.9} />
            </Sequence>
          ))}
          <Sons />
        </>
      )}
    </AbsoluteFill>
  );
};
