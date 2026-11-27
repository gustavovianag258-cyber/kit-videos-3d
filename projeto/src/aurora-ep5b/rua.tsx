import { random } from "remotion";
import { FONTE } from "../aurora/estilo";
import { Cam, P, pts } from "./galpao";

// Rua da zona leste em perspectiva calculada: sobrado, caixa d'água, poste e chão molhado.
// `antiga` = 1989: céu verde, sem chuva, poucos fios.
const ALTURAS = [760, 980, 760, 1160, 900, 760, 1040];
const CORES = ["#5F6E7F", "#6E5C66", "#4F6E6A", "#7E6C58", "#5E5C78", "#7A6060", "#566A58"];
const FX_RUA = 950;
const FX_CAL = 1300;

const Janela: React.FC<{ c: Cam; x: number; z: number; l: number; h0: number; h1: number; acesa?: boolean; verde?: boolean }> = ({ c, x, z, l, h0, h1, acesa, verde }) => (
  <g>
    <polygon points={pts(c, [[x, h0 - 12, z - 12], [x, h0 - 12, z + l + 12], [x, h1 + 12, z + l + 12], [x, h1 + 12, z - 12]])} fill="#D9D3C2" opacity={0.5} />
    <polygon points={pts(c, [[x, h0, z], [x, h0, z + l], [x, h1, z + l], [x, h1, z]])} fill={acesa ? (verde ? "#BFF5D8" : "#FFD98E") : "#16202E"} />
    <polygon points={pts(c, [[x, (h0 + h1) / 2 - 4, z], [x, (h0 + h1) / 2 - 4, z + l], [x, (h0 + h1) / 2 + 4, z + l], [x, (h0 + h1) / 2 + 4, z]])} fill="#2A2F38" />
    <polygon points={pts(c, [[x, h0, z + l / 2 - 5], [x, h0, z + l / 2 + 5], [x, h1, z + l / 2 + 5], [x, h1, z + l / 2 - 5]])} fill="#2A2F38" />
  </g>
);

const Casa: React.FC<{ c: Cam; s: number; z: number; l: number; i: number; antiga?: boolean }> = ({ c, s, z, l, i, antiga }) => {
  if (z + l - c.z < -600) return null;
  const x = s * FX_CAL;
  const H = ALTURAS[i % ALTURAS.length];
  const cor = CORES[(i * 3 + (s > 0 ? 2 : 0)) % CORES.length];
  const r = (k: string) => random(`casa${s}${i}${k}`);
  const acesa = r("a") > 0.55;
  const fim = z + l;
  return (
    <g>
      {/* frente que dá pra quem vem pela rua */}
      <polygon points={pts(c, [[x, 0, z], [x + s * 2400, 0, z], [x + s * 2400, H, z], [x, H, z]])} fill={cor} />
      <polygon points={pts(c, [[x, 0, z], [x + s * 2400, 0, z], [x + s * 2400, H, z], [x, H, z]])} fill="#050814" opacity={0.46} />
      {/* parede de frente pra rua */}
      <polygon points={pts(c, [[x, 0, z], [x, 0, fim], [x, H, fim], [x, H, z]])} fill={cor} />
      <polygon points={pts(c, [[x, 0, z], [x, 0, fim], [x, H, fim], [x, H, z]])} fill="#07101E" opacity={0.28} />
      {/* laje com ferro de espera e caixa d'água */}
      <polygon points={pts(c, [[x, H, z], [x + s * 2400, H, z], [x + s * 2400, H, fim], [x, H, fim]])} fill="#2A3038" />
      <polygon points={pts(c, [[x, H - 26, z], [x, H - 26, fim], [x, H, fim], [x, H, z]])} fill="#D8D2C2" opacity={0.42} />
      {!antiga &&
        [0.2, 0.5, 0.8].map((u) => {
          const [a, b, k] = P(c, x, H, z + l * u);
          return <rect key={u} x={a - 1.5 * k} y={b - 70 * k} width={Math.max(1, 5 * k)} height={70 * k} fill="#4A3A30" />;
        })}
      {(() => {
        const [a, b, k] = P(c, x + s * 520, H, z + l * 0.5);
        return (
          <g transform={`translate(${a} ${b}) scale(${k})`}>
            <rect x={-120} y={-170} width={240} height={170} rx={16} fill={antiga ? "#6E6E66" : "#2E6FA8"} />
            <rect x={-132} y={-186} width={264} height={30} rx={10} fill={antiga ? "#55554E" : "#245A8C"} />
          </g>
        );
      })()}
      {/* porta, janelas de cima e de baixo */}
      <Janela c={c} x={x - s} z={z + l * 0.12} l={l * 0.3} h0={H - 340} h1={H - 110} acesa={acesa} verde={antiga} />
      <Janela c={c} x={x - s} z={z + l * 0.56} l={l * 0.3} h0={H - 340} h1={H - 110} acesa={!acesa && r("b") > 0.4} verde={antiga} />
      <polygon points={pts(c, [[x - s, 0, z + l * 0.58], [x - s, 0, z + l * 0.82], [x - s, 400, z + l * 0.82], [x - s, 400, z + l * 0.58]])} fill="#2E2520" />
      <polygon points={pts(c, [[x - s, 0, z + l * 0.1], [x - s, 0, z + l * 0.5], [x - s, 280, z + l * 0.5], [x - s, 280, z + l * 0.1]])} fill={r("g") > 0.5 ? "#3A3F4A" : "#47392F"} />
      {/* manchas de chuva */}
      <polygon points={pts(c, [[x - s, H - 26, z + l * 0.1], [x - s, H - 26, z + l * 0.3], [x - s, H - 240, z + l * 0.26], [x - s, H - 180, z + l * 0.14]])} fill="#000" opacity={0.2} />
    </g>
  );
};

export const RuaChuva: React.FC<{ c: Cam; t: number; antiga?: boolean; desfoque?: number; lambe?: boolean }> = ({ c, t, antiga, desfoque = 2, lambe }) => {
  const FUNDO = c.z + 15000;
  const ini = Math.floor((c.z - 2000) / 1700) * 1700;
  const casas = [];
  for (let i = 9; i >= 0; i--) {
    const z = ini + i * 1700;
    const n = Math.abs(Math.floor(z / 1700));
    for (const s of [-1, 1]) casas.push(<Casa key={`${s}${n}`} c={c} s={s} z={z} l={1600} i={n + (s > 0 ? 3 : 0)} antiga={antiga} />);
  }
  const postes = [];
  for (let i = 7; i >= 0; i--) {
    const z = Math.floor(c.z / 2400) * 2400 + 800 + i * 2400;
    if (z - c.z < -500) continue;
    const lado = i % 2 ? 1 : -1;
    const x = lado * (FX_RUA + 70);
    const [px, py, k] = P(c, x, 0, z);
    const [, ty] = P(c, x, 1500, z);
    const [lx, ly] = P(c, x - lado * 330, 1420, z);
    const [cx, cy] = P(c, x - lado * 330, 0, z);
    const [nx, ny] = P(c, x, 1420, z + 2400);
    postes.push(
      <g key={z}>
        <line x1={px} y1={py} x2={px} y2={ty} stroke="#14181F" strokeWidth={Math.max(1.5, 22 * k)} />
        <line x1={px} y1={ty + 40 * k} x2={lx} y2={ly} stroke="#14181F" strokeWidth={Math.max(1, 10 * k)} />
        <path d={`M ${px} ${ty + 30 * k} Q ${(px + nx) / 2 + 40 * k} ${(ty + ny) / 2 + 60 * k} ${nx} ${ny}`} stroke="#0C0E13" strokeWidth={Math.max(0.8, 4 * k)} fill="none" />
        <path d={`M ${px} ${ty + 58 * k} Q ${(px + nx) / 2 - 30 * k} ${(ty + ny) / 2 + 80 * k} ${nx} ${ny + 20 * k}`} stroke="#0C0E13" strokeWidth={Math.max(0.8, 4 * k)} fill="none" />
        {!antiga && <polygon points={`${lx - 60 * k},${ly} ${lx + 60 * k},${ly} ${cx + 460 * k},${cy} ${cx - 460 * k},${cy}`} fill="url(#coneRua)" style={{ mixBlendMode: "screen" }} />}
        <ellipse cx={lx} cy={ly} rx={46 * k} ry={14 * k} fill={antiga ? "#D8D8B0" : "#FFE6B0"} />
        <ellipse cx={lx} cy={ly} rx={180 * k} ry={100 * k} fill="url(#glowRua)" />
        {!antiga && <ellipse cx={cx} cy={cy} rx={560 * k} ry={140 * k} fill="url(#pocaRua)" style={{ mixBlendMode: "screen" }} />}
      </g>,
    );
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", filter: desfoque ? `blur(${desfoque}px)` : undefined }}>
      <defs>
        <linearGradient id="ceuRua" x1="0" y1="0" x2="0" y2="1">
          {antiga ? (
            <>
              <stop offset="0" stopColor="#07201F" />
              <stop offset="0.6" stopColor="#1C8E66" />
              <stop offset="1" stopColor="#7DF5C2" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#090F1E" />
              <stop offset="1" stopColor="#23375A" />
            </>
          )}
        </linearGradient>
        <linearGradient id="coneRua" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE2A6" stopOpacity={0.24} />
          <stop offset="1" stopColor="#FFE2A6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="glowRua">
          <stop offset="0" stopColor="#FFF0C4" stopOpacity={0.6} />
          <stop offset="1" stopColor="#FFF0C4" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="pocaRua">
          <stop offset="0" stopColor="#FFDFA5" stopOpacity={0.3} />
          <stop offset="1" stopColor="#FFDFA5" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="asfalto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={antiga ? "#2E3A36" : "#1E2632"} />
          <stop offset="1" stopColor={antiga ? "#1E2522" : "#131821"} />
        </linearGradient>
      </defs>
      <rect width={1080} height={c.hor + 2} fill="url(#ceuRua)" />
      <rect y={c.hor} width={1080} height={160} fill={antiga ? "#3C5A4C" : "#16202E"} />
      {antiga &&
        [0, 1, 2].map((i) => (
          <path key={i} d={`M -40 ${250 + i * 120 + Math.sin(t + i) * 14} Q 300 ${120 + i * 140} 560 ${270 + i * 110} T 1120 ${220 + i * 120}`} stroke="#9DFFD6" strokeOpacity={0.3 - i * 0.06} strokeWidth={70 - i * 12} fill="none" style={{ filter: "blur(16px)" }} />
        ))}
      <polygon points={pts(c, [[-6000, 0, c.z - 900], [6000, 0, c.z - 900], [6000, 0, FUNDO], [-6000, 0, FUNDO]])} fill="url(#asfalto)" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <polygon points={pts(c, [[s * FX_RUA, 0, c.z - 900], [s * FX_CAL, 0, c.z - 900], [s * FX_CAL, 0, FUNDO], [s * FX_RUA, 0, FUNDO]])} fill={antiga ? "#55605A" : "#3E4552"} />
          <polygon points={pts(c, [[s * (FX_RUA - 10), 0, c.z - 900], [s * (FX_RUA + 16), 0, c.z - 900], [s * (FX_RUA + 16), 0, FUNDO], [s * (FX_RUA - 10), 0, FUNDO]])} fill="#8A8F96" />
        </g>
      ))}
      {new Array(18).fill(0).map((_, i) => {
        const z = Math.floor(c.z / 600) * 600 + i * 600;
        return <polygon key={z} points={pts(c, [[-14, 0, z], [14, 0, z], [14, 0, z + 300], [-14, 0, z + 300]])} fill={antiga ? "#CDBF8F" : "#C9A227"} opacity={0.8} />;
      })}
      {/* poças com reflexo */}
      {!antiga &&
        new Array(14).fill(0).map((_, i) => {
          const r = (s: string) => random(`pc${i}${s}`);
          const [a, b, k] = P(c, (r("x") - 0.5) * 1700, 0, c.z + 300 + r("z") * 7000);
          return <ellipse key={i} cx={a} cy={b} rx={(120 + r("r") * 200) * k} ry={(18 + r("r") * 26) * k} fill="#3F5A82" opacity={0.42} />;
        })}
      {casas}
      {lambe &&
        (() => {
          const [a, b, k] = P(c, -FX_CAL + 2, 260, c.z + 1500);
          return (
            <g transform={`translate(${a} ${b}) scale(${k * 1.9}) skewY(14)`}>
              <rect x={-120} y={-80} width={240} height={160} fill="#E4DCCB" />
              <rect x={-120} y={-80} width={240} height={46} fill="#3CF0A0" />
              <text x={0} y={-48} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#141622">
                MUNDO PARALELO
              </text>
              <text x={0} y={22} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill="#141622">
                @mundoparalelo.br
              </text>
            </g>
          );
        })()}
      {postes}
    </svg>
  );
};

// Carro preto visto por trás, em 3/4 simples. (x, y) = meio do chão.
export const CarroTras: React.FC<{ x: number; y: number; e?: number; antigo?: boolean; freio?: number }> = ({ x, y, e = 1, antigo, freio = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={6} rx={320} ry={36} fill="#000" opacity={0.5} />
    <ellipse cx={0} cy={30} rx={300} ry={70} fill="#C92A22" opacity={0.14 * freio} />
    {/* teto e vidro */}
    <polygon points={antigo ? "-190,-300 190,-300 240,-190 -240,-190" : "-170,-310 170,-310 244,-186 -244,-186"} fill="#0B0C11" />
    <polygon points={antigo ? "-168,-286 168,-286 212,-196 -212,-196" : "-150,-296 150,-296 214,-196 -214,-196"} fill="#1C2A40" />
    <polygon points="-120,-290 -40,-290 -110,-198 -190,-198" fill="#fff" opacity={0.07} />
    {/* traseira */}
    <rect x={-280} y={-190} width={560} height={150} rx={antigo ? 14 : 30} fill="#0E0F15" />
    <rect x={-280} y={-190} width={560} height={40} rx={18} fill="#1D1F28" />
    <rect x={-74} y={-110} width={148} height={40} rx={4} fill="#D7D3C4" />
    <text x={0} y={-80} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#16181F">
      {antigo ? "ZL 3170" : "DEA 0317"}
    </text>
    {[-1, 1].map((s) => (
      <g key={s}>
        {antigo ? <circle cx={s * 214} cy={-122} r={30} fill="#FF4034" opacity={0.5 + freio * 0.5} /> : <rect x={s * 214 - 54} y={-142} width={108} height={36} rx={10} fill="#FF2F26" opacity={0.5 + freio * 0.5} />}
        <ellipse cx={s * 214} cy={-122} rx={110} ry={62} fill="#FF2A20" opacity={0.2 * freio} style={{ filter: "blur(16px)" }} />
        <rect x={s * 230 - 44} y={-46} width={88} height={50} rx={10} fill="#050507" />
      </g>
    ))}
    <rect x={-290} y={-52} width={580} height={22} rx={10} fill={antigo ? "#9A9A94" : "#07080C"} />
  </g>
);

// Betoneira vista por trás, com a ré acesa. (x, y) = meio do chão.
export const BetoneiraRe: React.FC<{ x: number; y: number; e?: number; gira?: number }> = ({ x, y, e = 1, gira = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <defs>
      <radialGradient id="tamborTras" cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#8A8E94" />
        <stop offset="1" stopColor="#3C4047" />
      </radialGradient>
      <linearGradient id="reLuz" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF4DA" stopOpacity={0.55} />
        <stop offset="1" stopColor="#FFF4DA" stopOpacity={0} />
      </linearGradient>
    </defs>
    {/* facho da ré no chão */}
    <polygon points="-260,-10 260,-10 880,330 -880,330" fill="url(#reLuz)" />
    <ellipse cx={0} cy={6} rx={520} ry={44} fill="#000" opacity={0.55} />
    {/* rodas duplas */}
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={s * 330 - 110} y={-190} width={220} height={196} rx={24} fill="#0A0B0E" />
        <rect x={s * 330 - 8} y={-186} width={16} height={190} fill="#1C1E24" />
        <rect x={s * 330 - 120} y={-96} width={240} height={110} rx={4} fill="#131519" />
        <text x={s * 330} y={-22} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={66} fill="#E9E3D2">
          20 T
        </text>
      </g>
    ))}
    {/* chassi com faixa de perigo */}
    <rect x={-440} y={-300} width={880} height={110} fill="#1F2229" />
    {new Array(11).fill(0).map((_, i) => (
      <polygon key={i} points={`${-440 + i * 80},-240 ${-400 + i * 80},-240 ${-360 + i * 80},-190 ${-400 + i * 80},-190`} fill="#D9A92A" />
    ))}
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={s * 360 - 44} y={-292} width={88} height={40} rx={7} fill="#FF2F26" />
        <rect x={s * 262 - 34} y={-292} width={68} height={40} rx={7} fill="#FFF3D2" />
        <ellipse cx={s * 262} cy={-272} rx={150} ry={100} fill="#FFF3D2" opacity={0.3} style={{ filter: "blur(22px)" }} />
        <ellipse cx={s * 360} cy={-272} rx={130} ry={80} fill="#FF2A20" opacity={0.3} style={{ filter: "blur(20px)" }} />
      </g>
    ))}
    {/* funil e bica */}
    <polygon points="-120,-560 120,-560 70,-300 -70,-300" fill="#4A4E55" />
    <polygon points="-70,-310 70,-310 40,-210 -40,-210" fill="#35383F" />
    {/* tambor girando */}
    <circle cx={0} cy={-760} r={330} fill="url(#tamborTras)" />
    <g transform={`rotate(${gira * 57} 0 -760)`}>
      {[0, 2.1, 4.2].map((i) => (
        <path key={i} d={`M ${Math.cos(i) * 110} ${-760 + Math.sin(i) * 110} A 240 240 0 0 1 ${Math.cos(i + 1.1) * 300} ${-760 + Math.sin(i + 1.1) * 300}`} stroke="#4A4D53" strokeWidth={14} fill="none" />
      ))}
      <path d="M -210 -930 q 30 90 10 190 q -24 14 -36 -8 q 0 -100 -12 -170 Z M 150 -610 q 40 40 80 40 q 10 22 -14 30 q -50 -6 -86 -40 Z" fill="#B3B2AA" opacity={0.7} />
    </g>
    <circle cx={0} cy={-760} r={250} fill="none" stroke="#2C2F35" strokeWidth={8} />
    <circle cx={0} cy={-760} r={160} fill="none" stroke="#2C2F35" strokeWidth={6} />
    <circle cx={0} cy={-760} r={82} fill="#26292F" />
    <circle cx={0} cy={-760} r={330} fill="none" stroke="#1A1C21" strokeWidth={16} />
    <path d="M -180 -1040 Q 0 -1110 180 -1040" stroke="#fff" strokeOpacity={0.14} strokeWidth={30} fill="none" />
    {/* escada */}
    <line x1={380} x2={380} y1={-300} y2={-920} stroke="#23262C" strokeWidth={14} />
    <line x1={440} x2={440} y1={-300} y2={-920} stroke="#23262C" strokeWidth={14} />
    {new Array(8).fill(0).map((_, i) => (
      <line key={i} x1={380} x2={440} y1={-340 - i * 74} y2={-340 - i * 74} stroke="#23262C" strokeWidth={12} />
    ))}
    {/* respingo de concreto */}
    <path d="M -300 -300 q 20 60 6 110 q -12 8 -20 -8 q 0 -60 -6 -100 Z M 110 -300 q 12 40 4 70 q -10 6 -14 -6 q 2 -30 -2 -60 Z" fill="#9A9A92" />
  </g>
);
