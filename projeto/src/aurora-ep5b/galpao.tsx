import { random } from "remotion";
import { projeta } from "../aurora-ep5/tresd";
import { FONTE } from "../aurora/estilo";

// Galpão do governo, em perspectiva calculada e polígonos de cor limpa (alvo: EXEMPLO FINAL).
// Mundo: x e h em pixels a partir do centro e do chão (435 px = 1 m); z positivo vai pro fundo.
export type Cam = { z: number; x: number; alt: number; hor: number };
export const CAM_PADRAO: Cam = { z: 0, x: 0, alt: 1000, hor: 620 };
export const P = (c: Cam, x: number, h: number, z: number): [number, number, number] => {
  const [sx, sy, k] = projeta(540 + x - c.x, 900 + c.alt - h, z - c.z);
  return [sx, sy - 900 + c.hor, k];
};
type V3 = [number, number, number];
export const pts = (c: Cam, l: V3[]) =>
  l
    .map(([x, h, z]) => {
      const [a, b] = P(c, x, h, z);
      return `${a.toFixed(1)},${b.toFixed(1)}`;
    })
    .join(" ");

const ALT = 2830;
const LARG = 3000;
const FUNDO = 7800;
const NEBLINA = "#121A26";

const mix = (a: string, b: string, k: number) => {
  const n = (h: string, s: number) => parseInt(h.slice(s, s + 2), 16);
  const f = (s: number) => Math.round(n(a, s) + (n(b, s) - n(a, s)) * k);
  return `#${[1, 3, 5].map((s) => f(s).toString(16).padStart(2, "0")).join("")}`;
};
const longe = (c: Cam, z: number) => Math.min(0.66, Math.max(0, (z - c.z) / 10500));

const Linha: React.FC<{ c: Cam; a: V3; b: V3; cor: string; l?: number; alfa?: number }> = ({ c, a, b, cor, l = 8, alfa = 1 }) => {
  const [x1, y1, k1] = P(c, ...a);
  const [x2, y2, k2] = P(c, ...b);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={Math.max(0.6, (l * (k1 + k2)) / 2)} opacity={alfa} />;
};

// ---------- blocos de concreto ----------
const LX = 225;
const PZ = 170;
const AB = 870;
export const POS_BLOCOS = (() => {
  const l: { x: number; z: number; n: number }[] = [];
  let n = 1;
  for (const z of [1000, 2200, 3400, 4600, 5800]) for (const x of [-700, 700, -1480, 1480, -2260, 2260]) l.push({ x, z, n: n++ });
  l.push({ x: 700, z: 7000, n: 31 });
  return l;
})();

const Bloco: React.FC<{ c: Cam; x: number; z: number; n: number; luz?: number }> = ({ c, x, z, n, luz = 1 }) => {
  if (z - PZ - c.z < -700) return null;
  const d = longe(c, z);
  const r = (s: string) => random(`bl${n}${s}`);
  const base = mix("#4C5156", "#54564F", r("t"));
  const lz = (z - 500) % 1500 < 750 ? 1 : 0.9;
  const frente = mix(base, NEBLINA, d);
  const lado = mix("#3A3F47", NEBLINA, d * 0.8);
  const topo = mix("#A69C89", NEBLINA, d);
  const zf = z - PZ;
  const zb = z + PZ;
  const interno = x > c.x ? x - LX : x + LX;
  const [xa, ya, k] = P(c, x - LX, AB, zf);
  const [xb, yb] = P(c, x + LX, 0, zf);
  const w = xb - xa;
  const h = yb - ya;
  const fx = (u: number) => xa + w * u;
  const fy = (v: number) => ya + h * v;
  return (
    <g opacity={luz}>
      {/* sombra no chão */}
      <polygon points={pts(c, [[x - LX, 0, zf], [x + LX, 0, zf], [x + LX + 90, 0, zf - 180], [x - LX - 90, 0, zf - 180]])} fill="#000" opacity={0.3} />
      <polygon points={pts(c, [[x - LX, AB, zf], [x + LX, AB, zf], [x + LX, AB, zb], [x - LX, AB, zb]])} fill={topo} />
      <polygon points={pts(c, [[interno, AB, zf], [interno, AB, zb], [interno, 0, zb], [interno, 0, zf]])} fill={lado} />
      <rect x={xa} y={ya} width={w} height={h} fill={frente} />
      <rect x={xa} y={ya} width={w} height={h} fill="url(#blocoLuz)" opacity={lz} />
      {/* marcas de tábua da forma */}
      {[0.17, 0.34, 0.51, 0.68, 0.85].map((v) => (
        <line key={v} x1={xa} x2={xb} y1={fy(v)} y2={fy(v)} stroke="#10141A" strokeOpacity={0.5} strokeWidth={Math.max(0.8, 5 * k)} />
      ))}
      {/* furos das barras de amarração */}
      {[0.25, 0.75].flatMap((u) =>
        [0.26, 0.76].map((v) => <circle key={`${u}${v}`} cx={fx(u)} cy={fy(v)} r={Math.max(1, 12 * k)} fill="#22252B" />),
      )}
      {/* escorrido de ferrugem e mancha de umidade */}
      <path d={`M ${fx(0.16 + r("e") * 0.6)} ${fy(0.27)} l ${3 * k} ${h * (0.22 + r("f") * 0.3)} l ${-6 * k} 0 Z`} fill="#7A4A2C" opacity={0.45} />
      <ellipse cx={fx(0.3 + r("g") * 0.4)} cy={fy(0.9)} rx={w * 0.42} ry={h * 0.1} fill="#000" opacity={0.2} />
      {/* plaquinha do número */}
      <rect x={fx(0.31)} y={fy(0.09)} width={w * 0.38} height={h * 0.1} rx={3 * k} fill={mix("#E9E4D4", NEBLINA, d)} />
      <text x={fx(0.5)} y={fy(0.09) + h * 0.077} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={h * 0.074} fill="#1A1C22">
        {`Nº ${String(n).padStart(2, "0")}`}
      </text>
    </g>
  );
};

const Luminaria: React.FC<{ c: Cam; x: number; z: number; acesa: number }> = ({ c, x, z, acesa }) => {
  const [lx, ly, k] = P(c, x, 1960, z);
  const [, topo] = P(c, x, ALT - 500, z);
  if (z - c.z < 300) return null;
  const rx = 150 * k;
  return (
    <g>
      <line x1={lx} y1={topo} x2={lx} y2={ly - 60 * k} stroke="#0A0D12" strokeWidth={Math.max(1, 6 * k)} />
      <polygon points={`${lx - 26 * k},${ly - 62 * k} ${lx + 26 * k},${ly - 62 * k} ${lx + rx},${ly} ${lx - rx},${ly}`} fill="#3D4148" />
      <polygon points={`${lx - 26 * k},${ly - 62 * k} ${lx},${ly - 62 * k} ${lx - rx * 0.2},${ly} ${lx - rx},${ly}`} fill="#4F545C" />
      <ellipse cx={lx} cy={ly + 2 * k} rx={rx} ry={22 * k} fill={acesa > 0 ? "#FFE9B8" : "#3A3A38"} opacity={Math.max(0.4, acesa)} />
    </g>
  );
};

const Cone: React.FC<{ c: Cam; x: number; z: number; acesa: number }> = ({ c, x, z, acesa }) => {
  if (z - c.z < 200 || acesa <= 0) return null;
  const [lx, ly, k] = P(c, x, 1960, z);
  const raio = 620;
  const [cx, cy] = P(c, x, 0, z);
  const rx = raio * k;
  return (
    <g opacity={acesa}>
      <polygon points={`${lx - 150 * k},${ly} ${lx + 150 * k},${ly} ${cx + rx},${cy} ${cx - rx},${cy}`} fill="url(#cone)" />
      <ellipse cx={lx} cy={ly + 10 * k} rx={230 * k} ry={70 * k} fill="url(#brilho)" />
    </g>
  );
};

// ---------- tudo o que fica atrás (desfocado) ----------
export const GalpaoFundo: React.FC<{ c?: Cam; t: number; luz?: number; desfoque?: number }> = ({ c = CAM_PADRAO, t, luz = 1, desfoque = 2.2 }) => {
  const zPerto = c.z - 900;
  const zLamp = [1400, 2900, 4400, 5900, 7400];
  const xLamp = [-1170, 1170];
  const faixas = [];
  for (let x = -LARG, i = 0; x < LARG; x += 170, i++) {
    faixas.push(<polygon key={x} points={pts(c, [[x, ALT, Math.max(zPerto, 500)], [x + 170, ALT, Math.max(zPerto, 500)], [x + 170, ALT, FUNDO], [x, ALT, FUNDO]])} fill={i % 2 ? "#202D3A" : "#31414E"} />);
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", filter: `blur(${desfoque}px)` }}>
      <defs>
        <linearGradient id="blocoLuz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2EEE2" stopOpacity={0.22} />
          <stop offset="0.45" stopColor="#F2EEE2" stopOpacity={0} />
          <stop offset="1" stopColor="#0A1018" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFEBC4" stopOpacity={0.13} />
          <stop offset="1" stopColor="#FFE2A6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="poca">
          <stop offset="0" stopColor="#FFDFA5" stopOpacity={0.3} />
          <stop offset="1" stopColor="#FFDFA5" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="brilho">
          <stop offset="0" stopColor="#FFF3D0" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFF3D0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="chuvaFora" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E1C33" />
          <stop offset="0.7" stopColor="#23456F" />
          <stop offset="1" stopColor="#101B2C" />
        </linearGradient>
        <linearGradient id="vidro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B3A73" />
          <stop offset="1" stopColor="#0E1D3D" />
        </linearGradient>
        <linearGradient id="chaoG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#333A42" />
          <stop offset="0.45" stopColor="#3F4346" />
          <stop offset="1" stopColor="#23272C" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="#0A0E15" />
      {/* parede do fundo e portão aberto pra chuva */}
      <polygon points={pts(c, [[-LARG, 0, FUNDO], [LARG, 0, FUNDO], [LARG, ALT, FUNDO], [-LARG, ALT, FUNDO]])} fill={mix("#2C3540", NEBLINA, 0.35)} />
      <polygon points={pts(c, [[-850, 0, FUNDO], [850, 0, FUNDO], [850, 1500, FUNDO], [-850, 1500, FUNDO]])} fill="url(#chuvaFora)" />
      {new Array(26).fill(0).map((_, i) => {
        const x = -830 + (((random(`cv${i}`) * 1660 + t * 90) % 1660) + 1660) % 1660;
        const h = ((1500 - ((t * 1900 + random(`cy${i}`) * 1500) % 1500)) + 1500) % 1500;
        return <Linha key={i} c={c} a={[x, h, FUNDO]} b={[x - 12, Math.max(0, h - 150), FUNDO]} cor="#8FB4DD" l={5} alfa={0.55} />;
      })}
      {/* carro preto parado no portão, luz vermelha acesa */}
      <polygon points={pts(c, [[-620, 0, FUNDO - 50], [100, 0, FUNDO - 50], [100, 210, FUNDO - 50], [-40, 210, FUNDO - 50], [-120, 350, FUNDO - 50], [-440, 350, FUNDO - 50], [-540, 210, FUNDO - 50], [-620, 200, FUNDO - 50]])} fill="#05070B" />
      {[-580, 62].map((x) => {
        const [a, b, k] = P(c, x, 170, FUNDO - 60);
        return <circle key={x} cx={a} cy={b} r={22 * k + 2} fill="#FF3B30" opacity={0.85} />;
      })}
      {/* quem olha do portão: boné e dois pontinhos verdes */}
      {(() => {
        const [a, b, k] = P(c, 420, 0, FUNDO - 40);
        return (
          <g transform={`translate(${a} ${b}) scale(${k})`}>
            <rect x={-72} y={-560} width={144} height={560} rx={40} fill="#04060A" />
            <circle cx={0} cy={-640} r={72} fill="#04060A" />
            <path d="M -72 -668 Q -70 -722 0 -724 Q 70 -722 72 -668 L 120 -660 L 112 -646 L -72 -650 Z" fill="#04060A" />
            <circle cx={-26} cy={-630} r={13} fill="#3CF0A0" />
            <circle cx={26} cy={-630} r={13} fill="#3CF0A0" />
          </g>
        );
      })()}
      {/* batente com faixa de perigo */}
      {[-880, 850].map((x) => (
        <polygon key={x} points={pts(c, [[x, 0, FUNDO - 10], [x + 30, 0, FUNDO - 10], [x + 30, 1500, FUNDO - 10], [x, 1500, FUNDO - 10]])} fill="#C9A227" />
      ))}
      <polygon points={pts(c, [[-880, 1500, FUNDO - 10], [880, 1500, FUNDO - 10], [880, 1570, FUNDO - 10], [-880, 1570, FUNDO - 10]])} fill="#15191F" />

      {/* paredes laterais de bloco */}
      {[-1, 1].map((s) => {
        const x = s * LARG;
        const linhas = [];
        for (let h = 0; h < ALT; h += 190) linhas.push(<Linha key={`h${h}`} c={c} a={[x, h, zPerto]} b={[x, h, FUNDO]} cor="#10151C" l={7} alfa={0.75} />);
        for (let z = 3000; z < FUNDO; z += 500) {
          for (let h = (z / 500) % 2 ? 0 : 190; h < 1500; h += 380) linhas.push(<Linha key={`v${z}${h}`} c={c} a={[x, h, z]} b={[x, h + 190, z]} cor="#10151C" l={7} alfa={0.6} />);
        }
        return (
          <g key={s}>
            <polygon points={pts(c, [[x, 0, zPerto], [x, 0, FUNDO], [x, ALT, FUNDO], [x, ALT, zPerto]])} fill={s < 0 ? "#2F3843" : "#29313B"} />
            {linhas}
            {/* janelas altas com a noite do lado de fora */}
            {[2800, 4200, 5600, 7000].map((z) => (
              <g key={z}>
                <polygon points={pts(c, [[x, 1500, z], [x, 1500, z + 900], [x, 2300, z + 900], [x, 2300, z]])} fill="#10151C" />
                <polygon points={pts(c, [[x, 1540, z + 40], [x, 1540, z + 860], [x, 2260, z + 860], [x, 2260, z + 40]])} fill="url(#vidro)" />
                <Linha c={c} a={[x, 1900, z + 40]} b={[x, 1900, z + 860]} cor="#10151C" l={16} />
                <Linha c={c} a={[x, 1540, z + 450]} b={[x, 2260, z + 450]} cor="#10151C" l={16} />
              </g>
            ))}
            {/* mancha de umidade */}
            <polygon points={pts(c, [[x, 0, 3400], [x, 0, 6600], [x, 420, 6200], [x, 260, 5200], [x, 520, 4300], [x, 240, 3800]])} fill="#000" opacity={0.28} />
          </g>
        );
      })}

      {/* telhado de zinco e treliças */}
      {faixas}
      {[1000, 2500, 4000, 5500, 7000].map((z) => (
        <g key={z}>
          <Linha c={c} a={[-LARG, ALT - 500, z]} b={[LARG, ALT - 500, z]} cor="#0C1016" l={26} />
          <Linha c={c} a={[-LARG, ALT - 60, z]} b={[LARG, ALT - 60, z]} cor="#0C1016" l={30} />
          {new Array(12).fill(0).map((_, i) => {
            const x0 = -LARG + i * 500;
            return (
              <g key={i}>
                <Linha c={c} a={[x0, ALT - 500, z]} b={[x0 + 250, ALT - 60, z]} cor="#141A22" l={16} />
                <Linha c={c} a={[x0 + 250, ALT - 60, z]} b={[x0 + 500, ALT - 500, z]} cor="#141A22" l={16} />
              </g>
            );
          })}
        </g>
      ))}
      {/* relógio de ponto pendurado na treliça */}
      {(() => {
        const [a, b, k] = P(c, 0, 1650, 2500);
        return (
          <g transform={`translate(${a} ${b}) scale(${k})`}>
            <line x1={-200} x2={-200} y1={-690} y2={-110} stroke="#0A0D12" strokeWidth={8} />
            <line x1={200} x2={200} y1={-690} y2={-110} stroke="#0A0D12" strokeWidth={8} />
            <rect x={-290} y={-115} width={580} height={230} rx={14} fill="#10141B" stroke="#2C323C" strokeWidth={8} />
            <text x={0} y={72} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={210} letterSpacing={8} fill="#FF4B3E">
              03:17
            </text>
          </g>
        );
      })()}

      {/* chão de concreto, com junta e faixa amarela */}
      <polygon points={pts(c, [[-LARG, 0, zPerto], [LARG, 0, zPerto], [LARG, 0, FUNDO], [-LARG, 0, FUNDO]])} fill="url(#chaoG)" />
      {new Array(9).fill(0).map((_, i) => {
        const x = -LARG + (i + 1) * 600;
        return <Linha key={i} c={c} a={[x, 0, zPerto]} b={[x, 0, FUNDO]} cor="#15191F" l={7} alfa={0.7} />;
      })}
      {new Array(13).fill(0).map((_, i) => {
        const z = i * 600;
        return <Linha key={`z${i}`} c={c} a={[-LARG, 0, z]} b={[LARG, 0, z]} cor="#15191F" l={7} alfa={0.7} />;
      })}
      {[-470, 470].map((x) => (
        <polygon key={x} points={pts(c, [[x - 20, 0, zPerto], [x + 20, 0, zPerto], [x + 20, 0, FUNDO], [x - 20, 0, FUNDO]])} fill="#B8901F" opacity={0.75} />
      ))}
      {/* poças e respingos de concreto */}
      {new Array(12).fill(0).map((_, i) => {
        const r = (s: string) => random(`poca${i}${s}`);
        const [a, b, k] = P(c, (r("x") - 0.5) * 2200, 0, 900 + r("z") * 6000);
        return <ellipse key={i} cx={a} cy={b} rx={(90 + r("r") * 220) * k} ry={(16 + r("r") * 40) * k} fill={i % 3 ? "#111418" : "#8C8E8C"} opacity={i % 3 ? 0.42 : 0.5} />;
      })}

      {/* poça de luz no chão, embaixo dos blocos */}
      {luz > 0 &&
        zLamp.flatMap((z) =>
          xLamp.map((x) => {
            if (z - c.z < 200) return null;
            const [a, b, k] = P(c, x, 0, z);
            return <ellipse key={`p${x}${z}`} cx={a} cy={b} rx={760 * k} ry={190 * k} fill="url(#poca)" opacity={luz} style={{ mixBlendMode: "screen" }} />;
          }),
        )}
      {/* fileiras de blocos e luminárias, do fundo pra frente */}
      {[...POS_BLOCOS].sort((a, b) => b.z - a.z || Math.abs(b.x) - Math.abs(a.x)).map((b) => (
        <Bloco key={b.n} c={c} {...b} />
      ))}
      {zLamp
        .slice()
        .reverse()
        .flatMap((z) => xLamp.map((x) => <Luminaria key={`${x}${z}`} c={c} x={x} z={z} acesa={luz} />))}
      <g style={{ mixBlendMode: "screen" }}>
        {zLamp
          .slice()
          .reverse()
          .flatMap((z) => xLamp.map((x) => <Cone key={`${x}${z}`} c={c} x={x} z={z} acesa={luz} />))}
      </g>
    </svg>
  );
};
