import { loadFont as carregarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as carregarMontserrat } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { AMIGO, ARROBA, AVISO_ILUSTRACAO, clamp, ETIQUETAS, FPS, HUDS, LEGENDAS, MARCOS, NOME, SELOS } from "./tempo";

// Textos na tela: legenda em CAIXA ALTA (branca com contorno preto, palavra-chave amarela),
// etiquetas em pílula, HUD azul-marinho com borda dourada e os selos amarelos.

const ANTON = carregarAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const MONT = carregarMontserrat("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
const OURO = "#F5C518";

// contorno preto grosso (8 direções em 2 raios) + "espessura" 3D descendo + sombra
const contorno = (r: number) => {
  const c: string[] = [];
  for (const raio of [r, r * 0.6])
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      c.push(`${(Math.cos(a) * raio).toFixed(1)}px ${(Math.sin(a) * raio).toFixed(1)}px 0 #000`);
    }
  for (let k = 1; k <= 7; k++) c.push(`0 ${r + k * 1.4}px 0 #000`);
  c.push(`0 ${r + 16}px 26px rgba(0,0,0,0.65)`);
  return c.join(",");
};
const CONTORNO = contorno(7);

const mola = (s: number, ini: number, cfg = { damping: 13, stiffness: 190, mass: 0.7 }) =>
  spring({ frame: Math.round((s - ini) * FPS), fps: FPS, config: cfg });

// ---------- Legenda ----------
export const Legendas: React.FC<{ s: number }> = ({ s }) => {
  const l = LEGENDAS.find((x) => s >= x.de - 0.04 && s < x.ate);
  if (!l) return null;
  const palavras = l.texto
    .split("**")
    .flatMap((trecho, i) =>
      trecho
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => ({ p, chave: i % 2 === 1 })),
    )
    // vírgula, ponto e reticências ficam grudados na palavra anterior
    .reduce<{ p: string; chave: boolean }[]>((acc, w) => {
      if (/^[.,:;…!?]+$/.test(w.p) && acc.length) acc[acc.length - 1] = { ...acc[acc.length - 1], p: acc[acc.length - 1].p + w.p };
      else acc.push(w);
      return acc;
    }, []);
  const grande = palavras.length <= 2;
  const tam = grande ? 118 : 92;
  const sai = interpolate(s, [l.ate - 0.08, l.ate], [1, 0.85], clamp);
  return (
    <div style={{ position: "absolute", top: 1130, left: 50, right: 50, display: "flex", justifyContent: "center", perspective: 1000 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: tam * 0.26,
          rowGap: 2,
          transform: `rotateX(${8 + Math.sin(s * 1.3) * 3}deg) rotateY(${Math.sin(s * 0.9) * 5}deg) scale(${sai})`,
        }}
      >
        {palavras.map((w, i) => {
          const e = mola(s, l.de + i * 0.055);
          const soco = w.chave ? interpolate((s - l.de - i * 0.055) * FPS, [4, 8, 13], [1, 1.16, 1], clamp) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: tam * (w.chave ? 1.08 : 1),
                lineHeight: 1.08,
                letterSpacing: -1,
                color: w.chave ? OURO : "#ffffff",
                textShadow: CONTORNO,
                opacity: Math.min(1, e * 2),
                transformOrigin: "50% 100%",
                transform: `translateY(${(1 - e) * 50}px) rotateX(${(1 - e) * -80}deg) scale(${(0.6 + 0.4 * e) * soco})`,
              }}
            >
              {w.p}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Etiquetas (pílula preta com borda branca) ----------
export const Etiquetas: React.FC<{ s: number }> = ({ s }) => (
  <>
    {ETIQUETAS.filter((e) => s >= e.de && s < e.ate).map((e) => {
      const m = mola(s, e.de, { damping: 12, stiffness: 220, mass: 0.6 });
      const sai = interpolate(s, [e.ate - 0.12, e.ate], [1, 0], clamp);
      return (
        <div key={e.texto} style={{ position: "absolute", top: e.topo, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "#0b0b0b",
              border: "5px solid #ffffff",
              borderRadius: 999,
              padding: "6px 34px 4px",
              fontFamily: ANTON,
              fontSize: 58,
              letterSpacing: 2,
              color: "#ffffff",
              boxShadow: "0 10px 0 rgba(0,0,0,0.45), 0 18px 34px rgba(0,0,0,0.5)",
              transform: `scale(${m * sai}) rotate(${(1 - m) * -8}deg)`,
              opacity: sai,
            }}
          >
            {e.texto}
          </div>
        </div>
      );
    })}
  </>
);

// ---------- HUD (canto superior esquerdo) ----------
export const Hud: React.FC<{ s: number }> = ({ s }) => {
  const h = HUDS.find((x) => s >= x.de && s < x.ate);
  if (!h) return null;
  const entra = mola(s, h.de, { damping: 14, stiffness: 200, mass: 0.7 });
  const pisca = h.alerta ? 0.7 + 0.3 * Math.abs(Math.sin(s * 8)) : 1;
  const borda = h.alerta ? "#ff3b3b" : "#d4af37";
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 54,
        minWidth: 400,
        padding: "20px 30px 22px",
        background: h.alerta ? `rgba(70,6,10,${0.92 * pisca})` : "rgba(9,20,48,0.93)",
        border: `3px solid ${borda}`,
        borderRadius: 14,
        boxShadow: `0 0 0 2px rgba(0,0,0,0.5), 0 14px 40px rgba(0,0,0,0.55)${h.alerta ? ", 0 0 40px rgba(255,40,40,0.55)" : ""}`,
        transformOrigin: "0% 0%",
        transform: `scale(${0.6 + 0.4 * entra})`,
        opacity: Math.min(1, entra * 1.5),
      }}
    >
      <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: h.alerta ? "#ffb3b3" : "#d4af37" }}>{h.rotulo}</div>
      <div
        key={h.valor}
        style={{
          fontFamily: ANTON,
          fontSize: h.valor.length > 6 ? 118 : 150,
          lineHeight: 1.02,
          color: "#ffffff",
          textShadow: "0 5px 0 rgba(0,0,0,0.45)",
          transform: `scale(${interpolate((s - h.de) * FPS, [2, 6, 11], [1, 1.12, 1], clamp)})`,
          transformOrigin: "0% 60%",
        }}
      >
        {h.valor}
      </div>
      {h.rodape && <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,0.8)" }}>{h.rodape}</div>}
    </div>
  );
};

// ---------- Selos ----------
const Selo: React.FC<{ texto: string; m: number; giro?: number; tam?: number }> = ({ texto, m, giro = -8, tam = 76 }) => (
  <div
    style={{
      background: OURO,
      color: "#111",
      fontFamily: ANTON,
      fontSize: tam,
      lineHeight: 1,
      padding: "12px 30px 10px",
      borderRadius: 12,
      border: "5px solid #111",
      boxShadow: "0 9px 0 #8a6a00, 0 18px 36px rgba(0,0,0,0.55)",
      transform: `rotate(${giro}deg) scale(${m})`,
      whiteSpace: "nowrap",
    }}
  >
    {texto}
  </div>
);

export const Selos: React.FC<{ s: number }> = ({ s }) => (
  <>
    {/* "E SE…?" no topo, na abertura */}
    {s < 2.55 && (
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Selo texto="E SE…?" m={mola(s, 0.05, { damping: 10, stiffness: 160, mass: 0.8 }) * interpolate(s, [2.4, 2.55], [1, 0], clamp)} giro={-4 + Math.sin(s * 3) * 2} tam={120} />
      </div>
    )}
    {SELOS.filter((x) => s >= x.de && s < x.ate).map((x) => (
      <div key={x.texto} style={{ position: "absolute", top: x.topo, right: 70 }}>
        <Selo texto={x.texto} m={mola(s, x.de, { damping: 9, stiffness: 220, mass: 0.6 })} giro={8} />
      </div>
    ))}
  </>
);

export const Aviso: React.FC<{ s: number }> = ({ s }) =>
  s >= AVISO_ILUSTRACAO.de && s < AVISO_ILUSTRACAO.ate ? (
    <div
      style={{
        position: "absolute",
        top: 130,
        right: 50,
        padding: "8px 18px",
        background: "rgba(0,0,0,0.55)",
        border: "2px solid rgba(255,255,255,0.7)",
        borderRadius: 8,
        fontFamily: MONT,
        fontWeight: 800,
        fontSize: 24,
        letterSpacing: 3,
        color: "rgba(255,255,255,0.9)",
      }}
    >
      ILUSTRAÇÃO · NÃO É REAL
    </div>
  ) : null;

// ---------- Balões de conversa ----------
const Balao: React.FC<{ texto: React.ReactNode; meu?: boolean; s: number; de: number; tam?: number }> = ({ texto, meu = false, s, de, tam = 44 }) => {
  if (s < de) return null;
  const m = mola(s, de, { damping: 12, stiffness: 230, mass: 0.6 });
  return (
    <div style={{ display: "flex", justifyContent: meu ? "flex-end" : "flex-start", margin: "10px 0" }}>
      <div
        style={{
          maxWidth: 640,
          background: meu ? "#1f7a5a" : "#2a2f3a",
          color: "#fff",
          fontFamily: MONT,
          fontWeight: 600,
          fontSize: tam,
          padding: "16px 26px",
          borderRadius: 26,
          borderBottomRightRadius: meu ? 6 : 26,
          borderBottomLeftRadius: meu ? 26 : 6,
          boxShadow: "0 8px 22px rgba(0,0,0,0.4)",
          transformOrigin: meu ? "100% 100%" : "0% 100%",
          transform: `scale(${m})`,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

const Digitando: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ display: "flex", gap: 10, padding: "20px 26px", background: "#2a2f3a", borderRadius: 26, width: "fit-content" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "#cfd6e4", transform: `translateY(${Math.sin(s * 12 - i) * 5}px)` }} />
    ))}
  </div>
);

const CabecalhoChat: React.FC<{ titulo: React.ReactNode; sub?: React.ReactNode }> = ({ titulo, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 18, borderBottom: "2px solid rgba(255,255,255,0.12)", marginBottom: 10 }}>
    <div style={{ width: 74, height: 74, borderRadius: 37, background: "#ff4fa3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#fff", fontFamily: MONT, fontWeight: 900 }}>♥</div>
    <div>
      <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 40, color: "#fff" }}>{titulo}</div>
      {sub && <div style={{ fontFamily: MONT, fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.65)" }}>{sub}</div>}
    </div>
  </div>
);

const CartaoChat: React.FC<{ children: React.ReactNode; s: number; de: number; topo?: number }> = ({ children, s, de, topo = 190 }) => {
  const m = mola(s, de, { damping: 14, stiffness: 200, mass: 0.7 });
  return (
    <div style={{ position: "absolute", top: topo, left: 90, right: 90, transform: `translateY(${(1 - m) * -80}px)`, opacity: Math.min(1, m * 1.5) }}>
      <div style={{ background: "rgba(14,17,24,0.94)", borderRadius: 36, padding: "26px 30px 22px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.08)" }}>
        {children}
      </div>
    </div>
  );
};

// 13,35–15,4 s: "Quer namorar comigo?" → digitando… → "Aceito."
export const ChatPedido: React.FC<{ s: number }> = ({ s }) => {
  if (s < 13.35 || s >= 14.55) return null;
  return (
    <CartaoChat s={s} de={13.35}>
      <CabecalhoChat titulo="Ela" sub={s < MARCOS.aceito ? "digitando…" : "online"} />
      <Balao texto="Quer namorar comigo?" meu s={s} de={13.4} />
      {s < MARCOS.aceito ? s > 13.75 && <Digitando s={s} /> : <Balao texto={<b>Aceito. ♥</b>} s={s} de={MARCOS.aceito} tam={56} />}
    </CartaoChat>
  );
};

// 43,2–45 s: "boa noite, amor" → ele digita "bom dia, amor" letra por letra
export const ChatBomDia: React.FC<{ s: number }> = ({ s }) => {
  if (s < 43.2 || s >= 45.05) return null;
  const frase = "bom dia, amor";
  const n = Math.floor(interpolate(s, [MARCOS.digita, 44.75], [0, frase.length], clamp));
  const enviado = s >= 44.8;
  return (
    <CartaoChat s={s} de={43.2}>
      <CabecalhoChat titulo="♥ Amor" sub="online" />
      <Balao texto="boa noite, amor" s={s} de={43.25} />
      {enviado && <Balao texto="bom dia, amor" meu s={s} de={44.8} />}
      <div style={{ marginTop: 14, background: "#1d222c", borderRadius: 30, padding: "16px 24px", fontFamily: MONT, fontWeight: 600, fontSize: 40, color: "#fff", minHeight: 50 }}>
        {enviado ? <span style={{ color: "rgba(255,255,255,0.4)" }}>Mensagem</span> : frase.slice(0, n)}
        {!enviado && <span style={{ opacity: Math.floor(s * 4) % 2 ? 1 : 0, color: "#25d366" }}>|</span>}
      </div>
    </CartaoChat>
  );
};

// 19,05–21,65 s: o grupo dos solteiros perde o último membro; a tela racha
const RACHADURAS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.2;
  const pts: [number, number][] = [[540, 900]];
  let x = 540;
  let y = 900;
  for (let k = 0; k < 6; k++) {
    const ang = a + Math.sin(i * 7 + k * 3) * 0.35;
    x += Math.cos(ang) * (90 + ((i * 37 + k * 53) % 70));
    y += Math.sin(ang) * (90 + ((i * 41 + k * 29) % 70));
    pts.push([x, y]);
  }
  return pts;
});

export const GrupoSolteiros: React.FC<{ s: number }> = ({ s }) => {
  if (s < 19.05 || s >= 21.65) return null;
  const saiu = s >= MARCOS.saiuDoGrupo;
  const racha = interpolate(s, [20.85, 21.0], [0, 1], clamp);
  const treme = racha > 0 && racha < 1 ? Math.sin(s * 90) * 10 : 0;
  const zoom = 1 + (s - 19.05) * 0.025;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1b2230, #07090d)" }}>
      <div style={{ position: "absolute", top: 250, left: 60, right: 60, transform: `translateX(${treme}px) scale(${zoom * 1.08})`, transformOrigin: "50% 30%" }}>
        <div style={{ background: "#0e1116", borderRadius: 40, padding: "28px 30px", border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 18, borderBottom: "2px solid rgba(255,255,255,0.12)", marginBottom: 12 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: "#2b3445", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 38, color: OURO }}>S</div>
            <div>
              <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 38, color: "#fff" }}>SOLTEIROS ATÉ MORRER</div>
              <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: 30, color: saiu ? "#ff6b6b" : "rgba(255,255,255,0.65)" }}>{saiu && s > 20.4 ? "1 membro" : "2 membros"}</div>
            </div>
          </div>
          <Balao texto={<><b style={{ color: "#53bdeb" }}>{AMIGO}</b><br />sexta tem jogo?</>} s={s} de={19.15} tam={46} />
          <Balao texto="claro, eu nunca tenho compromisso" meu s={s} de={19.55} tam={46} />
          <Balao texto={<><b style={{ color: "#53bdeb" }}>{AMIGO}</b><br />kkkkk solteiro raiz</>} s={s} de={19.95} tam={46} />
          {saiu && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <div
                style={{
                  background: "rgba(220,38,38,0.18)",
                  border: "2px solid #ef4444",
                  color: "#ff8a8a",
                  fontFamily: MONT,
                  fontWeight: 800,
                  fontSize: 34,
                  padding: "10px 24px",
                  borderRadius: 16,
                  transform: `scale(${mola(s, MARCOS.saiuDoGrupo)})`,
                }}
              >
                {NOME} saiu do grupo
              </div>
            </div>
          )}
        </div>
      </div>
      {racha > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {RACHADURAS.map((p, i) => {
            const pts = p.slice(0, 1 + Math.ceil((p.length - 1) * racha));
            return (
              <g key={i}>
                <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={9} />
                <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={3.5} />
              </g>
            );
          })}
          <circle cx={540} cy={900} r={26 * racha} fill="rgba(255,255,255,0.85)" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

// ---------- Clarões ----------
export const Clarao: React.FC<{ s: number }> = ({ s }) => {
  const rosa = interpolate(s, [MARCOS.aceito, MARCOS.aceito + 0.05, MARCOS.aceito + 0.35], [0, 0.55, 0], clamp);
  const branco = interpolate(s, [MARCOS.explosao - 0.02, MARCOS.explosao + 0.04, MARCOS.explosao + 0.6], [0, 0.95, 0], clamp);
  return (
    <>
      {rosa > 0 && <AbsoluteFill style={{ background: "#ff4fb8", opacity: rosa, mixBlendMode: "screen" }} />}
      {branco > 0 && <AbsoluteFill style={{ background: "#fff4e0", opacity: branco }} />}
    </>
  );
};

// ---------- Cartaz final ----------
export const Cartaz: React.FC<{ s: number }> = ({ s }) => {
  const ini = 55.4;
  if (s < ini) return null;
  const escuro = interpolate(s, [ini, ini + 0.4], [0, 0.72], clamp);
  const selo = mola(s, ini + 0.1, { damping: 9, stiffness: 150, mass: 0.9 });
  const caixa = mola(s, ini + 0.45);
  const linha2 = mola(s, ini + 0.8);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: escuro }} />
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Selo texto="E SE…?" m={selo} giro={-5 + Math.sin(s * 2.5) * 2} tam={190} />
      </div>
      <div style={{ position: "absolute", top: 820, left: 110, right: 110, transform: `scale(${caixa})`, opacity: Math.min(1, caixa * 1.5) }}>
        <div style={{ background: "rgba(9,20,48,0.95)", border: "4px solid #d4af37", borderRadius: 22, padding: "30px 40px 34px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: "#d4af37", marginBottom: 14 }}>STATUS ATUAL</div>
          <div style={{ fontFamily: ANTON, fontSize: 84, lineHeight: 1.12, color: "#fff" }}>
            {NOME.toUpperCase()}: <span style={{ color: OURO }}>SOLTEIRO</span>
          </div>
          <div style={{ fontFamily: ANTON, fontSize: 84, lineHeight: 1.12, color: "#fff", opacity: linha2, transform: `translateX(${(1 - linha2) * -60}px)` }}>
            PLANETA: <span style={{ color: "#4ade80" }}>A SALVO</span>
          </div>
        </div>
      </div>
      {ARROBA && (
        <div style={{ position: "absolute", top: 1380, left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 56, color: "#fff", textShadow: CONTORNO, opacity: linha2 }}>
          {ARROBA}
        </div>
      )}
    </AbsoluteFill>
  );
};
