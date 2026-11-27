import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as serifa } from "@remotion/google-fonts/PlayfairDisplay";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import dados from "./historico.json";

// Corte "HISTÓRICO": o kosky, primeiro brasileiro a sofrer um bug no GTA 6, tratado como herói nacional.
// Base: public/cortes/kosky/historico.mp4 + historico.json (scripts/historico-kosky.py). Roteiro: historico.md.
// Layout dos cortes (câmera dele em cima, tela embaixo), áudio da live + música animada (Funkee Monkeee, Mixkit; pedido dele), sem efeito sonoro.
// A graça é a pompa: coroa, imagens de arquivo, placa de bronze, livro de história, placar pelo título.
const { fontFamily: serif } = serifa("normal", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] });
const { fontFamily: serifI } = serifa("italic", { weights: ["700"], subsets: ["latin", "latin-ext"] });
const { fontFamily } = montserrat("normal", { weights: ["900"], subsets: ["latin", "latin-ext"] });
const AMARELO = "#FFE14D";
type Bloco = { de: number; ate: number; palavras: { t: string; s: number; d: boolean }[] };

type Recorte = { x: number; y: number; w: number; h: number };
type Cena = { cena: string; de: number; ate: number; cam: Recorte; tela: Recorte; broll?: boolean };
const D = dados as unknown as { segundos: number; cenas: Cena[]; legendas: Bloco[] };
export const DURACAO_HISTORICO = Math.ceil(D.segundos * 30);
const OURO = "#F2C94C";
const OURO_ESC = "#9A6B12";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ent = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
const cena = (nome: string) => D.cenas.find((c) => c.cena === nome)!;
// tempo (no corte) de uma palavra de legenda dentro de uma cena
const palavra = (nome: string, w: string) => {
  const c = cena(nome);
  for (const b of D.legendas) for (const p of b.palavras) if (p.s >= c.de - 0.01 && p.s < c.ate && p.t.toLowerCase().replace(/[.,!?:]/g, "") === w) return p.s;
  return c.de;
};

const CAM_TOPO = 330;
const CAM_ALT = 610;
const TITULO_SAI = 3.0;

const Janela: React.FC<{ r: Recorte; top: number; h: number; zoom: number; origem: string; filtro?: string; src?: string }> = ({ r, top, h, zoom, origem, filtro, src = "cortes/kosky/historico.mp4" }) => {
  const esc = Math.max(1080 / r.w, h / r.h);
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, height: h, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: origem, filter: filtro }}>
        <OffthreadVideo src={staticFile(src)} muted style={{ position: "absolute", width: 1920 * esc, height: 1080 * esc, left: -r.x * esc + (1080 - r.w * esc) / 2, top: -r.y * esc + (h - r.h * esc) / 2, maxWidth: "none" }} />
      </div>
    </div>
  );
};

const LegendaCam: React.FC<{ base: number; t: number; frame: number; fps: number }> = ({ base, t, frame, fps }) => {
  const b = D.legendas.find((x) => t >= x.de && t < x.ate);
  if (!b) return null;
  const e = spring({ frame: frame - Math.round(b.de * fps), fps, config: { damping: 13, stiffness: 240, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 1920 - base + 22, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 58, lineHeight: 1.08, textTransform: "uppercase", textAlign: "center", transform: `scale(${interpolate(e, [0, 1], [0.75, 1])})`, transformOrigin: "50% 100%", opacity: interpolate(e, [0, 0.35], [0, 1], cl), WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,.6)" }}>
        {b.palavras.map((p, i) => {
          const falada = t >= p.s;
          const pulo = interpolate(t - p.s, [0, 0.08, 0.2], [1, 1.14, 1], cl);
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

// letra dourada de documentário
const Ouro: React.FC<{ tam: number; italico?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ tam, italico, children, style }) => (
  <div style={{ fontFamily: italico ? serifI : serif, fontStyle: italico ? "italic" : "normal", fontWeight: 900, fontSize: tam, lineHeight: 1, background: `linear-gradient(180deg, #FFF3C4 0%, ${OURO} 45%, ${OURO_ESC} 100%)`, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.75))", ...style }}>{children}</div>
);
const Carimbo: React.FC<{ t: number; de: number; cor: string; tam?: number; rot?: number; children: React.ReactNode }> = ({ t, de, cor, tam = 84, rot = -8, children }) => {
  if (t < de) return null;
  const k = interpolate(t, [de, de + 0.16], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: tam, letterSpacing: 4, color: cor, border: `9px solid ${cor}`, borderRadius: 16, padding: "2px 26px", background: "rgba(0,0,0,.6)", transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * k})`, opacity: k, textShadow: "0 4px 14px rgba(0,0,0,.6)" }}>
      {children}
    </div>
  );
};

// ---------- cenas ----------
const Abre: React.FC<{ t: number; sai: number }> = ({ t, sai }) => (
  <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", opacity: 1 - sai, transform: `translateY(${-sai * 300}px) scale(${0.85 + 0.15 * ent(t, 0.05, 0.5)})` }}>
    <Ouro tam={150} italico>Histórico.</Ouro>
    <div style={{ marginTop: 14, fontFamily, fontWeight: 900, fontSize: 30, letterSpacing: 10, color: "#fff" }}>18 · NOVEMBRO · 2026</div>
  </div>
);

// coroa que desce na cabeça dele e fica até o fim
const Coroa: React.FC<{ t: number; camTopo: number; zoomCam: number }> = ({ t, camTopo, zoomCam }) => {
  const de = palavra("coroa", "coroado") - 0.35;
  if (t < de) return null;
  const k = interpolate(t, [de, de + 0.45], [0, 1], { ...cl, easing: Easing.bounce });
  const brilho = 0.6 + 0.4 * Math.sin(t * 6);
  const y = camTopo - 300 + 270 * k - (zoomCam - 1) * 160;
  return (
    <div style={{ position: "absolute", left: 540 - 120, top: y, width: 240, textAlign: "center", fontSize: 165, transform: `rotate(${-8 + 4 * Math.sin(t * 2)}deg) scale(${zoomCam})`, filter: `drop-shadow(0 0 ${18 * brilho}px rgba(255,215,90,.9))` }}>👑</div>
  );
};

const Agenda: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const c = cena("coroa");
  if (t < c.de || t >= c.ate) return null;
  const a = palavra("coroa", "entrevista");
  const b = palavra("coroa", "palestras");
  return (
    <div style={{ position: "absolute", top: topo + 120, left: 90, width: 900, background: "#FBF4E2", borderRadius: 18, padding: "26px 36px", boxShadow: "0 18px 40px rgba(0,0,0,.6)", transform: `rotate(-2deg) translateY(${(1 - ent(t, a - 0.6)) * 600}px)` }}>
      <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 52, color: "#3a2a10" }}>Agenda do Pioneiro</div>
      {[["ENTREVISTAS", a], ["PALESTRAS", b]].map(([n, d]) => (
        <div key={n as string} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, fontFamily, fontWeight: 900, fontSize: 46, color: "#222", opacity: ent(t, d as number) }}>
          <span style={{ color: "#1a9b4b", fontSize: 54 }}>✓</span> {n}
        </div>
      ))}
    </div>
  );
};

const Arquivo: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const c = cena("arquivo");
  if (t < c.de || t >= c.ate) return null;
  const pisca = 0.9 + 0.1 * Math.sin(t * 47);
  return (
    <>
      <svg style={{ position: "absolute", top: topo, left: 0, width: 1080, height: 1920 - topo, opacity: 0.22, mixBlendMode: "overlay" }}>
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(t * 24)} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
      <div style={{ position: "absolute", top: topo, left: 0, width: 1080, height: 1920 - topo, boxShadow: "inset 0 0 220px rgba(40,20,0,.9)", border: "18px solid #2b1d0a", opacity: pisca }} />
      <div style={{ position: "absolute", top: topo + 60, left: 0, right: 0, textAlign: "center", opacity: ent(t, c.de + 0.1) }}>
        <div style={{ display: "inline-block", background: "rgba(20,12,2,.8)", padding: "12px 30px", borderRadius: 10, border: `3px solid ${OURO}` }}>
          <Ouro tam={54}>Imagens de arquivo</Ouro>
          <div style={{ fontFamily, fontWeight: 900, fontSize: 26, letterSpacing: 8, color: "#EADBB5", marginTop: 6 }}>18 · XI · 2026 · LEONIDA</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: topo + 520, left: 610, fontFamily, fontWeight: 900, fontSize: 46, color: AMARELO, opacity: ent(t, c.de + 1.2), transform: `translateY(${Math.sin(t * 6) * 10}px)`, WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>
        ↙ O BUG
      </div>
      <div style={{ position: "absolute", bottom: 26, right: 26, fontFamily, fontWeight: 900, fontSize: 22, color: "#fff", background: "rgba(0,0,0,.55)", padding: "4px 12px", borderRadius: 8, letterSpacing: 2 }}>VIA X · @CLIPOVERDOSE</div>
    </>
  );
};

const Placa: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const c = cena("placa");
  if (t < c.de || t >= c.ate) return null;
  const k = ent(t, c.de + 0.1, 0.5);
  const pioneiro = palavra("placa", "pioneiro");
  return (
    <div style={{ position: "absolute", top: topo + 170, left: 90, width: 900, padding: "44px 40px", borderRadius: 26, background: "linear-gradient(145deg, #7a5524 0%, #b8863b 30%, #6b4719 60%, #a5762f 100%)", border: "10px solid #4a3010", boxShadow: "0 24px 50px rgba(0,0,0,.7), inset 0 0 40px rgba(0,0,0,.45)", textAlign: "center", transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>
      <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 40, letterSpacing: 6, color: "#2a1a05", textShadow: "0 2px 0 rgba(255,230,160,.5)" }}>NESTE LOCAL</div>
      <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 70, lineHeight: 1.05, color: "#2a1a05", marginTop: 10, textShadow: "0 3px 0 rgba(255,230,160,.5)" }}>O BRASIL BUGOU PELA PRIMEIRA VEZ</div>
      <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 36, color: "#2a1a05", marginTop: 18 }}>18 · XI · MMXXVI</div>
      <div style={{ fontFamily: serifI, fontStyle: "italic", fontWeight: 700, fontSize: 40, color: "#2a1a05", marginTop: 12, opacity: ent(t, pioneiro) }}>— kosky, o pioneiro</div>
    </div>
  );
};

const Livro: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const c = cena("livro");
  if (t < c.de || t >= c.ate) return null;
  const bug = palavra("livro", "bug");
  const itens: [string, string, number][] = [
    ["1500", "Descobrimento", c.de + 0.3],
    ["1822", "Independência", c.de + 1.6],
    ["1888", "Abolição", c.de + 2.9],
  ];
  return (
    <div style={{ position: "absolute", top: topo + 70, left: 70, width: 940, background: "#F4E9CC", borderRadius: 14, padding: "30px 36px 36px", boxShadow: "0 20px 46px rgba(0,0,0,.65)", borderLeft: "22px solid #6b2a1a", opacity: ent(t, c.de, 0.3) }}>
      <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 46, color: "#4a1d10" }}>História do Brasil</div>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 22, letterSpacing: 6, color: "#8a6a40", marginBottom: 10 }}>LIVRO DIDÁTICO · EDIÇÃO 2026</div>
      {itens.map(([ano, txt, d]) => (
        <div key={ano} style={{ display: "flex", gap: 26, alignItems: "baseline", marginTop: 12, opacity: ent(t, d), fontFamily: serif, color: "#2b2015" }}>
          <span style={{ fontWeight: 900, fontSize: 58, width: 170 }}>{ano}</span>
          <span style={{ fontWeight: 700, fontSize: 48 }}>{txt}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 26, alignItems: "baseline", marginTop: 18, opacity: ent(t, bug - 0.1), transform: `scale(${1.6 - 0.6 * ent(t, bug - 0.1)})`, transformOrigin: "0% 50%", background: "rgba(242,201,76,.35)", borderRadius: 10, padding: "6px 10px" }}>
        <span style={{ fontFamily: serif, fontWeight: 900, fontSize: 64, width: 170, color: "#7a1a0a" }}>2026</span>
        <span style={{ fontFamily: serif, fontWeight: 900, fontSize: 54, color: "#7a1a0a" }}>Bug no GTA 6 🐛</span>
      </div>
    </div>
  );
};

const Seta: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const c = cena("seta");
  if (t < c.de || t >= c.ate) return null;
  const s = palavra("seta", "seta");
  const pisca = Math.sin(t * 9) > 0 ? 1 : 0.25;
  return (
    <div style={{ position: "absolute", top: topo + 120, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", background: "rgba(10,8,4,.82)", border: `4px solid ${OURO}`, borderRadius: 22, padding: "24px 40px", opacity: ent(t, c.de + 0.2) }}>
        <Ouro tam={56}>Próxima conquista:</Ouro>
        <div style={{ marginTop: 16, display: "flex", gap: 24, alignItems: "center", justifyContent: "center", opacity: ent(t, s - 0.2) }}>
          <span style={{ fontSize: 110, color: "#FFB020", opacity: pisca, textShadow: "0 0 30px #FFB020" }}>➜</span>
          <span style={{ fontFamily, fontWeight: 900, fontSize: 72, color: "#fff" }}>USAR SETA</span>
        </div>
        <div style={{ marginTop: 6, fontFamily, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: "#EADBB5", opacity: ent(t, s + 0.4) }}>(NO BRASIL. INÉDITO.)</div>
      </div>
    </div>
  );
};

const Placar: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const a = cena("horario");
  const z = cena("mantido");
  if (t < a.de || t >= z.ate) return null;
  const dez = palavra("horario", "10");
  const mantido = palavra("mantido", "título");
  const lado = (nome: string, hora: string, cor: string, d: number) => (
    <div style={{ textAlign: "center", opacity: ent(t, d) }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: "#ddd" }}>{nome}</div>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 120, color: cor, lineHeight: 1 }}>{hora}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", top: topo + 90, left: 60, right: 60, textAlign: "center" }}>
      <Ouro tam={60} italico>A disputa pelo título</Ouro>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-around", alignItems: "center", background: "rgba(8,6,2,.85)", border: `4px solid ${OURO}`, borderRadius: 24, padding: "26px 10px" }}>
        {lado("KOSKY", "08:41", OURO, a.de + 0.2)}
        <div style={{ fontFamily, fontWeight: 900, fontSize: 70, color: "#fff", opacity: ent(t, a.de + 0.5) }}>✕</div>
        {lado("O COLEGA", "10:20", "#9fb4ff", dez - 0.1)}
      </div>
      <div style={{ marginTop: 40 }}>
        <Carimbo t={t} de={mantido - 0.1} cor={OURO} tam={70}>🏆 TÍTULO MANTIDO</Carimbo>
      </div>
    </div>
  );
};

const Final: React.FC<{ t: number; topo: number }> = ({ t, topo }) => {
  const v = cena("voltou");
  const m = cena("maisum");
  if (t < v.de) return null;
  const mais = palavra("maisum", "mais");
  const quebrado = palavra("maisum", "quebrado");
  return (
    <div style={{ position: "absolute", top: topo + 90, left: 0, right: 0, textAlign: "center" }}>
      {t < m.de && (
        <div style={{ opacity: ent(t, v.de + 0.1), transform: `scale(${0.7 + 0.3 * ent(t, v.de + 0.1)})` }}>
          <Ouro tam={84} italico>O primeiro BR</Ouro>
          <Ouro tam={110}>VOLTOU.</Ouro>
        </div>
      )}
      {t >= m.de && (
        <>
          <Carimbo t={t} de={mais} cor={AMARELO} tam={92} rot={-6}>BUG Nº 2 🐛</Carimbo>
          <div style={{ marginTop: 50, opacity: ent(t, quebrado + 0.2, 0.4), transform: `scale(${1.5 - 0.5 * ent(t, quebrado + 0.2, 0.4)})` }}>
            <Ouro tam={150} italico>Histórico.</Ouro>
            <div style={{ fontFamily, fontWeight: 900, fontSize: 34, letterSpacing: 8, color: "#fff", marginTop: 8 }}>DE NOVO.</div>
          </div>
        </>
      )}
    </div>
  );
};

// "Caralho, histórico!" (ele pulando do avião) e "Histórico, mano, geral"
const Estouro: React.FC<{ t: number; topo: number; nome: string; linhas: [string, number, boolean][] }> = ({ t, topo, nome, linhas }) => {
  const c = cena(nome);
  if (t < c.de || t >= c.ate) return null;
  return (
    <div style={{ position: "absolute", top: topo + 200, left: 0, right: 0, textAlign: "center" }}>
      {linhas.map(([txt, tam, ital], i) => {
        const k = ent(t, c.de + 0.05 + i * 0.25, 0.3);
        return (
          <div key={i} style={{ opacity: k, transform: `scale(${(1.8 - 0.8 * k) * (1 + 0.04 * Math.sin(t * 9))}) rotate(${-4 + i * 3}deg)` }}>
            <Ouro tam={tam} italico={ital}>{txt}</Ouro>
          </div>
        );
      })}
    </div>
  );
};

export const Historico: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const i = Math.max(0, D.cenas.findIndex((c) => t >= c.de && t < c.ate));
  const c = D.cenas[i] ?? D.cenas[D.cenas.length - 1];
  const desde = t - c.de;
  const soco = i === 0 ? 1 : interpolate(desde, [0, 0.28], [1.14, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const mov = i % 3 === 0 ? interpolate(desde, [0, 7], [1, 1.12], cl) : i % 3 === 1 ? interpolate(desde, [0, 7], [1.14, 1.03], cl) : 1.08;
  const origem = i % 3 === 2 ? `${interpolate(desde, [0, 7], [35, 65], cl)}% 50%` : "50% 45%";
  const flash = i === 0 ? 0 : interpolate(desde, [0, 0.1], [0.25, 0], cl);
  const batida = desde > 2.2 ? interpolate((desde - 2.2) % 2.2, [0, 0.22], [1.07, 1], { ...cl, easing: Easing.out(Easing.cubic) }) : 1;
  const empurra = interpolate(desde, [0, c.ate - c.de], [1.0, 1.1], cl);
  const balanco = Math.sin(t * 1.3) * 2.5;
  // zoom na cara dele nas falas mais "históricas"
  const reacoes = [palavra("historico1", "histórico"), palavra("brisa2", "histórico"), palavra("coroa", "coroado"), palavra("placa", "pioneiro"), palavra("livro", "história"), palavra("mantido", "título"), palavra("maisum", "mais")];
  const ur = Math.max(-99, ...reacoes.filter((m) => m <= t));
  const dr = t - ur;
  const zoomCam = dr < 1.8 ? interpolate(dr, [0, 0.18, 1.4, 1.8], [1, 1.3, 1.25, 1], { ...cl, easing: Easing.out(Easing.cubic) }) : 1;

  const sai = interpolate(t, [TITULO_SAI, TITULO_SAI + 0.5], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const camTopo = CAM_TOPO * (1 - sai);
  const jogoTopo = camTopo + CAM_ALT;
  const sepia = c.cena === "arquivo" ? "sepia(0.85) contrast(1.15) brightness(0.95) saturate(0.8)" : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a1f08 0%, #000 100%)" }} />
      <Janela r={c.cam} top={camTopo} h={CAM_ALT} zoom={soco * zoomCam * empurra * batida} origem={`${50 + balanco * 4}% 35%`} filtro={sepia} />
      <Janela r={c.tela} top={jogoTopo} h={1920 - jogoTopo} zoom={soco * mov * batida} origem={origem} filtro={sepia} src={c.broll ? "cortes/kosky/historico-broll.mp4" : undefined} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div style={{ position: "absolute", top: camTopo + 16, left: 22, fontFamily, fontWeight: 900, fontSize: 30, color: "#000", background: "#53FC18", padding: "4px 14px", borderRadius: 8, letterSpacing: 1 }}>KICK.COM/KOSKY</div>

      <Arquivo t={t} topo={jogoTopo} />
      <Agenda t={t} topo={jogoTopo} />
      <Placa t={t} topo={jogoTopo} />
      <Livro t={t} topo={jogoTopo} />
      <Seta t={t} topo={jogoTopo} />
      <Placar t={t} topo={jogoTopo} />
      <Final t={t} topo={jogoTopo} />
      <Estouro t={t} topo={jogoTopo} nome="historico1" linhas={[["HISTÓRICO!", 170, false]]} />
      <Estouro t={t} topo={jogoTopo} nome="brisa1" linhas={[["Pra sempre.", 130, true]]} />
      <Estouro t={t} topo={jogoTopo} nome="brisa2" linhas={[["Histórico,", 140, true], ["GERAL.", 120, false]]} />
      <Coroa t={t} camTopo={camTopo} zoomCam={zoomCam} />
      {sai < 1 && <Abre t={t} sai={sai} />}

      <LegendaCam base={jogoTopo} t={t} frame={frame} fps={fps} />
      <Audio src={staticFile("cortes/kosky/historico.mp4")} volume={0.8} />
      <Audio src={staticFile("cortes/kosky/historico-trilha.wav")} volume={0.2} />
      <div style={{ position: "absolute", top: jogoTopo - 4, left: 0, width: 1080, height: 8, background: OURO }} />
    </AbsoluteFill>
  );
};
