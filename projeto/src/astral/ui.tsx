import { loadFont as carregarGaramond } from "@remotion/google-fonts/EBGaramond";
import { loadFont as carregarInter } from "@remotion/google-fonts/Inter";
import { interpolate } from "remotion";
import { altitudeKm, CARTAZ, clamp, CTA, horaEspaco, HUDS, LEGENDAS, TITULO } from "./tempo";

// Textos iguais aos do original: serifa clássica (EB Garamond), legenda toda em itálico no meio
// de baixo, HUD sem caixa (lugar em versalete espaçado, hora grande, linha pequena), pergunta
// centralizada em duas linhas e a chamada final em itálico amarelo.
const garamond = carregarGaramond("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });
carregarGaramond("italic", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });
const SERIFA = garamond.fontFamily;
const SANS = carregarInter("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] }).fontFamily;

const SOMBRA = "0 1px 3px rgba(0,0,0,0.55), 0 3px 14px rgba(0,0,0,0.35)";
const aparece = (s: number, de: number, ate: number, entra = 0.35, sai = 0.35) =>
  interpolate(s, [de, de + entra, ate - sai, ate], [0, 1, 1, 0], clamp);

export const Titulo: React.FC<{ s: number }> = ({ s }) => (
  <>
    {TITULO.map((t, i) => {
      const fim = i === 1;
      const op = fim ? aparece(s, t.de, t.ate, 0.5, 0.35) : interpolate(s, [t.de, t.de + 0.01, t.ate - 0.35, t.ate], [1, 1, 1, 0], clamp);
      if (op <= 0) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: fim ? 552 : 432,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: SERIFA,
            fontWeight: 400,
            fontSize: 64,
            lineHeight: 1.12,
            color: "#fff",
            textShadow: SOMBRA,
            opacity: op,
          }}
        >
          E se você pudesse
          <br />
          <span style={{ color: fim ? "#ffffff" : "#c3d8f7" }}>fazer projeção astral?</span>
        </div>
      );
    })}
  </>
);

export const Legendas: React.FC<{ s: number }> = ({ s }) => (
  <>
    {LEGENDAS.map((l) => {
      const op = aparece(s, l.de, l.ate, 0.3, 0.35);
      if (op <= 0) return null;
      return (
        <div
          key={l.de}
          style={{
            position: "absolute",
            top: 1268,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: SERIFA,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 46,
            color: "#fff",
            textShadow: SOMBRA,
            opacity: op,
          }}
        >
          {l.texto}
        </div>
      );
    })}
  </>
);

export const ChamadaFinal: React.FC<{ s: number }> = ({ s }) => {
  const op = aparece(s, CTA.de, CTA.ate, 0.45, 0.35);
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 1092,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: SERIFA,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: 44,
        color: "#f3cf5e",
        textShadow: SOMBRA,
        opacity: op,
      }}
    >
      {CTA.texto}
    </div>
  );
};

const fmtKm = (km: number) => `${Math.round(km / 10) * 10 >= 1000 ? (Math.round(km / 100) * 100).toLocaleString("pt-BR") : Math.round(km / 10) * 10} KM DE ALTITUDE`;

export const Hud: React.FC<{ s: number }> = ({ s }) => {
  const h = HUDS.find((x) => s >= x.de && s < x.ate);
  if (!h) return null;
  // entra suave no começo do vídeo e some no fim; entre lugares só troca o texto (como no original)
  const op = h === HUDS[0] ? interpolate(s, [h.de, h.de + 0.4], [0, 1], clamp) : h === HUDS[HUDS.length - 1] ? interpolate(s, [h.ate - 0.4, h.ate], [1, 0], clamp) : 1;
  const espaco = h.lugar === "ESPAÇO";
  const hora = espaco ? horaEspaco(s) : h.hora;
  const linha = espaco ? `UTC · ${fmtKm(altitudeKm(s))}` : h.linha;
  return (
    <div style={{ position: "absolute", top: 878, left: 64, opacity: op, textShadow: SOMBRA }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19, letterSpacing: 3.5, color: "rgba(255,255,255,0.95)" }}>{h.lugar}</div>
      <div style={{ fontFamily: SERIFA, fontWeight: 400, fontSize: 64, lineHeight: 1.08, color: "#fff", fontVariantNumeric: "lining-nums" }}>{hora}</div>
      {linha && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, letterSpacing: 2.5, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{linha}</div>}
    </div>
  );
};

// Cartaz final da página: fundo escurece sobre o quarto, "SIGA NAS REDES", MUNDO PARALELO com as
// letras abrindo, o @ em amarelo e o convite para comentar a próxima ideia (a melhor vira vídeo).
export const CartazPagina: React.FC<{ s: number }> = ({ s }) => {
  if (s < CARTAZ.de) return null;
  const fundo = interpolate(s, [CARTAZ.de, CARTAZ.de + 0.5], [0, 0.86], clamp);
  const nome = interpolate(s, [CARTAZ.de + 0.15, CARTAZ.de + 0.8], [0, 1], clamp);
  const abre = interpolate(s, [CARTAZ.de + 0.15, CARTAZ.de + 1.4], [2, 11], clamp);
  const arroba = interpolate(s, [CARTAZ.de + 0.6, CARTAZ.de + 1.1], [0, 1], clamp);
  const ideia = interpolate(s, [76.6, 77.0], [0, 1], clamp);
  const melhor = interpolate(s, [78.75, 79.1], [0, 1], clamp);
  const pulo = 1 + 0.08 * Math.sin(Math.min(1, Math.max(0, (s - 78.75) / 0.35)) * Math.PI);
  const sobe = (k: number) => `translateY(${(1 - k) * 16}px)`;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(6,8,22,${fundo})`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 560, textShadow: SOMBRA }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 7, color: "rgba(255,255,255,0.8)", opacity: nome, transform: sobe(nome) }}>SIGA NAS REDES</div>
      <div style={{ fontFamily: SERIFA, fontWeight: 400, fontSize: 86, letterSpacing: abre, paddingLeft: abre, color: "#fff", marginTop: 18, opacity: nome, transform: sobe(nome) }}>MUNDO PARALELO</div>
      <div style={{ width: 260 * nome, height: 2, background: "rgba(255,255,255,0.8)", margin: "14px 0 18px" }} />
      <div style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 500, fontSize: 56, color: "#f3cf5e", opacity: arroba, transform: sobe(arroba) }}>@mundoparalelo.br</div>
      <div style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400, fontSize: 50, color: "#fff", marginTop: 120, maxWidth: 820, textAlign: "center", lineHeight: 1.2, opacity: ideia, transform: sobe(ideia) }}>
        Comenta a sua ideia pro próximo vídeo.
      </div>
      <div style={{ fontFamily: SERIFA, fontWeight: 400, fontSize: 60, color: "#fff", marginTop: 26, opacity: melhor, transform: `${sobe(melhor)} scale(${pulo})` }}>
        A melhor <span style={{ fontStyle: "italic", fontWeight: 500, color: "#f3cf5e" }}>vira vídeo.</span>
      </div>
    </div>
  );
};
