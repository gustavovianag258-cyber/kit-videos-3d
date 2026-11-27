import { loadFont as carregarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as carregarMontserrat } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { balanco, Palavras3D } from "../gravidade/texto3d";
import { ARROBA, AVISOS, clamp, ETIQUETAS, FPS, HUDS, LEGENDAS, MARCOS, planoEm, SELOS, TINTAS } from "./tempo";

// Textos por cima das cenas: pergunta 3D de abertura, legenda em CAIXA ALTA (branca com contorno,
// palavra-chave amarela), HUD azul-marinho com borda dourada contando os anos, selos, etiquetas,
// avisos de ficção, transições entre os planos e o cartaz final.

const ANTON = carregarAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const MONT = carregarMontserrat("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
const OURO = "#F5C518";
const VERDE_ALIEN = "#7CFF6B";

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

// ---------- Pergunta de abertura (as linhas entram junto com a voz) ----------
export const Pergunta: React.FC<{ s: number }> = ({ s }) => {
  const SAI = 4.2;
  const saida = interpolate(s, [SAI, SAI + 0.35], [0, 1], clamp);
  if (saida >= 1) return null;
  const { rotY, rotX } = balanco(s, 0.8);
  return (
    <div
      style={{
        position: "absolute",
        top: 410,
        left: 0,
        right: 0,
        perspective: 1200,
        opacity: 1 - saida,
        transform: `translateY(${-saida * 120}px) scale(${1 + saida * 0.15})`,
      }}
    >
      <div style={{ transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`, transformStyle: "preserve-3d" }}>
        <Palavras3D texto="E se você" t={s - 0.3} duracao={99} tamanho={112} />
        <Palavras3D texto="acordasse amanhã" t={s - 0.72} duracao={99} tamanho={112} />
        <Palavras3D texto="e **não pudesse**" t={s - 2.15} duracao={99} tamanho={112} />
        <Palavras3D texto="mais **morrer?**" t={s - 3.0} duracao={99} tamanho={128} />
      </div>
    </div>
  );
};

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
    .reduce<{ p: string; chave: boolean }[]>((acc, w) => {
      if (/^[.,:;…!?]+$/.test(w.p) && acc.length) acc[acc.length - 1] = { ...acc[acc.length - 1], p: acc[acc.length - 1].p + w.p };
      else acc.push(w);
      return acc;
    }, []);
  const grande = palavras.length <= 2;
  const tam = grande ? 120 : 90;
  const sai = interpolate(s, [l.ate - 0.08, l.ate], [1, 0.85], clamp);
  const corChave = l.cor === "alien" ? VERDE_ALIEN : OURO;
  return (
    <div style={{ position: "absolute", top: 1150, left: 50, right: 50, display: "flex", justifyContent: "center", perspective: 1000 }}>
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
                color: w.chave ? corChave : l.cor === "alien" ? "#d9ffd2" : "#ffffff",
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

// ---------- Etiquetas ----------
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
              fontSize: 54,
              letterSpacing: 2,
              color: "#ffffff",
              boxShadow: "0 10px 0 rgba(0,0,0,0.45), 0 18px 34px rgba(0,0,0,0.5)",
              transform: `scale(${m * sai}) rotate(${(1 - m) * -8}deg)`,
              opacity: sai,
              whiteSpace: "nowrap",
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
const formatar = (n: number) => Math.round(n).toLocaleString("pt-BR");

export const Hud: React.FC<{ s: number }> = ({ s }) => {
  const h = HUDS.find((x) => s >= x.de && s < x.ate);
  if (!h) return null;
  // só "entra" quando o anterior não era a mesma caixa (troca de número dá só um soco)
  const anterior = HUDS[HUDS.indexOf(h) - 1];
  const mesmaCaixa = anterior && anterior.ate === h.de && anterior.rotulo === h.rotulo && !!anterior.alerta === !!h.alerta;
  const entra = mesmaCaixa ? 1 : mola(s, h.de, { damping: 14, stiffness: 200, mass: 0.7 });
  const pisca = h.alerta ? 0.7 + 0.3 * Math.abs(Math.sin(s * 8)) : 1;
  const borda = h.alerta ? "#ff3b3b" : "#d4af37";
  const valor =
    typeof h.valor === "string"
      ? h.valor
      : formatar(interpolate(s, [h.de + 0.1, h.valor.ate], [h.valor.de, h.valor.para], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }));
  const contando = typeof h.valor !== "string" && s < h.valor.ate;
  const soco = contando ? 1 + Math.abs(Math.sin(s * 22)) * 0.03 : interpolate((s - h.de) * FPS, [2, 6, 11], [1, 1.12, 1], clamp);
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
        style={{
          fontFamily: ANTON,
          fontSize: valor === "∞" ? 190 : valor.length > 6 ? 112 : 150,
          lineHeight: valor === "∞" ? 0.9 : 1.02,
          // acentos (BILHÃO, BILHÕES) não podem invadir o rótulo de cima
          marginTop: /[ÃÕÉÍÓ]/.test(valor) ? 16 : 0,
          color: "#ffffff",
          textShadow: "0 5px 0 rgba(0,0,0,0.45)",
          transform: `scale(${soco})`,
          transformOrigin: "0% 60%",
          whiteSpace: "nowrap",
        }}
      >
        {valor}
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
    {SELOS.filter((x) => s >= x.de && s < x.ate).map((x) => (
      <div key={x.texto} style={{ position: "absolute", top: x.topo, right: 70 }}>
        <Selo texto={x.texto} m={mola(s, x.de, { damping: 9, stiffness: 220, mass: 0.6 }) * interpolate(s, [x.ate - 0.1, x.ate], [1, 0], clamp)} giro={8} />
      </div>
    ))}
  </>
);

// ---------- Avisos de ficção / estimativa ----------
export const Avisos: React.FC<{ s: number }> = ({ s }) => {
  const a = AVISOS.find((x) => s >= x.de && s < x.ate);
  if (!a) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 130,
        right: 50,
        maxWidth: 470,
        padding: "8px 18px",
        background: "rgba(0,0,0,0.55)",
        border: "2px solid rgba(255,255,255,0.7)",
        borderRadius: 8,
        fontFamily: MONT,
        fontWeight: 800,
        fontSize: 22,
        lineHeight: 1.3,
        letterSpacing: 2.5,
        textAlign: "right",
        color: "rgba(255,255,255,0.9)",
        opacity: interpolate(s, [a.de, a.de + 0.2], [0, 1], clamp),
      }}
    >
      {a.texto}
    </div>
  );
};

// ---------- Cor da escalada ----------
export const Tinta: React.FC<{ s: number }> = ({ s }) => {
  const t = TINTAS.find((x) => s >= x.de && s < x.ate);
  if (!t) return null;
  const k = interpolate(s, [t.de, t.de + 0.3, t.ate - 0.2, t.ate], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ background: t.cor, opacity: t.forca * k, mixBlendMode: "soft-light" }} />;
};

// ---------- Transições (chicote, flash, glitch, zoom) ----------
export const Transicoes: React.FC<{ s: number }> = ({ s }) => {
  const p = planoEm(s);
  const t = p.t;
  if (t > 0.3) return null;
  if (p.tr === "flash") {
    const o = interpolate(t, [0, 0.04, 0.28], [0.95, 0.8, 0], clamp);
    return <AbsoluteFill style={{ background: "#fff8ec", opacity: o }} />;
  }
  if (p.tr === "whip") {
    // faixas borradas atravessando a tela na direção do chicote
    const k = interpolate(t, [0, 0.2], [1, 0], clamp);
    if (k <= 0) return null;
    const dir = Math.round(p.de * 10) % 2 ? 1 : -1;
    return (
      <AbsoluteFill style={{ overflow: "hidden", opacity: k }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * 220 - 40,
              left: dir * (1 - k) * 900 - 300,
              width: 1700,
              height: 140 + (i % 3) * 50,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              filter: "blur(18px)",
            }}
          />
        ))}
        <AbsoluteFill style={{ backdropFilter: `blur(${k * 14}px)` }} />
      </AbsoluteFill>
    );
  }
  if (p.tr === "zoom") {
    const k = interpolate(t, [0, 0.22], [1, 0], clamp);
    if (k <= 0) return null;
    return (
      <AbsoluteFill
        style={{
          opacity: k,
          background: "radial-gradient(circle at 50% 45%, transparent 18%, rgba(255,255,255,0.28) 45%, rgba(0,0,0,0.5) 80%)",
          transform: `scale(${1 + (1 - k) * 0.6})`,
        }}
      />
    );
  }
  if (p.tr === "glitch") {
    const f = Math.floor(t * FPS);
    if (f > 6) return null;
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {Array.from({ length: 7 }, (_, i) => {
          const y = ((i * 263 + f * 151) % 1920) | 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: ((i * 97 + f * 41) % 120) - 60,
                width: 1200,
                height: 18 + ((i * 31 + f * 7) % 60),
                background: i % 3 === 0 ? "rgba(255,0,90,0.45)" : i % 3 === 1 ? "rgba(0,240,255,0.4)" : "rgba(255,255,255,0.3)",
                mixBlendMode: "screen",
              }}
            />
          );
        })}
        <AbsoluteFill style={{ background: "#000", opacity: f < 2 ? 0.5 : 0 }} />
      </AbsoluteFill>
    );
  }
  return null;
};

// Clarão do impacto e do disparo; o golpe forte do fim da Terra
export const Clarao: React.FC<{ s: number }> = ({ s }) => {
  const laser = interpolate(s, [MARCOS.bateLaser - 0.03, MARCOS.bateLaser + 0.03, MARCOS.bateLaser + 0.5], [0, 0.9, 0], clamp);
  const fim = interpolate(s, [MARCOS.terraAcaba - 0.02, MARCOS.terraAcaba + 0.05, MARCOS.terraAcaba + 0.7], [0, 0.95, 0], clamp);
  return (
    <>
      {laser > 0 && <AbsoluteFill style={{ background: "#9dff7a", opacity: laser, mixBlendMode: "screen" }} />}
      {fim > 0 && <AbsoluteFill style={{ background: "#ffe6c4", opacity: fim }} />}
    </>
  );
};

// ---------- Cartaz final ----------
export const Cartaz: React.FC<{ s: number }> = ({ s }) => {
  const ini = MARCOS.cartaz + 0.25;
  if (s < ini) return null;
  const selo = mola(s, ini, { damping: 9, stiffness: 150, mass: 0.9 });
  const caixa = mola(s, ini + 0.45);
  const seta = mola(s, 96.65, { damping: 10, stiffness: 180, mass: 0.7 });
  const vai = Math.sin(s * 6) * 14 * seta;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", perspective: 900 }}>
        <div style={{ transform: `rotateY(${Math.sin(s * 1.4) * 14}deg) rotateX(${8 + Math.sin(s) * 4}deg)` }}>
          <Selo texto="E SE…?" m={selo} giro={-5 + Math.sin(s * 2.5) * 2} tam={190} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 700, left: 120, right: 120, transform: `scale(${caixa})`, opacity: Math.min(1, caixa * 1.5) }}>
        <div style={{ background: "rgba(9,20,48,0.95)", border: "4px solid #d4af37", borderRadius: 22, padding: "30px 40px 34px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", textAlign: "center" }}>
          <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: "#d4af37", marginBottom: 10 }}>PRÓXIMO “E SE”</div>
          <div style={{ fontFamily: ANTON, fontSize: 104, lineHeight: 1.05, color: "#fff" }}>
            <span style={{ color: OURO }}>VOCÊ</span> DECIDE
          </div>
        </div>
      </div>
      {/* seta descendo para o botão de comentários (lado direito da tela no Reels/TikTok) */}
      <div
        style={{
          position: "absolute",
          top: 1330 + vai,
          right: 70,
          opacity: seta,
          transform: `scale(${seta}) rotate(${-28}deg)`,
          fontFamily: ANTON,
          fontSize: 190,
          color: OURO,
          textShadow: CONTORNO,
        }}
      >
        ↓
      </div>
      {ARROBA && (
        <div style={{ position: "absolute", top: 1000, left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 56, color: "#fff", textShadow: CONTORNO, opacity: caixa }}>
          {ARROBA}
        </div>
      )}
    </AbsoluteFill>
  );
};
