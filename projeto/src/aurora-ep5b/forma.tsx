import { random } from "remotion";
import { FONTE } from "../aurora/estilo";
import { Cam, CAM_PADRAO, P, pts } from "./galpao";

// Forma de madeira em que o Denis está, com tábua, sarrafo, prego e escora mal feita.
// (cx) = centro em x. Largura e fundo em pixels do mundo. `nivel` = altura do concreto.
export const FX = 300;
export const FZ = 200;
export const FH = 460;

const madeira = ["#8E6B42", "#7F5F39", "#96734A", "#86653C", "#8B683F", "#7A5B36", "#916E45"];

// Parte de trás: faces internas e o concreto que aparece em volta dele. Vem antes do Denis.
export const FormaAtras: React.FC<{ c?: Cam; cx: number; nivel: number; t: number; altura?: number }> = ({ c = CAM_PADRAO, cx, nivel, t, altura = FH }) => {
  const e = cx - FX;
  const d = cx + FX;
  return (
    <g>
      <defs>
        <linearGradient id="internaT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8D6A3F" />
          <stop offset="1" stopColor="#4A3620" />
        </linearGradient>
        <radialGradient id="concretoG" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#B5B3AB" />
          <stop offset="1" stopColor="#74746F" />
        </radialGradient>
      </defs>
      <polygon points={pts(c, [[e - 90, 0, -FZ - 40], [d + 90, 0, -FZ - 40], [d + 150, 0, FZ + 60], [e - 150, 0, FZ + 60]])} fill="#000" opacity={0.4} style={{ filter: "blur(14px)" }} />
      {/* face de trás, com a tábua aparecendo por dentro */}
      <polygon points={pts(c, [[e, nivel - 40, FZ], [d, nivel - 40, FZ], [d, altura, FZ], [e, altura, FZ]])} fill="url(#internaT)" />
      {[0.33, 0.66].map((u) => (
        <line key={u} x1={P(c, e, altura - (altura - nivel) * u, FZ)[0]} x2={P(c, d, altura - (altura - nivel) * u, FZ)[0]} y1={P(c, e, altura - (altura - nivel) * u, FZ)[1]} y2={P(c, d, altura - (altura - nivel) * u, FZ)[1]} stroke="#2E2112" strokeWidth={3} />
      ))}
      {/* faces de lado */}
      <polygon points={pts(c, [[e, nivel - 40, -FZ], [e, nivel - 40, FZ], [e, altura, FZ], [e, altura, -FZ]])} fill="#6F5230" />
      <polygon points={pts(c, [[d, nivel - 40, -FZ], [d, nivel - 40, FZ], [d, altura, FZ], [d, altura, -FZ]])} fill="#5E4528" />
      {/* borda de cima da tábua */}
      <polygon points={pts(c, [[e - 24, altura, FZ + 24], [d + 24, altura, FZ + 24], [d + 24, altura, FZ], [e - 24, altura, FZ]])} fill="#B38E5C" />
      {/* concreto de trás até o corpo */}
      <polygon points={pts(c, [[e, nivel, FZ], [d, nivel, FZ], [d, nivel, 0], [e, nivel, 0]])} fill="url(#concretoG)" />
      {new Array(7).fill(0).map((_, i) => {
        const r = (s: string) => random(`cr${i}${s}`);
        const [a, b, k] = P(c, e + r("x") * FX * 2, nivel, r("z") * FZ);
        return <ellipse key={i} cx={a} cy={b} rx={(60 + r("r") * 70) * k} ry={(9 + r("r") * 8) * k} fill="#5E5F5B" opacity={0.26} />;
      })}
      {/* vapor saindo da mistura */}
      {[0, 1, 2].map((i) => {
        const [a, b, k] = P(c, e + 140 + i * 230, nivel, 200);
        const f = ((t * 0.28 + i * 0.37) % 1 + 1) % 1;
        return <ellipse key={`v${i}`} cx={a + Math.sin(t * 0.9 + i) * 14} cy={b - f * 170} rx={(50 + f * 70) * k} ry={(36 + f * 50) * k} fill="#E8E8E2" opacity={0.2 * (1 - f)} style={{ filter: "blur(9px)" }} />;
      })}
    </g>
  );
};

// Parte da frente: o concreto em volta da cintura, a tábua da frente e as escoras. Vem depois do Denis.
export const FormaFrente: React.FC<{ c?: Cam; cx: number; nivel: number; numero?: string; altura?: number }> = ({ c = CAM_PADRAO, cx, nivel, numero = "32", altura = FH }) => {
  const e = cx - FX;
  const d = cx + FX;
  const zf = -FZ;
  const [xa, ya, k] = P(c, e, altura, zf);
  const [xb, yb] = P(c, d, 0, zf);
  const w = xb - xa;
  const h = yb - ya;
  const tabuas = 7;
  const H0 = (h * FH) / altura; // a inscrição fica presa no tamanho da tábua original
  return (
    <g>
      <defs>
        <linearGradient id="painelLuz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9BE" stopOpacity={0.22} />
          <stop offset="0.3" stopColor="#FFE9BE" stopOpacity={0} />
          <stop offset="1" stopColor="#090B12" stopOpacity={0.8} />
        </linearGradient>
        <linearGradient id="sarrafoG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A5824F" />
          <stop offset="1" stopColor="#6A4F2D" />
        </linearGradient>
      </defs>
      {/* concreto da cintura pra frente, que esconde as pernas */}
      <polygon points={pts(c, [[e, nivel, 0], [d, nivel, 0], [d, nivel, zf], [e, nivel, zf]])} fill="url(#concretoG)" />
      {/* escora da esquerda, firme, e da direita, apoiada num tijolo */}
      <polygon points={pts(c, [[e - 8, 300, zf], [e - 8, 340, zf], [e - 210, 40, zf + 40], [e - 210, 0, zf + 40]])} fill="#8F6C3E" />
      <polygon points={pts(c, [[d + 8, 260, zf], [d + 8, 296, zf], [d + 130, 62, zf + 70], [d + 130, 26, zf + 70]])} fill="#8F6C3E" />
      <polygon points={pts(c, [[d + 90, 0, zf + 70], [d + 180, 0, zf + 70], [d + 180, 62, zf + 70], [d + 90, 62, zf + 70]])} fill="#8A4B33" />
      <polygon points={pts(c, [[d + 90, 62, zf + 70], [d + 180, 62, zf + 70], [d + 180, 62, zf + 150], [d + 90, 62, zf + 150]])} fill="#A9654A" />
      <polygon points={pts(c, [[d + 90, 31, zf + 70], [d + 180, 31, zf + 70], [d + 180, 35, zf + 70], [d + 90, 35, zf + 70]])} fill="#4A2A1C" />
      {/* tábuas da frente */}
      {new Array(tabuas).fill(0).map((_, i) => {
        const y0 = ya + (h / tabuas) * i;
        const hh = h / tabuas;
        return (
          <g key={i}>
            <rect x={xa} y={y0} width={w} height={hh - 3} fill={madeira[i % madeira.length]} />
            <path d={`M ${xa} ${y0 + hh * 0.35} C ${xa + w * 0.3} ${y0 + hh * 0.2}, ${xa + w * 0.6} ${y0 + hh * 0.55}, ${xb} ${y0 + hh * 0.3}`} stroke="#7A5730" strokeOpacity={0.5} strokeWidth={2} fill="none" />
            <path d={`M ${xa} ${y0 + hh * 0.72} C ${xa + w * 0.35} ${y0 + hh * 0.86}, ${xa + w * 0.7} ${y0 + hh * 0.58}, ${xb} ${y0 + hh * 0.76}`} stroke="#7A5730" strokeOpacity={0.4} strokeWidth={2} fill="none" />
            <ellipse cx={xa + w * (0.12 + random(`nó${i}`) * 0.76)} cy={y0 + hh * 0.5} rx={14 * k} ry={6 * k} fill="#6E4D28" opacity={0.55} />
            <rect x={xa} y={y0 + hh - 3} width={w} height={3} fill="#2B1E10" />
          </g>
        );
      })}
      {/* sarrafos em pé, com prego */}
      {[0.04, 0.47, 0.9].map((u) => (
        <g key={u}>
          <rect x={xa + w * u} y={ya - 2} width={w * 0.06} height={h + 2} fill="url(#sarrafoG)" />
          {new Array(tabuas).fill(0).map((_, i) => (
            <circle key={i} cx={xa + w * (u + 0.03)} cy={ya + (h / tabuas) * (i + 0.5)} r={3.4 * k} fill="#30343A" />
          ))}
        </g>
      ))}
      {/* borda iluminada */}
      <rect x={xa - 8} y={ya - 7} width={w + 16} height={15} rx={3} fill="#C09A66" />
      {/* tábua cedendo: fresta com concreto vazando */}
      <path d={`M ${xa + w * 0.66} ${ya + H0 * 0.14} l ${w * 0.22} ${h * 0.012} l ${-w * 0.02} ${h * 0.012} l ${-w * 0.2} ${-h * 0.006} Z`} fill="#16100A" />
      {[0.7, 0.76, 0.83].map((u, i) => (
        <path key={u} d={`M ${xa + w * u} ${ya + H0 * 0.152} q ${4 * k} ${h * (0.03 + i * 0.012)} ${1 * k} ${h * (0.06 + i * 0.03)} q ${-6 * k} ${6 * k} ${-11 * k} 0 q ${-1 * k} ${-h * 0.03} ${-1 * k} ${-h * (0.06 + i * 0.03)} Z`} fill="#A5A49D" />
      ))}
      {/* estêncil do governo */}
      <g opacity={0.82} transform={`translate(${xa + w * 0.135} ${ya + H0 * 0.05})`}>
        <text fontFamily={FONTE} fontWeight={800} fontSize={H0 * 0.042} letterSpacing={1.2} fill="#E9E3D2" y={H0 * 0.04}>
          DEP. DE EVENTOS ATMOSFÉRICOS
        </text>
        <text fontFamily={FONTE} fontWeight={800} fontSize={H0 * 0.12} fill="#E9E3D2" y={H0 * 0.155}>
          {`BLOCO ${numero}`}
        </text>
      </g>
      <rect x={xa} y={ya} width={w} height={h} fill="url(#painelLuz)" />
    </g>
  );
};
