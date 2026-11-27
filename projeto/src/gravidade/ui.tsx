import { AbsoluteFill, interpolate, spring } from "remotion";
import { CENAS, clamp, FIM_HUD, FPS, HUD, LEGENDAS, MARCOS } from "./tempo";
import {
  AMARELO,
  AMARELO_FUNDO,
  balanco,
  BRANCO_FUNDO,
  extrusao,
  extrusaoCaixa,
  FONTE_TEXTO,
  FONTE_TITULO,
  Palavras3D,
} from "./texto3d";

// Elementos 2D por cima das cenas 3D. Área segura: nada importante nas bordas,
// legendas acima dos botões do TikTok/Reels.

const SOMBRA = "0 2px 4px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.55)";
const AZUL_PLACA = "#1f4e9c";

// Entrada com mola, contada em quadros a partir de um segundo
const mola = (segundos: number, inicio: number, config = { damping: 14, stiffness: 160 }) =>
  spring({ frame: (segundos - inicio) * FPS, fps: FPS, config });

// ---------- Pergunta de abertura ----------
// "E SE A GRAVIDADE / DA TERRA CAÍSSE / PELA METADE?" e, quando o narrador continua,
// "VAMOS COMEÇAR PELA [placa AVENIDA PAULISTA]". As linhas entram junto com a voz.
export const Pergunta: React.FC<{ segundos: number }> = ({ segundos }) => {
  const SAI = 4.35;
  const saida = interpolate(segundos, [SAI, SAI + 0.4], [0, 1], clamp);
  if (saida >= 1) return null;
  const { rotY, rotX } = balanco(segundos, 0.8);
  const placa = mola(segundos, 3.05, { damping: 11, stiffness: 120 });
  const linhaPlaca = mola(segundos, 2.95);

  return (
    <div
      style={{
        position: "absolute",
        top: 520,
        left: 0,
        right: 0,
        perspective: 1200,
        opacity: 1 - saida,
        transform: `translateY(${-saida * 120}px) scale(${1 + saida * 0.15})`,
      }}
    >
      <div style={{ transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`, transformStyle: "preserve-3d" }}>
        <Palavras3D texto="E se a gravidade" t={segundos - 0.15} duracao={99} tamanho={108} />
        <Palavras3D texto="da Terra caísse" t={segundos - 0.6} duracao={99} tamanho={108} />
        <Palavras3D texto="pela **metade?**" t={segundos - 1.4} duracao={99} tamanho={108} />
        <div style={{ marginTop: 34 }}>
          <Palavras3D texto="Vamos começar pela" t={segundos - 2.5} duracao={99} tamanho={64} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "14px 0 0",
            opacity: Math.min(1, linhaPlaca * 1.5),
          }}
        >
          {/* Placa azul de rua de São Paulo, girando como se estivesse presa num poste */}
          <div
            style={{
              transformOrigin: "0% 50%",
              transform: `rotateY(${(1 - placa) * -100}deg) rotateZ(${Math.sin(segundos * 2.2) * 1.2 * placa}deg)`,
              background: AZUL_PLACA,
              borderRadius: 12,
              padding: 7,
              boxShadow: extrusaoCaixa("#123166", 12),
            }}
          >
            <div
              style={{
                border: "5px solid #ffffff",
                borderRadius: 7,
                padding: "6px 26px 2px",
                fontFamily: FONTE_TITULO,
                fontSize: 80,
                lineHeight: 1.08,
                color: "#ffffff",
                letterSpacing: 1,
                textShadow: "0 3px 0 rgba(0,0,0,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              AVENIDA PAULISTA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- HUD do canto ----------
const Rotulo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: FONTE_TEXTO,
      fontWeight: 800,
      fontSize: 24,
      letterSpacing: 5,
      color: "rgba(255,255,255,0.88)",
      textShadow: SOMBRA,
    }}
  >
    {children}
  </div>
);

export const Hud: React.FC<{ segundos: number }> = ({ segundos }) => {
  if (segundos >= FIM_HUD) return null;
  const queda = MARCOS.quedaGravidade;
  // O número da gravidade cai de 9,8 para 4,9 em meio segundo e pisca em vermelho;
  // na volta ao real, sobe de novo para 9,8 e pisca em verde
  const real = CENAS.real.inicio;
  const g =
    segundos < real
      ? interpolate(segundos, [queda, queda + 0.5], [9.8, 4.9], clamp)
      : interpolate(segundos, [real + 0.3, real + 0.9], [4.9, 9.8], clamp);
  const alerta = interpolate(segundos, [queda, queda + 0.15, queda + 1.6], [0, 1, 0], clamp);
  const alivio = interpolate(segundos, [real + 0.3, real + 0.5, real + 2], [0, 1, 0], clamp);
  const estado = [...HUD].reverse().find((h) => segundos >= h.inicio) ?? HUD[0];
  // Antes do meio-dia, os segundos contam (11:59:55 … 11:59:59) até virar 12:00
  const relogio = estado.relogio.includes("{s}")
    ? estado.relogio.replace("{s}", String(Math.max(0, 9 - Math.floor(MARCOS.meioDia - segundos))))
    : estado.relogio;
  // O número dá um pulo quando cai e quando volta; o rótulo de baixo vira ao trocar
  const pulo = Math.max(alerta, alivio);
  const troca = mola(segundos, estado.inicio, { damping: 12, stiffness: 200 });
  const entrada = mola(segundos, 0.2);
  const cor = `rgb(${Math.round(255 - alivio * 175)}, ${Math.round(255 - alerta * 170)}, ${Math.round(255 - alerta * 190 - alivio * 130)})`;
  const corFundo = alerta > 0.05 ? "#6b0f0a" : alivio > 0.05 ? "#0d5a2a" : BRANCO_FUNDO;

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 70,
        perspective: 800,
        opacity: entrada,
        transform: `translateX(${(1 - entrada) * -60}px)`,
      }}
    >
      <div style={{ transform: `rotateY(${8 + Math.sin(segundos * 0.8) * 3}deg)`, transformOrigin: "0 50%" }}>
        <Rotulo>GRAVIDADE</Rotulo>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 92,
            lineHeight: 1.05,
            color: cor,
            textShadow: extrusao(corFundo, 7, -0.5, 1),
            marginBottom: 14,
            transform: `scale(${1 + pulo * 0.18})`,
            transformOrigin: "0 70%",
          }}
        >
          {g.toFixed(1).replace(".", ",")} <span style={{ fontSize: 42 }}>m/s²</span>
        </div>
        <Rotulo>{estado.local}</Rotulo>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 60,
            lineHeight: 1.1,
            color: "#ffffff",
            textShadow: extrusao(BRANCO_FUNDO, 6, -0.5, 1),
            transform: `rotateX(${(1 - troca) * 90}deg)`,
            transformOrigin: "0 100%",
          }}
        >
          {relogio}
        </div>
      </div>
    </div>
  );
};

// ---------- Legendas curtas em 3D ----------
export const Legendas: React.FC<{ segundos: number }> = ({ segundos }) => {
  const l = LEGENDAS.find((x) => segundos >= x.inicio && segundos < x.fim);
  if (!l) return null;
  return (
    <div style={{ position: "absolute", top: 1250, left: 0, right: 0 }}>
      <Palavras3D texto={l.texto} t={segundos - l.inicio} duracao={l.fim - l.inicio} tamanho={88} largura={900} />
    </div>
  );
};

// Etiqueta com o nome do personagem quando ele aparece pela primeira vez
export const Etiqueta: React.FC<{ segundos: number; texto: string; inicio: number; fim: number; topo: number }> = ({
  segundos,
  texto,
  inicio,
  fim,
  topo,
}) => {
  if (segundos < inicio || segundos >= fim) return null;
  const e = mola(segundos, inicio, { damping: 12, stiffness: 180 });
  const sai = interpolate(segundos, [fim - 0.3, fim], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, display: "flex", justifyContent: "center", perspective: 700 }}>
      <div
        style={{
          padding: "10px 30px 8px",
          borderRadius: 10,
          background: "rgba(10,10,14,0.78)",
          borderBottom: `6px solid ${AMARELO}`,
          color: "#ffffff",
          fontFamily: FONTE_TITULO,
          fontSize: 46,
          letterSpacing: 6,
          boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
          opacity: e * (1 - sai),
          transform: `rotateX(${(1 - e) * -90 + sai * 90}deg) rotateY(${Math.sin(segundos * 1.4) * 8}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// As três coisas que a gravidade segura (cartões que viram um por um na promessa)
export const Promessa: React.FC<{ segundos: number }> = ({ segundos }) => {
  if (segundos < CENAS.promessa.inicio || segundos >= CENAS.promessa.fim) return null;
  const itens = [
    { t: MARCOS.promessaPe, texto: "seu pé no chão" },
    { t: MARCOS.promessaAr, texto: "o ar em volta da Terra" },
    { t: MARCOS.promessaTerra, texto: "a Terra em volta do Sol" },
  ];
  const sumir = interpolate(segundos, [CENAS.promessa.fim - 0.4, CENAS.promessa.fim], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 1120,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 34,
        perspective: 1000,
      }}
    >
      <div style={{ fontFamily: FONTE_TEXTO, fontWeight: 900, fontSize: 30, letterSpacing: 8, color: "#fff", textShadow: SOMBRA, opacity: sumir * mola(segundos, MARCOS.promessaPe - 0.3) }}>
        A GRAVIDADE SEGURA
      </div>
      {itens.map((item, i) => {
        const e = mola(segundos, item.t, { damping: 12, stiffness: 150 });
        const ultimo = i === 2;
        return (
          <div
            key={item.texto}
            style={{
              padding: "16px 40px 12px",
              borderRadius: 18,
              background: ultimo ? AMARELO : "#ffffff",
              color: "#15171c",
              fontFamily: FONTE_TITULO,
              fontSize: 58,
              letterSpacing: 1,
              boxShadow: extrusaoCaixa(ultimo ? AMARELO_FUNDO : "#8b93a3", 10),
              opacity: Math.min(1, e * 1.5) * sumir,
              transform: `rotateY(${(1 - e) * (i % 2 ? 100 : -100)}deg) rotateX(10deg) rotateZ(${(i - 1) * -2.5}deg) translateY(${Math.sin(segundos * 1.6 + i) * 6}px)`,
            }}
          >
            ↓ {item.texto.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};

// Alerta no estilo de painel (ex.: "SEM ADERÊNCIA")
export const Alerta: React.FC<{ segundos: number; inicio: number; fim: number; texto: string }> = ({
  segundos,
  inicio,
  fim,
  texto,
}) => {
  if (segundos < inicio || segundos >= fim) return null;
  const e = mola(segundos, inicio, { damping: 9, stiffness: 220 });
  const pisca = Math.floor((segundos - inicio) * 4) % 2 === 0 ? 1 : 0.6;
  const tremor = Math.sin(segundos * 70) * 4 * (1 - e * 0.6);
  return (
    <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", perspective: 800 }}>
      <div
        style={{
          padding: "16px 34px 10px",
          border: "5px solid #ff3b30",
          borderRadius: 12,
          background: "rgba(40,0,0,0.78)",
          color: "#ff6b60",
          fontFamily: FONTE_TITULO,
          fontSize: 70,
          letterSpacing: 6,
          textShadow: extrusao("#5a0905", 6, 0, 1),
          opacity: pisca,
          boxShadow: "0 0 40px rgba(255,59,48,0.65)",
          transform: `translateX(${tremor}px) rotateX(12deg) scale(${0.6 + 0.4 * e})`,
        }}
      >
        ⚠ {texto}
      </div>
    </div>
  );
};

// Tinta sobre a imagem (frio azul, flash branco etc.)
export const Tinta: React.FC<{ cor: string; opacidade: number; modo?: React.CSSProperties["mixBlendMode"] }> = ({
  cor,
  opacidade,
  modo = "normal",
}) =>
  opacidade <= 0 ? null : (
    <AbsoluteFill style={{ background: cor, opacity: opacidade, mixBlendMode: modo, pointerEvents: "none" }} />
  );

export const CartazFinal: React.FC<{ segundos: number }> = ({ segundos }) => {
  if (segundos < MARCOS.cartaz) return null;
  const t = segundos - MARCOS.cartaz;
  const fundo = interpolate(t, [0, 0.35], [0, 1], clamp);
  const eSe = mola(segundos, MARCOS.cartaz + 0.45, { damping: 10, stiffness: 120 });
  const botao = mola(segundos, MARCOS.cartaz + 0.9, { damping: 11, stiffness: 180 });
  const { rotY, rotX } = balanco(t, 1.6);
  const dx = -rotY * 0.12;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 42%, #2c2416 0%, #0c0a08 72%)",
        opacity: fundo,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 40,
        perspective: 1200,
      }}
    >
      <div style={{ transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`, transformStyle: "preserve-3d", textAlign: "center" }}>
        <Palavras3D texto="Qual vai ser o próximo" t={t - 0.1} duracao={99} tamanho={104} largura={860} />
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 300,
            lineHeight: 1,
            color: AMARELO,
            textShadow: extrusao(AMARELO_FUNDO, 18, dx, 1.4),
            opacity: Math.min(1, eSe * 1.5),
            transform: `scale(${0.3 + 0.7 * eSe}) rotateZ(${(1 - eSe) * -20}deg)`,
          }}
        >
          E SE?
        </div>
      </div>
      <div
        style={{
          padding: "22px 46px 18px",
          borderRadius: 18,
          background: "#ffffff",
          color: "#15171c",
          fontFamily: FONTE_TITULO,
          fontSize: 54,
          letterSpacing: 3,
          boxShadow: extrusaoCaixa("#8b93a3", 10),
          opacity: botao,
          transform: `scale(${0.7 + 0.3 * botao}) translateY(${Math.sin(t * 3) * 6}px)`,
        }}
      >
        COMENTA AQUI ↓
      </div>
    </AbsoluteFill>
  );
};
