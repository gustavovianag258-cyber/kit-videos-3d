import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Agente, Denis } from "../aurora-ep5/elenco";
import { freia, suave, Tela, Zoom } from "../aurora-ep5/dia";
import { Chuva, Escuro, Respingos } from "../aurora-ep5/objetos";
import { Estilhacos, Fumaca3D } from "../aurora-ep5/tresd";
import { Corpo, OlheiroBloco } from "../aurora-ep4/pessoa";
import { clamp, COR, FONTE, Placa } from "../aurora/estilo";
import { clipe, janelas, palavra } from "./falas";
import { FH, FormaAtras, FormaFrente, FZ } from "./forma";
import { CAM_PADRAO, Cam, GalpaoFundo, P } from "./galpao";
import { Balanca, Cracha, DenisCinza, Ficha, Lista, Mao, ParedeBloco, Termometro } from "./objetos";
import { BetoneiraRe, CarroTras, RuaChuva } from "./rua";
import { S } from "./tempos";

// Cenas do "Os blocos". Poucos lugares: rua na chuva, galpão, cabine, 1989 e guarita.
const CX = -60;
const MESTRE: Cam = { ...CAM_PADRAO, z: 150, alt: 1020, hor: 480 };

const Prancheta = (
  <g transform="rotate(-70) translate(40 -60)">
    <rect x={-52} y={-78} width={104} height={136} rx={7} fill="#2A2C34" />
    <rect x={-44} y={-68} width={88} height={118} rx={3} fill="#E6E2D6" />
    <rect x={-34} y={-46} width={68} height={5} fill="#8A8A86" />
    <rect x={-34} y={-30} width={68} height={5} fill="#8A8A86" />
    <rect x={-34} y={-14} width={46} height={5} fill="#8A8A86" />
  </g>
);

// O mangote despejando concreto na forma.
const Mangote: React.FC<{ c: Cam; nivel: number; t: number; forca: number }> = ({ c, nivel, t, forca }) => {
  const [a1, a2] = P(c, CX - 560, 2100, 180);
  const [b1, b2] = P(c, CX - 210, nivel + 300, 110);
  const [fx, fy, k] = P(c, CX - 210, nivel, 110);
  const d = `M ${a1} ${a2} C ${a1 + 30} ${a2 + 260}, ${b1 - 140} ${b2 - 260}, ${b1} ${b2}`;
  return (
    <g>
      {forca > 0 && (
        <g>
          <polygon points={`${b1 - 30 * k * forca},${b2} ${b1 + 30 * k * forca},${b2} ${fx + 48 * k * forca},${fy} ${fx - 48 * k * forca},${fy}`} fill="#9B9A92" />
          <polygon points={`${b1 - 8 * k},${b2} ${b1 + 10 * k},${b2} ${fx + 12 * k},${fy} ${fx - 14 * k},${fy}`} fill="#BCBBB3" />
          {[0, 1, 2].map((i) => {
            const f = ((t * 1.6 + i / 3) % 1 + 1) % 1;
            return <ellipse key={i} cx={fx} cy={fy + 4} rx={(50 + f * 150) * k} ry={(9 + f * 26) * k} fill="none" stroke="#D2D1C9" strokeWidth={3} opacity={(1 - f) * 0.8} />;
          })}
        </g>
      )}
      <path d={d} stroke="#15171C" strokeWidth={62 * k} fill="none" />
      <path d={d} stroke="#2E323A" strokeWidth={50 * k} fill="none" strokeDasharray={`${9 * k} ${9 * k}`} />
      <ellipse cx={b1} cy={b2} rx={40 * k} ry={13 * k} fill="#0A0B0E" />
    </g>
  );
};

// Galpão com a forma, o Denis e o agente de prancheta: o plano-mestre do episódio.
const CenaForma: React.FC<{
  t: number;
  c?: Cam;
  nivel?: number;
  altura?: number;
  fala?: [number, number][];
  falaA?: [number, number][];
  despeja?: number;
  olhos?: "normal" | "espanto" | "cima";
  olha?: number;
  pose?: React.ComponentProps<typeof Denis>["pose"];
  semAgente?: boolean;
  luz?: number;
}> = ({ t, c = MESTRE, nivel = 380, altura = FH, fala, falaA, despeja = 0, olhos = "normal", olha = 0.45, pose, semAgente, luz = 1 }) => {
  const [dx, dy, dk] = P(c, CX, 0, 0);
  const [ax, ay, ak] = P(c, 330, 0, FZ + 90);
  const [lx, ly] = P(c, CX, 1960, 0);
  const [fx1, fy1] = P(c, CX - 480, nivel, -FZ);
  const [fx2] = P(c, CX + 480, nivel, -FZ);
  return (
    <AbsoluteFill style={{ background: "#0A0E15" }}>
      <GalpaoFundo c={c} t={t} luz={luz} />
      <Tela>
        <defs>
          <linearGradient id="coneDenis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE4AC" stopOpacity={0.2 * luz} />
            <stop offset="1" stopColor="#FFE4AC" stopOpacity={0.03 * luz} />
          </linearGradient>
        </defs>
        {!semAgente && <Agente x={ax} y={ay} escala={ak} n={0} t={t} fala={falaA} dir={-1} olha={-0.7} gesto={false} pose={{ bracoD: 26, antebracoD: -96 }} naMao={Prancheta} semente="anota" />}
        <FormaAtras c={c} cx={CX} nivel={nivel} t={t} altura={altura} />
        <Denis x={dx} y={dy} escala={dk} t={t} fala={fala} casa olhos={olhos} olha={olha} pose={pose ?? { bracoE: 20, antebracoE: -6, bracoD: 58, antebracoD: -24 }} semente="denis" sombra={false} />
        {[[-34, 372], [26, 342], [52, 400], [-58, 416], [8, 424], [-14, 300]].map(([a, b], i) => (
          <circle key={i} cx={dx + a * dk} cy={dy - b * dk} r={(5 + (i % 3) * 3) * dk} fill="#B9B7AE" />
        ))}
        <ellipse cx={dx} cy={dy - nivel * dk + 8} rx={118 * dk} ry={20 * dk} fill="#55564F" opacity={0.55} />
        <Mangote c={c} nivel={nivel} t={t} forca={despeja} />
        <FormaFrente c={c} cx={CX} nivel={nivel} altura={altura} />
        <polygon points={`${lx - 170},${ly} ${lx + 170},${ly} ${fx2},${fy1} ${fx1},${fy1}`} fill="url(#coneDenis)" style={{ mixBlendMode: "screen" }} />
      </Tela>
    </AbsoluteFill>
  );
};

// ---------- 1 gancho ----------
export const CenaGancho: React.FC<{ t: number }> = ({ t }) => (
  <CenaForma t={t} c={{ z: 40 + t * 40, x: 0, alt: 1300, hor: 300 }} nivel={interpolate(t, [0, 4], [300, 420], clamp)} despeja={1} semAgente olha={0} olhos="cima" pose={{ bracoE: 18, antebracoE: -6, bracoD: 18, antebracoD: -6 }} />
);

// ---------- 2 captura ----------
const Cadeado: React.FC<{ t: number; cai: number }> = ({ t, cai }) => {
  const k = Math.max(0, t - cai);
  const y = 900 + (cai > 0 && t > cai ? 980 * k * k : 0);
  return (
    <g>
      {/* corrente */}
      {new Array(9).fill(0).map((_, i) => (
        <ellipse key={i} cx={320 + i * 56} cy={830 + (t > cai ? i * 40 * Math.min(1, k * 4) : 0)} rx={34} ry={20} fill="none" stroke={i % 2 ? "#7D828A" : "#A4A9B1"} strokeWidth={12} />
      ))}
      <g transform={`translate(540 ${y}) rotate(${t > cai ? k * 240 : 0})`}>
        <path d="M -56 -30 L -56 -96 Q 0 -160 56 -96 L 56 -30" stroke="#A4A9B1" strokeWidth={22} fill="none" />
        <rect x={-96} y={-36} width={192} height={170} rx={18} fill="#C39A3E" />
        <rect x={-96} y={-36} width={192} height={36} rx={18} fill="#E0BB65" />
        <circle cx={0} cy={50} r={22} fill="#332A18" />
        <rect x={-7} y={50} width={14} height={40} fill="#332A18" />
      </g>
    </g>
  );
};

export const CenaCaptura: React.FC<{ t: number }> = ({ t }) => {
  const c1 = palavra("n-denis", "Mas") - S.captura;
  const c2 = clipe("n-agentes").inicio - S.captura;
  const c3 = clipe("d-laje").inicio - S.captura - 0.1;
  if (t < c1) {
    // o portão arrombado sem pressa: alicate no cadeado, em primeiro plano
    const fecha = suave(t, 0.1, c1 - 0.3, 0, 1);
    const rua = { z: 300, x: 0, alt: 620, hor: 880 };
    return (
      <AbsoluteFill style={{ background: "#090D16" }}>
        <RuaChuva c={rua} t={t} desfoque={6} />
        <Tela>
          <CarroTras x={740} y={1120} e={0.62} />
          <Agente x={250} y={1180} escala={0.62} olha={0.3} semente="ag1" gesto={false} />
          <Agente n={1} x={410} y={1195} escala={0.64} olha={0.3} semente="ag2" gesto={false} />
          {/* portão de ferro */}
          {new Array(9).fill(0).map((_, i) => (
            <g key={i}>
              <rect x={i * 136 - 12} y={0} width={32} height={1920} fill="#191D24" />
              <rect x={i * 136 - 12} y={0} width={9} height={1920} fill="#3B424D" />
            </g>
          ))}
          <rect x={-20} y={640} width={1120} height={46} fill="#151920" />
          <rect x={-20} y={640} width={1120} height={12} fill="#38404B" />
          <rect x={-20} y={1120} width={1120} height={46} fill="#151920" />
          <rect x={-20} y={1120} width={1120} height={12} fill="#38404B" />
          <Cadeado t={t} cai={c1 - 0.35} />
          {/* alicate de corte */}
          <g transform={`translate(${830 - fecha * 180} ${830}) rotate(${6 - fecha * 3})`}>
            <polygon points={`-110,${-34 + fecha * 26} 40,-26 40,-6 -110,-6`} fill="#2B2F36" />
            <polygon points={`-110,${34 - fecha * 26} 40,26 40,6 -110,6`} fill="#3B4048" />
            <rect x={40} y={-34} width={84} height={68} rx={12} fill="#20242A" />
            <rect x={110} y={-48 + fecha * 14} width={520} height={38} rx={14} fill="#B22E25" />
            <rect x={110} y={14 - fecha * 14} width={520} height={38} rx={14} fill="#8E241D" />
          </g>
        </Tela>
        <Chuva forca={0.34} />
      </AbsoluteFill>
    );
  }
  if (t < c2) {
    // a ficha enche a tela, com a chuva caindo no papel
    const tt = t - c1;
    const rua = { z: 300, x: 0, alt: 760, hor: 700 };
    return (
      <AbsoluteFill style={{ background: "#090D16" }}>
        <RuaChuva c={rua} t={t} desfoque={9} />
        <Tela>
          <Mao id="fi" x={110} y={1460} rot={22} e={1.15} pele="#C89A72" sombra="#A97D58" manga="#14151B" punho="#DAD8D0" />
          <Ficha t={tt} x={540} y={840 - freia(tt, 0, 0.3, -30, 0)} circulo={suave(tt, palavra("n-denis", "oitenta") - S.captura - c1 + 0.1, palavra("n-denis", "oitenta") - S.captura - c1 + 0.7, 0, 1)} />
        </Tela>
        <Chuva forca={0.26} />
      </AbsoluteFill>
    );
  }
  // quatro agentes, igual saco de cimento, até o carro preto
  const tt = t - c2;
  const close = t >= c3;
  const xCarrega = interpolate(tt, [0, 6.5], [-200, 220], clamp);
  const cabeca = xCarrega + 100 + 668 * 0.92;
  const rua: Cam = { z: 400 + tt * 40, x: 0, alt: 800, hor: 800 };
  const chao = 1560;
  const fala = janelas(["denis"], S.captura);
  const corpo = (
    <>
      <RuaChuva c={rua} t={t} lambe />
      <Tela>
        <CarroTras x={880} y={1230} e={1.0} />
        <Agente x={xCarrega + 250} y={chao - 70} escala={0.88} anda={1.4} olha={0.5} gesto={false} pose={{ bracoD: 50, antebracoD: -70 }} semente="ag3" />
        <Agente n={1} x={xCarrega + 560} y={chao - 70} escala={0.88} anda={1.4} olha={0.5} gesto={false} pose={{ bracoD: 50, antebracoD: -70 }} semente="ag4" />
        <Agente n={1} x={xCarrega + 140} y={chao + 30} escala={1} anda={1.4} olha={0.5} gesto={false} pose={{ bracoD: 50, antebracoD: -70 }} semente="ag5" />
        <Agente x={xCarrega + 450} y={chao + 30} escala={1} anda={1.4} olha={0.5} gesto={false} pose={{ bracoD: 50, antebracoD: -70 }} semente="ag6" />
        <g transform={`translate(0 ${Math.sin(tt * 8.8) * 6})`}>
          <Denis x={xCarrega + 100} y={chao - 440} escala={0.92} casa rot={88} sombra={false} t={t} fala={fala} olhos="espanto" olha={0} pose={{ bracoE: 20, bracoD: 40, antebracoD: -20, pernaE: 8, pernaD: -14 + Math.sin(tt * 7) * 8 }} semente="denis" />
        </g>
      </Tela>
      <Escuro x={540} y={1100} r={1050} forca={0.42} />
      <Chuva forca={0.34} />
      <Respingos />
    </>
  );
  return close ? (
    <Zoom z={1.8} ox={cabeca} oy={chao - 440} dx={540 - cabeca} dy={-240}>
      {corpo}
    </Zoom>
  ) : (
    <Zoom z={1.02 + tt * 0.01} ox={540} oy={1300}>
      {corpo}
    </Zoom>
  );
};

// ---------- 3 galpão ----------
const Palpebra: React.FC<{ abre: number }> = ({ abre }) => (
  <Tela>
    <rect x={0} y={0} width={1080} height={960 * (1 - abre)} fill="#000" />
    <rect x={0} y={960 + 960 * abre} width={1080} height={960} fill="#000" />
  </Tela>
);

export const CenaGalpao: React.FC<{ t: number }> = ({ t }) => {
  const c1 = clipe("n-volta").inicio - S.galpao;
  const c2 = palavra("n-volta", "cada") - S.galpao - 0.1;
  const c3 = clipe("d-aguado").inicio - S.galpao - 0.1;
  const c4 = clipe("a-anota").inicio - S.galpao - 0.2;
  if (t < c1) {
    // primeira pessoa: abre o olho e vê as mãos na beira da tábua
    const c: Cam = { z: -40 + t * 16, x: 0, alt: 640, hor: 1000 - t * 16 };
    const abre = suave(t, 0, 1.0, 0, 1);
    return (
      <AbsoluteFill style={{ background: "#0A0E15", filter: `blur(${Math.max(0, 7 - t * 7)}px)` }}>
        <GalpaoFundo c={c} t={t} />
        <Tela>
          <defs>
            <linearGradient id="tabuaFP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#A17F50" />
              <stop offset="1" stopColor="#3B2B18" />
            </linearGradient>
          </defs>
          <rect x={-10} y={1400} width={1100} height={520} fill="url(#tabuaFP)" />
          {[1500, 1640, 1780].map((y) => (
            <rect key={y} x={-10} y={y} width={1100} height={5} fill="#231809" />
          ))}
          <rect x={-10} y={1388} width={1100} height={24} fill="#C4A16E" />
          <polygon points="0,1388 0,860 120,1020 120,1388" fill="#6E5230" />
          <polygon points="1080,1388 1080,860 960,1020 960,1388" fill="#5C4427" />
          <Mao id="fe" x={260} y={1640} rot={-6} e={1.25} dobra={60} />
          <Mao id="fd" x={820} y={1640} rot={6} e={1.25} dobra={60} />
        </Tela>
        <Palpebra abre={abre} />
      </AbsoluteFill>
    );
  }
  if (t < c2) {
    // o corredor entre os blocos
    const tt = t - c1;
    const c: Cam = { z: -300 + tt * 620, x: Math.sin(tt * 0.5) * 60, alt: 780, hor: 860 };
    return (
      <AbsoluteFill style={{ background: "#0A0E15" }}>
        <GalpaoFundo c={c} t={t} desfoque={1.4} />
      </AbsoluteFill>
    );
  }
  if (t < c3) {
    const tt = t - c2;
    return (
      <Zoom z={1 + tt * 0.03} ox={540} oy={760}>
        <ParedeBloco n="Nº 17" t={t} />
      </Zoom>
    );
  }
  if (t < c4) {
    const tt = t - c3;
    return (
      <AbsoluteFill>
        <CenaForma t={t} c={{ ...MESTRE, z: 150 + tt * 12 }} fala={janelas(["denis"], S.galpao)} />
        <Placa s={tt} de={0.15} ate={3.6} nome="DENIS, 34" desc="NÃO QUEBRA (PARTE 1)" x={540} y={380} />
      </AbsoluteFill>
    );
  }
  // o agente nem olha pro Denis
  return (
    <Zoom z={2.15 + (t - c4) * 0.03} ox={850} oy={850}>
      <CenaForma t={t} falaA={janelas(["agente"], S.galpao)} />
    </Zoom>
  );
};

// ---------- 4 física ----------
const Corte: React.FC<{ t: number; sobe: number; tampa: number; aperta: number; fala?: [number, number][]; olhos?: "normal" | "espanto"; respira?: number }> = ({ t, sobe, tampa, aperta, fala, olhos = "normal", respira = 0 }) => {
  const base = 1570;
  const topo = 420;
  const y = base - sobe * 330;
  const nivelY = 790;
  return (
    <AbsoluteFill style={{ background: "#0A0E15" }}>
      <GalpaoFundo c={MESTRE} t={t} desfoque={9} />
      <AbsoluteFill style={{ background: "rgba(5,8,16,0.55)" }} />
      <Tela>
        <defs>
          <linearGradient id="concCorte" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A9A8A0" />
            <stop offset="1" stopColor="#5E5F5A" />
          </linearGradient>
          <linearGradient id="tabCorte" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A17F50" />
            <stop offset="1" stopColor="#5B4426" />
          </linearGradient>
        </defs>
        <rect x={190} y={topo} width={700} height={1180} fill="#14110C" />
        <Denis x={540} y={y} escala={1.02} t={t} fala={fala} casa olhos={olhos} olha={0} pose={{ bracoE: 12, bracoD: 12, antebracoE: -4, antebracoD: -4 }} estica={1 - aperta * 0.04} semente="denis" sombra={false} />
        {/* concreto: dá pra ver o corpo por dentro */}
        <rect x={190} y={nivelY} width={700} height={1580 - nivelY} fill="url(#concCorte)" opacity={0.74} />
        <rect x={190} y={nivelY - 6} width={700} height={12} fill="#C9C8C0" />
        {new Array(16).fill(0).map((_, i) => {
          const r = (s: string) => random(`bolha${i}${s}`);
          return <circle key={i} cx={210 + r("x") * 660} cy={nivelY + 50 + r("y") * 720} r={6 + r("r") * 13} fill="#54554F" opacity={0.42} />;
        })}
        {/* o concreto empurrando o peito, dos dois lados */}
        {aperta > 0 &&
          [
            [230, 1],
            [850, -1],
          ].flatMap(([x, s]) =>
            [0, 1, 2].map((i) => {
              const f = ((t * 0.9 + i / 3) % 1 + 1) % 1;
              const px = x + s * (30 + f * 70);
              const py = y - 490 + i * 86;
              return <polygon key={`${x}${i}`} points={`${px},${py - 26} ${px + s * 70},${py} ${px},${py + 26}`} fill="#fff" opacity={aperta * (1 - f) * 0.85} />;
            }),
          )}
        {/* paredes */}
        <rect x={150} y={topo} width={40} height={1180} fill="url(#tabCorte)" />
        <rect x={890} y={topo} width={40} height={1180} fill="url(#tabCorte)" />
        <rect x={150} y={1570} width={780} height={40} fill="#5B4426" />
        {[560, 760, 960, 1160, 1360].flatMap((py) => [150, 890].map((px) => <rect key={`${px}${py}`} x={px} y={py} width={40} height={4} fill="#2A1E0E" />))}
        {/* tampa, descendo e travando */}
        <g transform={`translate(0 ${-420 + tampa * 420})`}>
          <rect x={120} y={topo - 44} width={840} height={52} fill="url(#tabCorte)" />
          <rect x={120} y={topo - 44} width={840} height={12} fill="#CBA874" />
          {[240, 540, 840].map((x) => (
            <g key={x}>
              <rect x={x - 16} y={topo - 86} width={32} height={48} fill="#3A4048" />
              <rect x={x - 40} y={topo - 100} width={80} height={18} rx={4} fill="#59606A" />
            </g>
          ))}
        </g>
        {/* ar saindo: cada respirada menor */}
        {respira > 0 && <ellipse cx={560} cy={y - 700} rx={46 * respira} ry={24 * respira} fill="#E7E7E2" opacity={0.5} style={{ filter: "blur(8px)" }} />}
      </Tela>
    </AbsoluteFill>
  );
};

const PeitoFP: React.FC<{ t: number }> = ({ t }) => {
  // quanto mais o tempo passa, menos o peito sobe
  const amp = interpolate(t, [0, 2.2], [46, 4], clamp);
  const r = Math.sin(t * 5.2);
  return (
    <AbsoluteFill style={{ background: "#07090E" }}>
      <Tela>
        <defs>
          <linearGradient id="fpCam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7E8490" />
            <stop offset="1" stopColor="#3D4250" />
          </linearGradient>
          <linearGradient id="fpConc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BDBCB4" />
            <stop offset="1" stopColor="#6A6B65" />
          </linearGradient>
          <linearGradient id="fpMad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2C2112" />
            <stop offset="1" stopColor="#6A5230" />
          </linearGradient>
        </defs>
        {/* tábuas da tampa e dos lados, bem perto */}
        <rect x={0} y={0} width={1080} height={700} fill="url(#fpMad)" />
        {[120, 260, 400, 540].map((y) => (
          <rect key={y} x={0} y={y} width={1080} height={5} fill="#120C04" />
        ))}
        <polygon points="0,0 200,330 200,1040 0,1200" fill="#3A2C18" />
        <polygon points="1080,0 880,330 880,1040 1080,1200" fill="#2F2413" />
        {/* a camiseta vista de cima, subindo e descendo */}
        <g transform={`translate(0 ${-r * amp})`}>
          <path d="M 170 1920 Q 170 1040 330 900 Q 540 790 750 900 Q 910 1040 910 1920 Z" fill="url(#fpCam)" />
          <path d="M 410 840 Q 540 950 670 840 L 640 800 Q 540 880 440 800 Z" fill="#2F3442" />
          {[[420, 1130], [640, 1080], [520, 1290], [720, 1250], [360, 1320]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={12 + (i % 3) * 7} fill="#B9B7AE" />
          ))}
        </g>
        {/* braços descendo pro concreto */}
        <g transform={`translate(0 ${-r * amp * 0.6})`}>
          <path d="M 250 930 Q 130 1020 120 1500 L 250 1500 Q 270 1120 340 1020 Z" fill="#7E8490" />
          <path d="M 830 930 Q 950 1020 960 1500 L 830 1500 Q 810 1120 740 1020 Z" fill="#6A6F7C" />
          <path d="M 128 1240 L 118 1500 L 250 1500 L 262 1240 Z" fill="#B07A52" />
          <path d="M 952 1240 L 962 1500 L 830 1500 L 818 1240 Z" fill="#90613F" />
        </g>
        <ellipse cx={540 + Math.sin(t * 1.3) * 10} cy={720 - r * 16} rx={interpolate(t, [0, 2.2], [120, 30], clamp) * (0.7 + 0.3 * Math.max(0, r))} ry={interpolate(t, [0, 2.2], [56, 14], clamp)} fill="#ECECE6" opacity={0.3} style={{ filter: "blur(14px)" }} />
        {/* concreto na linha do peito */}
        <path d={`M 0 1380 Q 300 ${1320 - r * amp * 0.4} 540 ${1340 - r * amp * 0.5} Q 800 ${1320 - r * amp * 0.4} 1080 1380 L 1080 1920 L 0 1920 Z`} fill="url(#fpConc)" />
        {[[210, 1460, 90], [540, 1520, 130], [840, 1450, 80], [380, 1700, 150], [760, 1740, 120]].map(([x, y, w], i) => (
          <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.16} fill="#5C5D58" opacity={0.3} />
        ))}
      </Tela>
    </AbsoluteFill>
  );
};

export const CenaFisica: React.FC<{ t: number }> = ({ t }) => {
  const c1 = clipe("n-peso").inicio - S.fisica;
  const c2 = clipe("n-boia").inicio - S.fisica;
  const c3 = clipe("n-resp").inicio - S.fisica;
  const c4 = clipe("d-aperta").inicio - S.fisica - 0.1;
  if (t < c1) {
    // sobem mais tábuas e o concreto sobe junto
    return <CenaForma t={t} c={{ ...MESTRE, z: 190 + t * 25, alt: 1120 }} nivel={interpolate(t, [0, c1], [380, 470], clamp)} altura={interpolate(t, [0, c1], [460, 580], clamp)} despeja={1} olhos="espanto" olha={0.2} pose={{ bracoE: 20, antebracoE: -6, bracoD: 20, antebracoD: -6 }} />;
  }
  if (t < c2) {
    const tt = t - c1;
    return (
      <AbsoluteFill style={{ background: "#0A0E15" }}>
        <GalpaoFundo c={{ z: 700, x: 0, alt: 560, hor: 1000 }} t={t} desfoque={8} />
        <AbsoluteFill style={{ background: "rgba(5,8,16,0.42)" }} />
        <Tela>
          <polygon points="-20,1040 1100,1040 1100,1920 -20,1920" fill="#20252B" />
          <rect x={-20} y={1036} width={1120} height={6} fill="#4A4F58" />
          <Balanca id="agua" x={280} y={1300} cor="#3F8FD8" kg={suave(tt, 0.1, 0.9, 0, 10)} nome="10 L · ÁGUA" corVisor="#3CE0F0" />
          <Balanca id="conc" x={800} y={1300} cor="#A9A8A0" kg={suave(tt, 0.5, 1.6, 0, 24)} nome="10 L · CONCRETO" corVisor="#FF5A4B" altura={suave(tt, 0.5, 1.6, 0, 8)} />
        </Tela>
      </AbsoluteFill>
    );
  }
  if (t < c3) {
    const tt = t - c2;
    const boia = palavra("n-boia", "boia") - S.fisica - c2;
    const tampa = palavra("n-boia", "tampa") - S.fisica - c2;
    const aperta = palavra("n-boia", "aperta") - S.fisica - c2;
    return <Corte t={t} sobe={suave(tt, boia - 0.3, tampa + 0.2, 0, 1)} tampa={freia(tt, tampa - 0.3, tampa + 0.2, 0, 1)} aperta={suave(tt, aperta - 0.1, aperta + 0.6, 0, 1)} />;
  }
  if (t < c4) return <PeitoFP t={t - c3} />;
  // de perto, sem espaço: a mão na tábua, o concreto no peito
  return (
    <Zoom z={1.8} ox={540} oy={560}>
      <Corte t={t} sobe={1} tampa={1} aperta={1} fala={janelas(["denis"], S.fisica)} olhos="espanto" />
    </Zoom>
  );
};

// ---------- 5 a regra ----------
export const CenaRegra: React.FC<{ t: number }> = ({ t }) => {
  const c1 = palavra("n-reacao", "poucas") - S.regra - 0.2;
  const c2 = clipe("a-solto").inicio - S.regra - 0.3;
  if (t < c2) {
    const seca = suave(t, c1, c1 + 1.4, 0, 1);
    const horas = 3 + Math.floor(suave(t, c1, c1 + 1.3, 0, 4));
    return (
      <Zoom z={1 + t * 0.008} ox={540} oy={900}>
        <AbsoluteFill style={{ background: "#0A0E15" }}>
          <Tela>
            <defs>
              <linearGradient id="superf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2B2C2C" />
                <stop offset="0.3" stopColor={interpolate(seca, [0, 1], [0, 1], clamp) > 0.5 ? "#8D8E8A" : "#6E6F6A"} />
                <stop offset="1" stopColor={seca > 0.5 ? "#A5A6A1" : "#8D8E88"} />
              </linearGradient>
            </defs>
            <rect width={1080} height={1920} fill="url(#superf)" />
            {new Array(22).fill(0).map((_, i) => {
              const r = (s: string) => random(`sup${i}${s}`);
              return <ellipse key={i} cx={r("x") * 1080} cy={500 + r("y") * 1420} rx={60 + r("r") * 150} ry={10 + r("r") * 28} fill="#52534E" opacity={0.28 * (1 - seca * 0.6)} />;
            })}
            {/* bolhas enquanto reage */}
            {new Array(14).fill(0).map((_, i) => {
              const r = (s: string) => random(`bo${i}${s}`);
              const f = ((t * (0.5 + r("v")) + r("f")) % 1 + 1) % 1;
              return <circle key={`b${i}`} cx={r("x") * 1080} cy={700 + r("y") * 1100} r={(6 + r("r") * 22) * f} fill="none" stroke="#D8D7CF" strokeWidth={3} opacity={(1 - f) * 0.7 * (1 - seca)} />;
            })}
            {/* trincas de quando virou pedra */}
            <g stroke="#4A4B47" strokeWidth={5} fill="none" opacity={seca}>
              <path d="M 80 900 l 130 70 l 60 150 l 180 40 l 90 200 M 620 760 l -60 180 l 130 90 l 40 170 l 210 90 M 170 1500 l 180 -60 l 130 110 l 150 -30" />
            </g>
            <Termometro x={540} y={1420} k={suave(t, 0.5, c1 + 0.4, 0.12, 0.9)} />
            {/* vapor */}
            {new Array(10).fill(0).map((_, i) => {
              const r = (s: string) => random(`vap${i}${s}`);
              const f = ((t * 0.32 + r("f")) % 1 + 1) % 1;
              return <ellipse key={`v${i}`} cx={r("x") * 1080 + Math.sin(t + i) * 30} cy={1300 - f * 1000} rx={90 + f * 120} ry={60 + f * 80} fill="#E9E9E3" opacity={0.17 * (1 - f) * (1 - seca * 0.7)} style={{ filter: "blur(16px)" }} />;
            })}
            {/* relógio de ponto correndo */}
            {t > c1 && (
              <g>
                <rect x={330} y={210} width={420} height={170} rx={14} fill="#10141B" stroke="#2C323C" strokeWidth={6} />
                <text x={540} y={340} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={140} letterSpacing={6} fill="#FF4B3E">
                  {`0${horas}:17`}
                </text>
              </g>
            )}
          </Tela>
        </AbsoluteFill>
      </Zoom>
    );
  }
  return <Dentro t={t - c2} nivel={0.28} abre={1} fala={janelas(["agente"], S.regra + c2)} />;
};

// Primeira pessoa, por dentro da forma: a fresta da tampa lá em cima, o concreto subindo.
const Dentro: React.FC<{ t: number; nivel: number; abre: number; fala?: [number, number][]; semAgente?: boolean }> = ({ t, nivel, abre, fala, semAgente }) => {
  const altoFresta = 330 * abre;
  const fy = 400;
  const superficie = 1920 - nivel * 1920;
  return (
    <AbsoluteFill style={{ background: "#040508" }}>
      <Tela>
        <defs>
          <linearGradient id="dentroMad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6E5533" />
            <stop offset="1" stopColor="#201709" />
          </linearGradient>
          <linearGradient id="feixeDentro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE9BE" stopOpacity={0.3} />
            <stop offset="1" stopColor="#FFE9BE" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="concDentro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B7B6AE" />
            <stop offset="1" stopColor="#55564F" />
          </linearGradient>
          <clipPath id="fresta">
            <rect x={200} y={fy - altoFresta / 2} width={680} height={altoFresta} />
          </clipPath>
        </defs>
        {/* teto: a tampa */}
        <rect x={0} y={0} width={1080} height={700} fill="url(#dentroMad)" />
        {[100, 200, 300, 500, 600].map((y) => (
          <rect key={y} x={0} y={y} width={1080} height={5} fill="#120C04" />
        ))}
        {/* paredes em perspectiva */}
        <polygon points="0,0 170,250 170,1160 0,1920" fill="#2C2212" />
        <polygon points="1080,0 910,250 910,1160 1080,1920" fill="#241B0E" />
        <rect x={170} y={700} width={740} height={700} fill="#16110A" />
        {/* a fresta, com o galpão e o agente lá fora */}
        <g clipPath="url(#fresta)">
          <rect x={200} y={0} width={680} height={700} fill="#3A3D40" />
          <rect x={200} y={fy - 220} width={680} height={120} fill="#FFE9BE" opacity={0.55} />
          {!semAgente && <Agente x={560} y={fy + 668 * 1.9 + 20} escala={1.9} t={t} fala={fala} olhos="normal" olha={0} gesto={false} vivo semente="fresta" sombra={false} />}
        </g>
        <rect x={190} y={fy - altoFresta / 2 - 14} width={700} height={14} fill="#8C6F45" />
        <rect x={190} y={fy + altoFresta / 2} width={700} height={14} fill="#3C2C16" />
        {abre > 0 && <polygon points={`200,${fy + altoFresta / 2} 880,${fy + altoFresta / 2} ${1020},1500 60,1500`} fill="url(#feixeDentro)" opacity={abre} />}
        {/* o concreto subindo */}
        <path d={`M 0 ${superficie + 14} Q 270 ${superficie - 10 + Math.sin(t * 2) * 6} 540 ${superficie + 8} T 1080 ${superficie} L 1080 1920 L 0 1920 Z`} fill="url(#concDentro)" />
        {new Array(8).fill(0).map((_, i) => {
          const r = (s: string) => random(`dc${i}${s}`);
          return <ellipse key={i} cx={r("x") * 1080} cy={superficie + 60 + r("y") * 500} rx={70 + r("r") * 150} ry={10 + r("r") * 18} fill="#3F403B" opacity={0.3} />;
        })}
      </Tela>
    </AbsoluteFill>
  );
};

// ---------- 6 deu ruim ----------
export const CenaRuim: React.FC<{ t: number }> = ({ t }) => {
  const boca = clipe("n-boca").inicio - S.ruim;
  const fimB = clipe("n-boca").fim - S.ruim;
  const nivel = interpolate(t, [0, boca, fimB], [0.3, 0.5, 0.93], clamp);
  const abre = interpolate(t, [boca, fimB + 0.1], [1, 0], clamp);
  if (t > fimB + 0.15) return <AbsoluteFill style={{ background: "#000" }} />;
  return <Dentro t={t} nivel={nivel} abre={abre} />;
};

// ---------- 7 o apito ----------
const Retrovisor: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#05070C" }}>
    <RuaChuva c={{ z: 300, x: 200, alt: 700, hor: 700 }} t={t} desfoque={10} />
    <AbsoluteFill style={{ background: "rgba(3,5,10,0.62)" }} />
    <Tela>
      <rect x={70} y={640} width={940} height={400} rx={70} fill="#17191F" />
      <rect x={94} y={664} width={892} height={352} rx={52} fill="#0C1320" />
      <clipPath id="espelho">
        <rect x={94} y={664} width={892} height={352} rx={52} />
      </clipPath>
      <g clipPath="url(#espelho)">
        <rect x={94} y={664} width={892} height={352} fill="#141D2C" />
        <OlheiroBloco x={540} y={840 + 665 * 3.1} escala={3.1} vivo={false} olha={0} olhosVerdes={1} pose={{ bracoD: 6 }} />
        <rect x={94} y={664} width={892} height={352} fill="#050A18" opacity={0.42} />
      </g>
      <rect x={94} y={664} width={892} height={90} rx={40} fill="#fff" opacity={0.05} />
      <rect x={510} y={0} width={60} height={646} fill="#17191F" />
    </Tela>
    <Chuva forca={0.22} />
  </AbsoluteFill>
);

export const CenaApito: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const cLuz = clipe("n-luz").inicio - S.apito;
  const cRe = clipe("n-re").inicio - S.apito;
  const cVem = cRe + 0.9;
  const cBate = palavra("n-re", "forma") - S.apito - 0.4;
  const cDenis = clipe("d-porra").inicio - S.apito - 0.1;
  if (t < cLuz) return <AbsoluteFill style={{ background: "#000" }} />;
  if (t < cRe) {
    // as luminárias apagando de fileira em fileira, com o agente olhando pra cima
    const tt = t - cLuz;
    const luz = tt < 0.5 ? (Math.floor(tt * 16) % 2 ? 1 : 0.35) : tt < 0.95 ? 0.2 : 0;
    return (
      <AbsoluteFill>
        <CenaForma t={t} nivel={560} altura={720} olhos="normal" luz={luz} semAgente={false} />
        <AbsoluteFill style={{ background: "#02040A", opacity: interpolate(tt, [0.45, 0.95], [0.1, 0.72], clamp) }} />
      </AbsoluteFill>
    );
  }
  if (t < cVem) return <Retrovisor t={t} />;
  if (t < cBate) {
    // de ré, pelo portão, no escuro: só a luz da ré
    const k = (t - cVem) / (cBate - cVem);
    const c: Cam = { z: 0, x: 0, alt: 900, hor: 700 };
    const z = interpolate(k, [0, 1], [7000, 500], { easing: (x) => x * x });
    const [x, y, e] = P(c, 0, 0, z);
    return (
      <AbsoluteFill style={{ background: "#030509" }}>
        <GalpaoFundo c={c} t={t} luz={0} desfoque={2} />
        <AbsoluteFill style={{ background: "rgba(2,4,10,0.74)" }} />
        <Tela>
          <BetoneiraRe x={x} y={y} e={e * 1.05} gira={tg} />
        </Tela>
        <AbsoluteFill style={{ background: "#FF2A20", opacity: ((Math.sin(tg * 6.3) + 1) / 2) * 0.06, mixBlendMode: "screen" }} />
      </AbsoluteFill>
    );
  }
  if (t < cDenis) {
    // a pancada: tábua pra todo lado, concreto e poeira
    const tt = t - cBate;
    return (
      <AbsoluteFill style={{ background: "#07090E", transform: `translate(${Math.sin(tt * 70) * Math.max(0, 22 - tt * 26)}px, ${Math.cos(tt * 61) * Math.max(0, 16 - tt * 20)}px)` }}>
        {tt < 0.1 && <CenaForma t={t} nivel={560} altura={720} luz={0} />}
        <GalpaoFundo c={MESTRE} t={t} luz={0} />
        <AbsoluteFill style={{ background: "rgba(2,4,10,0.6)" }} />
        <Tela>
          <polygon points="-200,1920 1280,1920 760,1180 320,1180" fill="#FFF4DA" opacity={0.14} />
          <ellipse cx={540} cy={1500} rx={900} ry={260} fill="#7F7F78" opacity={Math.min(0.9, tt * 2.4)} />
          <Fumaca3D t={tt} x={540} y={1250} n={18} cor="#9A9A92" dur={1.9} raio={170} sobe={520} abre={720} forca={0.8} id="fumForma" />
          <Estilhacos t={tt} x={540} y={1200} chao={1730} n={30} cores={["#A98A5C", "#8E6B42", "#C2955C"]} forca={1.25} tam={46} semente="tabua" abre={1.1} fino />
          <Estilhacos t={tt} x={540} y={1250} chao={1740} n={18} cores={["#9B9A92", "#BCBBB3"]} forca={0.9} tam={24} semente="respingo" />
          <BetoneiraRe x={540} y={1360 + tt * 40} e={0.92} gira={tg} />
          <Agente x={110 - tt * 160} y={1500} escala={0.8} anda={3} dir={-1} gesto={false} semente="c1" olhos="espanto" />
          <Agente n={1} x={970 + tt * 160} y={1490} escala={0.8} anda={3} gesto={false} semente="c2" olhos="espanto" />
        </Tela>
        <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 0.9 - tt * 5) }} />
      </AbsoluteFill>
    );
  }
  // o Denis no chão, cinza da cabeça aos pés, na luz da ré
  const tt = t - cDenis;
  return (
    <Zoom z={1.04 + tt * 0.012} ox={540} oy={1100}>
      <AbsoluteFill style={{ background: "#07090E" }}>
        <GalpaoFundo c={{ ...MESTRE, z: 240, hor: 640, alt: 800 }} t={t} luz={0} desfoque={4} />
        <AbsoluteFill style={{ background: "rgba(3,5,12,0.48)" }} />
        <Tela>
          <defs>
            <radialGradient id="pocaConc" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0" stopColor="#ADACA4" />
              <stop offset="1" stopColor="#6E6E68" />
            </radialGradient>
          </defs>
          <ellipse cx={520} cy={1460} rx={760} ry={240} fill="url(#pocaConc)" />
          {[[150, 1400, 26, "#8E6B42"], [840, 1360, -18, "#A98A5C"], [300, 1600, -8, "#7F5F39"], [790, 1610, 12, "#96734A"], [80, 1220, 60, "#86653C"], [980, 1190, -52, "#8B683F"]].map(([x, y, a, c], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <rect x={-170} y={-22} width={340} height={44} fill={c as string} />
              <rect x={-170} y={-22} width={340} height={8} fill="#fff" opacity={0.14} />
              <circle cx={140} cy={0} r={5} fill="#30343A" />
            </g>
          ))}
          <DenisCinza x={520} y={1460} escala={1.12} t={t} fala={janelas(["denis"], S.apito)} rot={-14} estica={0.94} olhos="normal" boca="o" olha={0.2} pose={{ bracoE: 60, antebracoE: -36, bracoD: 60, antebracoD: -36, pernaE: -40, joelhoE: 90, pernaD: 40, joelhoD: 80 }} />
          <polygon points="-200,1920 1280,1920 900,840 180,840" fill="#FFF4DA" opacity={0.1} />
        </Tela>
      </AbsoluteFill>
    </Zoom>
  );
};

// ---------- 8 a cabine ----------
const Parabrisa: React.FC<{ t: number; rostoO?: number; children?: React.ReactNode; falaD?: [number, number][]; falaO?: [number, number][]; olhosO?: number; olhaD?: number; olhaO?: number; bocaD?: "neutra" | "o" }> = ({ t, falaD, falaO, olhosO = 0, olhaD = 0.5, olhaO = 0.1, bocaD = "neutra" }) => {
  const tg = useCurrentFrame() / 30;
  const fase = ((tg * 0.7) % 1 + 1) % 1;
  const lim = Math.sin(fase * Math.PI * 2);
  const barra = ((tg * 0.55) % 1 + 1) % 1;
  return (
    <AbsoluteFill style={{ background: "#05070C" }}>
      <Tela>
        <defs>
          <linearGradient id="cabineFundo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10151F" />
            <stop offset="1" stopColor="#19202C" />
          </linearGradient>
          <linearGradient id="painel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A2E36" />
            <stop offset="1" stopColor="#0E1014" />
          </linearGradient>
          <linearGradient id="luzRadio" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3CF0A0" stopOpacity={0.2} />
            <stop offset="1" stopColor="#3CF0A0" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="vidroRefl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B7D0EE" stopOpacity={0.16} />
            <stop offset="0.5" stopColor="#B7D0EE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#cabineFundo)" />
        {/* banco e vidro de trás */}
        <rect x={100} y={440} width={880} height={260} rx={30} fill="#0B1019" />
        <rect x={120} y={460} width={840} height={200} rx={20} fill="#16243A" />
        <rect x={60} y={760} width={420} height={760} rx={54} fill="#1E2026" />
        <rect x={600} y={760} width={420} height={760} rx={54} fill="#1E2026" />
        {/* os dois */}
        <DenisCinza x={280} y={1760} escala={1.42} t={t} fala={falaD} olha={olhaD} boca={bocaD} gesto={false} pose={{ bracoE: 8, bracoD: 8, antebracoD: -30 }} />
        <OlheiroBloco x={800} y={1760} escala={1.42} t={t} fala={falaO} olha={olhaO} olhosVerdes={olhosO} pose={{ bracoD: 28, antebracoD: -60, bracoE: 30, antebracoE: -60 }} />
        <rect width={1080} height={1300} fill="#9AA89C" style={{ mixBlendMode: "multiply" }} />
        {/* luz de poste passando pelo vidro */}
        <polygon points={`${-500 + barra * 2100},0 ${-180 + barra * 2100},0 ${-540 + barra * 2100},1500 ${-860 + barra * 2100},1500`} fill="#FFDFA5" opacity={0.13} style={{ mixBlendMode: "screen" }} />
        {/* painel, volante e rádio com o 03:17 */}
        <rect x={-10} y={1280} width={1100} height={660} fill="url(#painel)" />
        <rect x={-10} y={1276} width={1100} height={14} fill="#3F444E" />
        <circle cx={800} cy={1240} r={190} fill="none" stroke="#0A0B0F" strokeWidth={38} />
        <circle cx={800} cy={1240} r={190} fill="none" stroke="#2A2D34" strokeWidth={8} />
        <rect x={776} y={1060} width={48} height={190} fill="#0A0B0F" />
        <rect x={395} y={1500} width={290} height={124} rx={12} fill="#07090C" />
        <text x={540} y={1590} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={96} letterSpacing={5} fill="#3CF0A0">
          03:17
        </text>
        <rect x={0} y={1000} width={1080} height={320} fill="url(#luzRadio)" />
        {/* parabrisa: moldura, chuva e limpador */}
        <rect x={0} y={0} width={1080} height={1290} fill="url(#vidroRefl)" />
        <rect x={0} y={0} width={1080} height={90} fill="#0A0C11" />
        <rect x={0} y={0} width={46} height={1300} fill="#0A0C11" />
        <rect x={1034} y={0} width={46} height={1300} fill="#0A0C11" />
        <g transform={`rotate(${-34 + lim * 58} 380 1320)`}>
          <rect x={372} y={300} width={16} height={1020} fill="#060709" />
          <rect x={362} y={300} width={36} height={620} rx={8} fill="#0B0C10" />
        </g>
        {new Array(44).fill(0).map((_, i) => {
          const r = (s: string) => random(`gota${i}${s}`);
          const yy = 100 + (((tg * (70 + r("v") * 180) + r("y") * 1200) % 1200) + 1200) % 1200;
          return <ellipse key={i} cx={60 + r("x") * 960} cy={yy} rx={3 + r("r") * 5} ry={7 + r("r") * 13} fill="#CFE0F4" opacity={0.28} />;
        })}
      </Tela>
    </AbsoluteFill>
  );
};

export const CenaCabine: React.FC<{ t: number }> = ({ t }) => {
  const c1 = clipe("d-quem").fim - S.cabine + 0.02;
  const c2 = palavra("o-lista", "porque") - S.cabine - 0.05;
  const c3 = clipe("n-ninguem").inicio - S.cabine - 0.1;
  const falaO = janelas(["olheiro"], S.cabine);
  const falaD = janelas(["denis"], S.cabine);
  if (t < c1) {
    const z = t < clipe("d-quem").inicio - S.cabine - 0.1 ? 1.05 : 1.5;
    return (
      <Zoom z={z + t * 0.006} ox={z > 1.2 ? 340 : 540} oy={900}>
        <Parabrisa t={t} falaO={falaO} falaD={falaD} olhaD={0.6} olhaO={-0.2} />
      </Zoom>
    );
  }
  if (t < c3) {
    // primeira pessoa: o crachá no colo cinza do Denis, depois a lista
    const tt = t - c1;
    const lista = t >= c2;
    return (
      <AbsoluteFill style={{ background: "#07090E" }}>
        <Tela>
          <defs>
            <linearGradient id="colo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#16181E" />
              <stop offset="0.5" stopColor="#4A4A46" />
              <stop offset="1" stopColor="#6E6D68" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#colo)" />
          <rect x={0} y={0} width={1080} height={220} fill="#0C1019" />
          <rect x={0} y={220} width={1080} height={12} fill="#3F444E" />
          {lista ? <Lista x={540} y={790} a={-3} e={1.04} /> : <Cracha x={540 + freia(tt, 0, 0.35, 340, 0)} y={800 + freia(tt, 0, 0.35, -520, 0)} a={freia(tt, 0, 0.35, 34, -5)} e={1.06} />}
          <Mao id="co" x={70} y={1560} rot={22} e={1.0} pele="#A9A8A0" sombra="#8C8B84" manga="#7E7D77" />
          <Mao id="cd" x={1010} y={1560} rot={-22} e={1.0} pele="#A9A8A0" sombra="#8C8B84" manga="#7E7D77" />
        </Tela>
      </AbsoluteFill>
    );
  }
  // ele olha pra frente, e os olhos acendem
  const tt = t - c3;
  return (
    <Zoom z={1.75 + tt * 0.02} ox={800} oy={770}>
      <Parabrisa t={t} falaO={falaO} olhaO={0} olhosO={suave(tt, 0.6, 1, 0, 1)} />
    </Zoom>
  );
};

// ---------- 9 1989 ----------
const Filme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ filter: "sepia(0.34) saturate(0.82) contrast(0.92) brightness(0.92)" }}>
      {children}
      <Tela>
        {new Array(6).fill(0).map((_, i) => {
          const r = (s: string) => random(`risco${i}${s}${Math.floor(f / 3)}`);
          return <rect key={i} x={r("x") * 1080} y={0} width={1 + r("w") * 2} height={1920} fill="#EFE8D0" opacity={0.1 + r("o") * 0.18} />;
        })}
      </Tela>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,6,0,0.62) 100%)" }} />
    </AbsoluteFill>
  );
};

const Pessoa: React.FC<{ x: number; y: number; e: number; n: number; t: number; anda?: number; dir?: 1 | -1; brilho?: number }> = ({ x, y, e, n, t, anda, dir, brilho = 1 }) => {
  const paletas = [
    { pele: "#B07A52", peleSombra: "#90613F", camisa: "#B24A4A", camisaEscura: "#8E3A3A", calca: "#3A4A6A", tenis: "#26262C", cabelo: "#1E1712" },
    { pele: "#D3A07A", peleSombra: "#B4815C", camisa: "#D2C47A", camisaEscura: "#AFA25F", calca: "#5A4A3C", tenis: "#2E2A26", cabelo: "#3A2A20" },
    { pele: "#8D5A3C", peleSombra: "#6F4630", camisa: "#6E8FA8", camisaEscura: "#567488", calca: "#34363C", tenis: "#E0E0DA", cabelo: "#101014" },
  ];
  return (
    <g>
      <ellipse cx={x} cy={y - 340 * e} rx={190 * e} ry={420 * e} fill="#3CF0A0" opacity={0.2 * brilho} style={{ filter: "blur(22px)" }} />
      <Corpo x={x} y={y} escala={e} t={t} cores={paletas[n % 3]} cabelo={n % 3 === 1 ? "longo" : "curto"} manga={90} anda={anda} dir={dir} semente={`p89${n}`} olha={0.3} />
    </g>
  );
};

export const CenaAntes: React.FC<{ t: number }> = ({ t }) => {
  const c1 = clipe("n-89").inicio - S.antes;
  const c2 = clipe("o-apontava").inicio - S.antes - 0.1;
  const c3 = clipe("o-levavam").inicio - S.antes - 0.1;
  const fim = S.blocos - S.antes;
  const rua: Cam = { z: 300 + t * 26, x: 0, alt: 720, hor: 860 };
  const chao = 1560;
  if (t < c1) {
    return (
      <Filme>
        <RuaChuva c={rua} t={t} antiga desfoque={1} />
        <Tela>
          <Pessoa x={250} y={chao - 300} e={0.6} n={0} t={t} anda={1} />
          <Pessoa x={800} y={chao - 260} e={0.66} n={1} t={t} anda={1} dir={-1} />
          <Pessoa x={540} y={chao - 130} e={0.84} n={2} t={t} />
        </Tela>
      </Filme>
    );
  }
  if (t < c2) {
    // o céu verde, com a placa do ano
    const tt = t - c1;
    return (
      <Filme>
        <RuaChuva c={{ z: 600, x: 0, alt: 300, hor: 1460 - tt * 40 }} t={t} antiga desfoque={1} />
        <Tela>
          <g transform={`translate(540 760) scale(${0.96 + tt * 0.012})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={260} letterSpacing={10} fill="#F3EEDC" style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.5))" }}>
              1989
            </text>
          </g>
        </Tela>
      </Filme>
    );
  }
  if (t < c3) {
    // ele apontando, de terno, olhos verdes
    const tt = t - c2;
    return (
      <Filme>
        <Zoom z={1 + tt * 0.02} ox={540} oy={1100}>
          <RuaChuva c={rua} t={t} antiga desfoque={3} />
          <Tela>
            <Pessoa x={880} y={chao - 150} e={0.84} n={0} t={t} />
            <Agente x={330} y={chao + 40} escala={1.26} t={t} raio={1} olha={0.8} gesto={false} pose={{ bracoD: 82, antebracoD: -4 }} semente="jovem" />
          </Tela>
        </Zoom>
      </Filme>
    );
  }
  // o carro antigo levando
  const tt = t - c3;
  const parte = suave(tt, fim - c3 - 0.8, fim - c3, 0, 1);
  return (
    <Filme>
      <RuaChuva c={rua} t={t} antiga desfoque={3} />
      <Tela>
        <CarroTras x={560} y={1340 - parte * 120} e={1.15 - parte * 0.25} antigo freio={1 - parte} />
        <Agente x={200} y={1420} escala={0.98} olha={0.6} gesto={false} pose={{ bracoD: 66, antebracoD: -30 }} semente="lev1" />
        <Pessoa x={340} y={1410} e={0.96} n={2} t={t} anda={0.8} brilho={0.7} />
      </Tela>
    </Filme>
  );
};

// ---------- 10 os blocos ----------
const Corredor: React.FC<{ t: number; luzV: number }> = ({ t, luzV }) => {
  const c: Cam = { z: 300 + t * 230, x: 0, alt: 800, hor: 840 };
  return (
    <AbsoluteFill style={{ background: "#040508" }}>
      <GalpaoFundo c={c} t={t} luz={0} desfoque={1.6} />
      <AbsoluteFill style={{ background: "#FF2318", opacity: 0.1 + luzV * 0.3, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 22%, rgba(255,50,30,${0.04 + luzV * 0.26}), transparent 62%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "rgba(3,4,10,0.12)" }} />
    </AbsoluteFill>
  );
};

export const CenaBlocos: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const luzV = ((Math.sin(tg * 3.1) + 1) / 2) ** 2;
  const c1 = clipe("d-blocos").fim - S.blocos + 0.1;
  const c2 = palavra("o-31", "Tudo") - S.blocos - 0.05;
  const bate = clipe("o-31").fim - S.blocos + 0.1;
  const c3 = clipe("o-preciso").inicio - S.blocos - 0.1;
  const c4 = clipe("d-merda").inicio - S.blocos - 0.2;
  const falaO = janelas(["olheiro"], S.blocos);
  const falaD = janelas(["denis"], S.blocos);
  if (t < c1) {
    return (
      <Zoom z={1.5} ox={340} oy={900}>
        <Parabrisa t={t} falaD={falaD} olhaD={0.5} />
      </Zoom>
    );
  }
  if (t < c2) return <Corredor t={t - c1} luzV={luzV} />;
  if (t < c3) {
    // a mão no bloco. E de dentro, uma batida.
    const tt = t - bate;
    const b1 = tt >= 0 ? Math.max(0, 1 - tt / 0.22) : 0;
    const b2 = tt >= 0.55 ? Math.max(0, 1 - (tt - 0.55) / 0.22) : 0;
    return (
      <AbsoluteFill style={{ background: "#07070C" }}>
        <ParedeBloco n="Nº 31" luz="#FF3A28" t={t} tremor={Math.max(b1, b2)} poeira={tt > 0 ? Math.min(1, tt * 1.1) : 0} />
        <AbsoluteFill style={{ background: "#FF2318", opacity: 0.08 + luzV * 0.22, mixBlendMode: "multiply" }} />
        <AbsoluteFill style={{ background: "rgba(3,4,10,0.28)" }} />
        <Tela>
          <Mao id="bl" x={590} y={1580 + Math.max(b1, b2) * 26} rot={-8} e={1.2} pele="#A9A8A0" sombra="#8C8B84" manga="#7E7D77" />
        </Tela>
      </AbsoluteFill>
    );
  }
  if (t < c4) {
    return (
      <Zoom z={1.75 + (t - c3) * 0.03} ox={800} oy={770}>
        <Parabrisa t={t} falaO={falaO} olhaO={-0.5} olhosO={1} />
      </Zoom>
    );
  }
  return (
    <Zoom z={1.9 + (t - c4) * 0.03} ox={280} oy={780}>
      <Parabrisa t={t} falaD={falaD} olhaD={0.3} bocaD="o" />
    </Zoom>
  );
};

// ---------- 11 o contrato ----------
const LINHAS = ["JONAS", "BRUNO", "KAIQUE", "DENIS"];
export const CenaContrato: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const atr = palavra("e-parede", "atravessar") - S.contrato;
  const parede = clipe("e-parede").fim - S.contrato;
  const assina = clipe("a-assina").inicio - S.contrato;
  const fim = S.final - S.contrato;
  const fantasma = t > atr && t < parede + 0.1 ? 1 : 0;
  const empurra = freia(t, assina - 0.05, assina + 0.3, 90, 0);
  const risca = suave(t, assina + 0.5, fim - 0.2, 0, 1);
  const px = 660 + Math.sin(risca * 24) * 66 * (risca > 0 && risca < 1 ? 1 : 0) + risca * 90;
  const py = 1560 - risca * 12 + Math.cos(risca * 31) * 13 * (risca > 0 && risca < 1 ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: "#07090E" }}>
      <Tela>
        <defs>
          <linearGradient id="vidroG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0F1C33" />
            <stop offset="1" stopColor="#23416B" />
          </linearGradient>
          <linearGradient id="mesa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4B3F33" />
            <stop offset="1" stopColor="#201A14" />
          </linearGradient>
          <radialGradient id="luzMesa" cx="0.5" cy="0.2" r="0.7">
            <stop offset="0" stopColor="#FFE9BE" stopOpacity={0.3} />
            <stop offset="1" stopColor="#FFE9BE" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* janela da guarita, chuva e portão desfocados */}
        <rect width={1080} height={880} fill="#23262E" />
        <rect x={110} y={60} width={860} height={700} fill="url(#vidroG)" />
        <g style={{ filter: "blur(5px)" }}>
          <rect x={110} y={540} width={860} height={220} fill="#2C3440" />
          {new Array(9).fill(0).map((_, i) => (
            <rect key={i} x={140 + i * 96} y={380} width={16} height={360} fill="#171B22" />
          ))}
          <rect x={120} y={420} width={840} height={16} fill="#171B22" />
          <circle cx={780} cy={210} r={40} fill="#FFE3AA" />
          <circle cx={780} cy={210} r={120} fill="#FFE3AA" opacity={0.2} />
        </g>
        {new Array(30).fill(0).map((_, i) => {
          const r = (s: string) => random(`gotaG${i}${s}`);
          const yy = 60 + (((tg * (60 + r("v") * 140) + r("y") * 700) % 700) + 700) % 700;
          return <ellipse key={i} cx={120 + r("x") * 840} cy={yy} rx={3 + r("r") * 4} ry={6 + r("r") * 11} fill="#CFE0F4" opacity={0.32} />;
        })}
        <rect x={100} y={50} width={880} height={22} fill="#0F1116" />
        <rect x={100} y={752} width={880} height={22} fill="#0F1116" />
        <rect x={530} y={60} width={20} height={700} fill="#0F1116" />
        {/* quadro de chaves */}
        <rect x={-10} y={120} width={100} height={420} fill="#4E3F2E" />
        {[180, 260, 340, 420].map((y) => (
          <g key={y}>
            <circle cx={40} cy={y} r={7} fill="#B8B8B0" />
            <rect x={34} y={y + 6} width={13} height={44} rx={4} fill="#C9A227" />
          </g>
        ))}
        {/* monitor da portaria */}
        <g transform="translate(792 830)">
          <rect x={-168} y={-150} width={336} height={250} rx={14} fill="#15171C" />
          <rect x={-148} y={-132} width={296} height={196} fill="#1D2B33" />
          <rect x={-148} y={-30} width={296} height={94} fill="#2B3A40" />
          {new Array(7).fill(0).map((_, i) => (
            <rect key={i} x={-130 + i * 44} y={-104} width={7} height={120} fill="#0E171C" />
          ))}
          <text x={-136} y={46} fontFamily={FONTE} fontWeight={800} fontSize={38} fill="#D7F5E6">
            CAM 4 · 03:17
          </text>
          {new Array(9).fill(0).map((_, i) => (
            <rect key={`l${i}`} x={-148} y={-132 + i * 22} width={296} height={2} fill="#000" opacity={0.25} />
          ))}
        </g>
        {/* mesa */}
        <polygon points="-80,1920 1160,1920 980,860 100,860" fill="url(#mesa)" />
        <polygon points="-80,1920 1160,1920 980,860 100,860" fill="url(#luzMesa)" />
        <rect x={100} y={852} width={880} height={12} fill="#6F5F4B" />
        {/* quepe, crachá, livro e café */}
        <g transform="translate(250 960)">
          <ellipse cx={0} cy={48} rx={140} ry={30} fill="#000" opacity={0.3} />
          <path d="M -110 30 Q -100 -70 0 -76 Q 100 -70 110 30 Z" fill="#26324F" />
          <rect x={-116} y={18} width={232} height={24} rx={6} fill="#14141A" />
          <path d="M -100 40 Q 0 90 100 40 L 112 54 Q 0 108 -112 54 Z" fill="#0F0F14" />
          <circle cx={0} cy={-24} r={18} fill="#FFC83D" />
        </g>
        <g transform="translate(860 1120) rotate(10)">
          <rect x={-86} y={-66} width={172} height={132} rx={10} fill="#F2F2EC" />
          <rect x={-86} y={-66} width={172} height={36} rx={10} fill="#2C4A7A" />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={48} fill="#141622">
            EDSON
          </text>
          <text x={0} y={50} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={24} fill="#55585F">
            PORTARIA
          </text>
        </g>
        <g transform="translate(180 1240) rotate(-9)">
          <rect x={-120} y={-92} width={240} height={184} rx={8} fill="#26324F" />
          <rect x={-104} y={-92} width={210} height={184} fill="#E4DDCA" />
          <text x={0} y={-46} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={28} fill="#26324F">
            OCORRÊNCIAS
          </text>
          {[-18, 10, 38, 66].map((y) => (
            <rect key={y} x={-90} y={y} width={180} height={4} fill="#8A8A86" />
          ))}
        </g>
        <g transform="translate(920 1400)">
          <ellipse cx={0} cy={82} rx={94} ry={20} fill="#000" opacity={0.35} />
          <path d="M -70 -60 L 70 -60 L 56 82 L -56 82 Z" fill="#E8E2D2" />
          <ellipse cx={0} cy={-60} rx={70} ry={18} fill="#CFC8B4" />
          <ellipse cx={0} cy={-58} rx={60} ry={13} fill="#3A2415" />
        </g>
      </Tela>
      {/* contrato: papel em perspectiva de verdade */}
      <div style={{ position: "absolute", left: 200, top: 900 + empurra, width: 640, height: 920, perspective: 1800, transformStyle: "preserve-3d" }}>
        <div style={{ width: "100%", height: "100%", background: "#ECE6D6", transform: "rotateX(32deg)", transformOrigin: "50% 100%", boxShadow: "0 26px 50px rgba(0,0,0,0.6)", padding: "26px 38px", boxSizing: "border-box", fontFamily: FONTE, color: "#191B22" }}>
          <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 1, textAlign: "center", borderBottom: "5px solid #191B22", paddingBottom: 8 }}>DEP. DE EVENTOS ATMOSFÉRICOS</div>
          <div style={{ fontWeight: 800, fontSize: 56, textAlign: "center", marginTop: 12 }}>CONTRATO</div>
          <div style={{ fontWeight: 700, fontSize: 30, marginTop: 10, color: "#4C4F56", lineHeight: 1.1 }}>LOCALIZAR E ENTREGAR OS SEGUINTES NOMES:</div>
          {LINHAS.map((n) => (
            <div key={n} style={{ fontWeight: 800, fontSize: 64, lineHeight: 1.1, borderBottom: "2px solid #BEB8A6" }}>
              {n}
            </div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 30, marginTop: 14, color: "#4C4F56" }}>ASSINATURA</div>
          <div style={{ height: 60, borderBottom: "4px solid #191B22" }} />
        </div>
      </div>
      <Tela>
        {/* assinatura */}
        {risca > 0 && <path d="M 510 1560 q 40 -60 60 0 t 60 -10 t 60 8 t 60 -14 t 60 6 t 70 -12" stroke="#1C2C6A" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={520} strokeDashoffset={520 * (1 - risca)} />}
        {/* mão do agente empurrando o papel */}
        <g transform={`translate(${empurra * 5} 0)`}>
          <Mao id="ag" x={1000} y={930} rot={-112} e={0.92} pele="#C89A72" sombra="#A97D58" manga="#14151B" punho="#DAD8D0" dobra={40} />
        </g>
        {/* a mão do Seu Edson com a caneta: fantasma quando ele fala em atravessar */}
        <g transform={`translate(0 ${fantasma * 36 + Math.sin(tg * 1.3) * 5})`} opacity={fantasma ? 0.46 : 1}>
          <g transform={`translate(${px} ${py})`}>
            <polygon points="-8,0 8,0 4,-26 -4,-26" fill="#1E2A5E" />
            <rect x={-10} y={-210} width={20} height={186} rx={7} fill="#1E2A5E" transform="rotate(8)" />
          </g>
          <Mao id="ed" x={px + 118} y={py + 134} rot={10} e={0.9} pele="#C58A62" sombra="#A9704B" manga="#9CC3E4" dobra={90} />
          {fantasma === 1 && <ellipse cx={px + 90} cy={py + 60} rx={260} ry={300} fill={COR.aurora} opacity={0.16} style={{ filter: "blur(30px)" }} />}
        </g>
      </Tela>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,6,12,0.46) 0%, rgba(4,6,12,0) 24%, rgba(4,6,12,0) 82%, rgba(4,6,12,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

