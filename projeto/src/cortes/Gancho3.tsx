import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARELO, Bloco, CorteLiveVertical, fontFamily, LegendaV, Titulo } from "./CorteLive";

// Corte 3 com gancho: o clipe da "Nova pasta" (twitch-clip.mp4) vem antes do corte 3.
// Linha do tempo do gancho (public/cortes/gancho3-base.mp4, 14,3 s):
//   0,0–4,8  ele lê o "URGENTE" do chat
//   4,8–6,3  abre o link: a foto
//   6,3–14,3 silêncio, mão na boca, "vocês tá brincando errado, comédia do caralho"
export const GANCHO3_SEG = 14.3;
export const CORTE3_SEG = 44.7;
const G = { revela: 4.8, silencio: 6.3, fala: 10.0 };

const legendasGancho: Bloco[] = [
  { de: 0.0, ate: 0.95, palavras: [{ t: "Deixa", s: 0, d: false }, { t: "eu", s: 0.08, d: false }, { t: "ver", s: 0.14, d: false }, { t: "isso", s: 0.22, d: false }, { t: "aqui:", s: 0.32, d: false }] },
  { de: 1.0, ate: 2.8, palavras: [{ t: "Alanzoka", s: 1.0, d: false }, { t: "foi", s: 2.1, d: false }, { t: "flagrado", s: 2.32, d: true }] },
  { de: 2.8, ate: 4.8, palavras: [{ t: "batendo", s: 2.82, d: false }, { t: "uma", s: 3.3, d: false }, { t: "no", s: 3.58, d: false }, { t: "GTA", s: 3.92, d: true }, { t: "6?!", s: 4.1, d: true }] },
  { de: 10.0, ate: 12.4, palavras: [{ t: "Vocês", s: 10.01, d: false }, { t: "tá", s: 10.45, d: false }, { t: "brincando", s: 10.65, d: true }, { t: "errado,", s: 11.19, d: false }] },
  { de: 12.55, ate: 14.3, palavras: [{ t: "comédia", s: 12.59, d: true }, { t: "do", s: 13.5, d: false }, { t: "caralho!", s: 13.73, d: true }] },
];

export const Carimbo: React.FC<{ texto: string; cor: string; giro: number; top: number; tam?: number }> = ({ texto, cor, giro, top, tam = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 9, stiffness: 300, mass: 0.7 } });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: tam,
          color: cor,
          border: `12px solid ${cor}`,
          borderRadius: 18,
          padding: "6px 34px",
          background: "rgba(0,0,0,.4)",
          transform: `rotate(${giro}deg) scale(${interpolate(e, [0, 1], [2.6, 1])})`,
          opacity: interpolate(e, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
          textShadow: "0 6px 20px rgba(0,0,0,.6)",
          whiteSpace: "nowrap",
        }}
      >
        {texto}
      </div>
    </div>
  );
};

const Gancho3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  const src = staticFile("cortes/gancho3-base.mp4");

  // câmera: soco na revelação, aproximação lenta no silêncio, tremida no "caralho"
  let zoom = 1;
  if (t >= G.revela && t < G.silencio) zoom = interpolate(t - G.revela, [0, 0.3], [1.15, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  if (t >= G.silencio) zoom = interpolate(t, [G.silencio, G.fala], [1.0, 1.45], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const treme = t >= 13.7 ? Math.sin(frame * 2.3) * 14 : 0;
  const flash = Math.max(
    t >= G.revela ? interpolate(t - G.revela, [0, 0.12], [0.9, 0], { extrapolateRight: "clamp" }) : 0,
    t >= G.silencio ? interpolate(t - G.silencio, [0, 0.1], [0.5, 0], { extrapolateRight: "clamp" }) : 0,
  );
  const urgentePisca = t >= 1.0 && t < G.revela ? (Math.floor(frame / 6) % 2 === 0 ? 1 : 0.5) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={src}
        muted
        style={{ position: "absolute", width: 1440, height: 1920, left: -180, top: 0, filter: "blur(40px) brightness(.45)", transform: "scale(1.15)" }}
      />
      <div style={{ position: "absolute", top: 400, left: 0, width: 1080, height: 1440, overflow: "hidden" }}>
        <OffthreadVideo
          src={src}
          style={{
            width: 1080,
            height: 1440,
            transform: `translate(${treme}px, ${treme * 0.4}px) scale(${zoom})`,
            transformOrigin: t >= G.silencio ? "50% 38%" : "50% 72%",
          }}
        />
        <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 14px rgba(255,40,40,${urgentePisca})` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 70%, rgba(0,0,0,.45) 100%)" }} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* títulos do gancho */}
      <Sequence durationInFrames={f(G.revela)}>
        <Titulo linhas={["O CHAT MANDOU", "UM ", "“URGENTE”"]} estilo="preto" />
      </Sequence>
      <Sequence from={f(G.revela)}>
        <Titulo linhas={["ELE ABRIU", "O ", "LINK…"]} estilo="amarelo" />
      </Sequence>

      {/* carimbos e piadas */}
      <Sequence from={f(1.0)} durationInFrames={f(G.revela - 1.0)}>
        <Carimbo texto="URGENTE" cor="#FF3B3B" giro={-6} top={1060} tam={100} />
      </Sequence>
      <Sequence from={f(G.revela + 0.25)} durationInFrames={f(G.silencio - G.revela - 0.25)}>
        <Carimbo texto="ERA ISSO AQUI" cor={AMARELO} giro={-5} top={850} tam={96} />
      </Sequence>
      <Sequence from={f(G.silencio + 0.6)} durationInFrames={f(G.fala - G.silencio - 0.6)}>
        <div
          style={{
            position: "absolute",
            top: 1600,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily,
            fontWeight: 900,
            fontSize: 64,
            color: "#fff",
            fontStyle: "italic",
            WebkitTextStroke: "12px #000",
            paintOrder: "stroke fill",
          }}
        >
          (silêncio constrangedor)
        </div>
      </Sequence>

      {/* linha que separa câmera (em cima) e tela (embaixo) enquanto ele compartilha a tela */}
      {t < G.silencio && <div style={{ position: "absolute", top: 400 + 608 - 4, left: 0, width: 1080, height: 8, background: AMARELO }} />}
      {/* legendas: na parte da câmera enquanto a tela está embaixo; no lugar de sempre depois */}
      <LegendaV blocos={legendasGancho.filter((b) => b.de < G.silencio)} topo={830} />
      <LegendaV blocos={legendasGancho.filter((b) => b.de >= G.silencio)} />

      {/* sons */}
      <Sequence from={f(0.75)}><Audio src={staticFile("cortes/sons/msg.wav")} volume={0.55} /></Sequence>
      <Sequence from={f(1.0)} durationInFrames={f(G.revela - 1.0)}><Audio src={staticFile("cortes/sons/alarme.wav")} volume={0.12} /></Sequence>
      <Sequence from={f(G.revela - 0.12)}><Audio src={staticFile("cortes/sons/whoosh-curto.wav")} volume={0.6} /></Sequence>
      <Sequence from={f(G.revela + 0.25)}><Audio src={staticFile("cortes/sons/carimbo.wav")} volume={0.8} /></Sequence>
      <Sequence from={f(G.silencio)}><Audio src={staticFile("cortes/sons/dum.wav")} volume={0.7} /></Sequence>
      <Sequence from={f(G.silencio + 0.3)} durationInFrames={f(G.fala - G.silencio - 0.3)}><Audio src={staticFile("cortes/sons/grilos.wav")} volume={0.35} /></Sequence>
      <Sequence from={f(GANCHO3_SEG - 0.2)}><Audio src={staticFile("cortes/sons/whoosh-curto.wav")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const Corte3ComGancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const g = Math.round(GANCHO3_SEG * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={g}>
        <Gancho3 />
      </Sequence>
      <Sequence from={g}>
        <CorteLiveVertical corte="corte3" semBarra />
      </Sequence>
      <div style={{ position: "absolute", left: 0, top: 1834, height: 10, width: 1080 * (frame / durationInFrames), background: AMARELO }} />
    </AbsoluteFill>
  );
};
