import { AbsoluteFill, interpolate, random } from "remotion";
import { clamp, COR, FONTE } from "../aurora/estilo";

// Efeitos especiais do ep. 3 (pedido do usuário na V1): faíscas verdes quando o poder liga,
// ondulação na parede, flash de impacto, linhas de velocidade, onomatopeia e chiado de câmera.
// Todos recebem `t` (s) relativo ao momento do efeito e somem sozinhos.

// Explosão de faíscas verde-aurora saindo de (x, y).
export const Faiscas: React.FC<{ t: number; x: number; y: number; n?: number; raio?: number; semente?: string }> = ({ t, x, y, n = 18, raio = 260, semente = "f" }) => {
  if (t < 0 || t > 0.9) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const a = random(`${semente}a${i}`) * Math.PI * 2;
        const v = 0.5 + random(`${semente}v${i}`) * 0.5;
        const d = raio * v * (1 - Math.pow(1 - t / 0.9, 2));
        const px = x + Math.cos(a) * d;
        const py = y + Math.sin(a) * d + t * t * 120;
        const r = (4 + random(`${semente}r${i}`) * 7) * (1 - t / 0.9);
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={r * 2.4} fill={COR.aurora} opacity={0.25} />
            <circle cx={px} cy={py} r={r} fill="#E8FFF4" />
          </g>
        );
      })}
    </svg>
  );
};

// Ondulação verde (anéis abrindo), ex.: onde ele entra na parede ou afunda no chão.
export const Onda: React.FC<{ t: number; x: number; y: number; rx?: number; ry?: number }> = ({ t, x, y, rx = 160, ry = 60 }) => {
  if (t < 0 || t > 1.0) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      {[0, 0.2, 0.4].map((d) => {
        const k = interpolate(t - d, [0, 0.6], [0, 1], clamp);
        if (t - d < 0) return null;
        return <ellipse key={d} cx={x} cy={y} rx={rx * (0.3 + k)} ry={ry * (0.3 + k)} fill="none" stroke={COR.aurora} strokeWidth={10 * (1 - k)} opacity={1 - k} />;
      })}
    </svg>
  );
};

// Flash branco de impacto.
export const Flash: React.FC<{ t: number; forca?: number; cor?: string }> = ({ t, forca = 0.7, cor = "#fff" }) => {
  if (t < 0 || t > 0.25) return null;
  return <AbsoluteFill style={{ background: cor, opacity: forca * (1 - t / 0.25), pointerEvents: "none" }} />;
};

// Tremor de câmera (px) nos impactos: some em `dur` s.
export const tremor = (t: number, forca = 14, dur = 0.3) => (t < 0 || t > dur ? 0 : Math.sin(t * 95) * forca * (1 - t / dur));

// Linhas de velocidade: verticais subindo (queda) ou horizontais (corrida).
export const Velocidade: React.FC<{ t: number; vertical?: boolean; n?: number; cor?: string; forca?: number }> = ({ t, vertical = true, n = 22, cor = "255,255,255", forca = 0.5 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
    {new Array(n).fill(0).map((_, i) => {
      const base = random(`vel${i}`) * (vertical ? 1080 : 1920);
      const comp = 160 + random(`velc${i}`) * 320;
      const v = 2400 + random(`velv${i}`) * 1800;
      const p = (((random(`velp${i}`) * 3000 - t * v) % 3000) + 3000) % 3000 - 500;
      return vertical ? (
        <rect key={i} x={base} y={p} width={4} height={comp} fill={`rgba(${cor},${forca})`} />
      ) : (
        <rect key={i} x={p} y={base} width={comp} height={4} fill={`rgba(${cor},${forca})`} />
      );
    })}
  </svg>
);

// Onomatopeia de quadrinho: entra com soco de escala e some.
export const Onom: React.FC<{ t: number; texto: string; x: number; y: number; cor?: string; ang?: number; tam?: number; dur?: number }> = ({ t, texto, x, y, cor = COR.amarelo, ang = -8, tam = 130, dur = 0.9 }) => {
  if (t < 0 || t > dur) return null;
  const k = interpolate(t, [0, 0.08, 0.16], [0.3, 1.25, 1], clamp);
  const op = interpolate(t, [dur - 0.2, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${ang}deg) scale(${k})`,
        opacity: op,
        fontFamily: FONTE,
        fontWeight: 800,
        fontSize: tam,
        color: cor,
        WebkitTextStroke: "6px #1A1420",
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 #1A1420",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {texto}
    </div>
  );
};

// Chiado de câmera de segurança: faixas deslocadas piscando.
export const Chiado: React.FC<{ t: number }> = ({ t }) => {
  const f = Math.floor(t * 30);
  const ativo = f % 23 < 3;
  if (!ativo) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      {new Array(6).fill(0).map((_, i) => {
        const y = random(`ch${f}y${i}`) * 1920;
        const h = 10 + random(`ch${f}h${i}`) * 60;
        return <rect key={i} x={0} y={y} width={1080} height={h} fill={i % 2 ? "rgba(255,255,255,0.18)" : "rgba(60,240,160,0.15)"} transform={`translate(${(random(`ch${f}x${i}`) - 0.5) * 80} 0)`} />;
      })}
    </svg>
  );
};
