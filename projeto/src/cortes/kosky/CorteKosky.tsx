import { AbsoluteFill, Easing, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARELO, Bloco, Estilo, fontFamily, Titulo } from "../CorteLive";
import dados from "./cortes.json";

// Cortes da live do kosky (Kick), em pé para TikTok/Reels (1080x1920).
// Base: public/cortes/kosky/<id>.mp4, emendas e legendas em cortes.json — os dois gerados por scripts/cortar-kosky.py.
// Layout: título no topo, câmera dele numa faixa larga, jogo embaixo (sem chat), legenda sobre o jogo.

export type Recorte = { x: number; y: number; w: number; h: number };
export type CorteK = {
  segundos: number;
  emendas: number[];
  legendas: Bloco[];
  titulo: string[];
  estilo: Estilo;
  cam: Recorte;
  jogo: Recorte;
  reacoes?: number[]; // momentos (s) de zoom forte na cara dele
  camTrocas?: { de: number; cam: Recorte }[]; // a câmera dele mudou de lugar no meio do corte
  jogoTrocas?: { de: number; jogo: Recorte }[];
  canal?: string; // streamer (padrão: kosky)
};
export const CORTES_K = dados as unknown as Record<string, CorteK>;

const CAM_TOPO = 330; // com o título na tela (gancho)
const CAM_ALT = 610;
const TITULO_SAI = 3.2; // s: o título sai e câmera + jogo sobem para ocupar o espaço
// sem efeitos sonoros: só o áudio da live

// mostra o retângulo r da fonte (1920x1080) preenchendo uma janela 1080 x h
const Janela: React.FC<{ src: string; r: Recorte; top: number; h: number; zoom: number; origem: string; mudo?: boolean }> = ({ src, r, top, h, zoom, origem, mudo }) => {
  const esc = Math.max(1080 / r.w, h / r.h);
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, height: h, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: origem }}>
        <OffthreadVideo
          src={src}
          muted={mudo}
          style={{ position: "absolute", width: 1920 * esc, height: 1080 * esc, left: -r.x * esc + (1080 - r.w * esc) / 2, top: -r.y * esc + (h - r.h * esc) / 2, maxWidth: "none" }}
        />
      </div>
    </div>
  );
};

const LegendaCam: React.FC<{ blocos: Bloco[]; base: number }> = ({ blocos, base }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = blocos.find((x) => t >= x.de && t < x.ate);
  if (!b) return null;
  const e = spring({ frame: frame - Math.round(b.de * fps), fps, config: { damping: 13, stiffness: 240, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 1920 - base + 22, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 58,
          lineHeight: 1.08,
          textTransform: "uppercase",
          textAlign: "center",
          transform: `scale(${interpolate(e, [0, 1], [0.75, 1])})`,
          transformOrigin: "50% 100%",
          opacity: interpolate(e, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
          WebkitTextStroke: "12px #000",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,.6)",
        }}
      >
        {b.palavras.map((p, i) => {
          const falada = t >= p.s;
          const pulo = interpolate(t - p.s, [0, 0.08, 0.2], [1, 1.14, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ display: "inline-block", margin: "0 10px", color: p.d ? AMARELO : "#fff", opacity: falada ? 1 : 0.5, transform: `scale(${falada ? pulo : 1})` }}>
              {p.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const CorteKosky: React.FC<{ id: string }> = ({ id }) => {
  const c = CORTES_K[id];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const canal = c.canal ?? "kosky"; // os mesmos cortes servem pra outros streamers do Kick
  const src = staticFile(`cortes/${canal}/${id}.mp4`);

  // soco de zoom a cada emenda + movimento diferente em cada trecho (aproxima / afasta / desliza)
  const marcas = [0, ...c.emendas];
  const ultima = Math.max(...marcas.filter((m) => m <= t));
  const idx = marcas.indexOf(ultima);
  const desde = t - ultima;
  const soco = interpolate(desde, [0, 0.28], [1.14, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const mov = idx % 3 === 0 ? interpolate(desde, [0, 7], [1, 1.12], { extrapolateRight: "clamp" }) : idx % 3 === 1 ? interpolate(desde, [0, 7], [1.14, 1.03], { extrapolateRight: "clamp" }) : 1.08;
  const origem = idx % 3 === 2 ? `${interpolate(desde, [0, 7], [35, 65], { extrapolateRight: "clamp" })}% 50%` : "50% 45%";
  const flash = ultima === 0 ? 0 : interpolate(desde, [0, 0.1], [0.25, 0], { extrapolateRight: "clamp" });

  // reação: zoom forte na cara dele, com tremida curta
  const ultimaReacao = Math.max(-99, ...(c.reacoes ?? []).filter((m) => m <= t));
  const dr = t - ultimaReacao;
  const zoomCam = dr < 1.8 ? interpolate(dr, [0, 0.18, 1.4, 1.8], [1, 1.35, 1.3, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 1;
  const treme = dr < 0.5 ? Math.sin(frame * 2.1) * 9 * (1 - dr / 0.5) : 0;
  const entrada = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });

  // título só no começo; depois sai e o layout sobe
  const sai = interpolate(t, [TITULO_SAI, TITULO_SAI + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const camTopo = CAM_TOPO * (1 - sai);
  const jogoTopo = camTopo + CAM_ALT;
  const jogoAlt = 1920 - jogoTopo;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #000 100%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${treme}px, ${treme * 0.5}px)` }}>
        <Janela src={src} r={[...(c.camTrocas ?? [])].reverse().find((x) => t >= x.de)?.cam ?? c.cam} top={camTopo} h={CAM_ALT} zoom={soco * zoomCam * interpolate(entrada, [0, 1], [1.2, 1])} origem="50% 40%" mudo />
        <Janela src={src} r={[...(c.jogoTrocas ?? [])].reverse().find((x) => t >= x.de)?.jogo ?? c.jogo} top={jogoTopo} h={jogoAlt} zoom={soco * mov} origem={origem} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div style={{ position: "absolute", top: camTopo + 16, left: 22, fontFamily, fontWeight: 900, fontSize: 30, color: "#000", background: "#53FC18", padding: "4px 14px", borderRadius: 8, letterSpacing: 1 }}>
        KICK.COM/{canal.toUpperCase()}
      </div>
      {sai < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - sai, transform: `translateY(${-sai * 320}px)` }}>
          <Titulo linhas={c.titulo} estilo={c.estilo} />
        </div>
      )}
      {/* legenda do lado dele: presa à base da câmera e crescendo para cima, deixando o jogo livre */}
      <LegendaCam blocos={c.legendas} base={jogoTopo} />
      <div style={{ position: "absolute", top: jogoTopo - 4, left: 0, width: 1080, height: 8, background: AMARELO }} />

    </AbsoluteFill>
  );
};
