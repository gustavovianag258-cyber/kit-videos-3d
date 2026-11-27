import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Rotulo } from "../aurora/cenas2";
import { clamp, COR, FONTE } from "../aurora/estilo";
import { Flash } from "../aurora-ep3/efeitos";
import { cabecaMoto, Piloto } from "./atos";
import { Feixe, Gente, MaoOssos } from "./corpo";
import { Quarto, RuaFundo } from "./fundos";
import { CABECA_Y, Janela, Kaique } from "./pessoa";

// A física do ep. 4 em cenas de verdade, não em quadro-negro (pedido do usuário em 06/11/2026:
// "mais dinamismo, mais realismo"). Luz batendo e voltando no quarto dele, raio-x atravessando
// tudo, o olho como lanterna que revela o que tem dentro da parede, a esteira de scanner, o
// dentista e o dia inteiro passando com o raio-x ligado.

const suave = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const Tela: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {children}
  </svg>
);
const Zoom: React.FC<{ z: number; ox: number; oy: number; children: React.ReactNode }> = ({ z, ox, oy, children }) => (
  <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${ox}px ${oy}px`, overflow: "hidden" }}>{children}</AbsoluteFill>
);

// partículas de luz correndo de um ponto a outro
const Fotons: React.FC<{ t: number; x1: number; y1: number; x2: number; y2: number; n?: number; cor: string; v?: number; r?: number; op?: number }> = ({ t, x1, y1, x2, y2, n = 9, cor, v = 0.9, r = 9, op = 1 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return (
    <g opacity={op}>
      {new Array(n).fill(0).map((_, i) => {
        const k = (t * v + i / n) % 1;
        const px = x1 + dx * k;
        const py = y1 + dy * k;
        return (
          <g key={i}>
            <line x1={px - dx * 0.05} y1={py - dy * 0.05} x2={px} y2={py} stroke={cor} strokeWidth={r * 0.9} strokeLinecap="round" opacity={0.45} />
            <circle cx={px} cy={py} r={r * 2.1} fill={cor} opacity={0.25} />
            <circle cx={px} cy={py} r={r} fill="#fff" />
          </g>
        );
      })}
    </g>
  );
};

// olho de gente, em close
const Olho: React.FC<{ x: number; y: number; e?: number; pupila?: number; olhar?: number }> = ({ x, y, e = 1, pupila = 1, olhar = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={0} rx={250} ry={165} fill="#9A6240" />
    <ellipse cx={0} cy={0} rx={250} ry={165} fill="rgba(0,0,0,0.12)" />
    <path d="M -190 8 Q 0 -128 190 8 Q 0 118 -190 8 Z" fill="#F7F3EA" />
    <clipPath id="olhoFis">
      <path d="M -190 8 Q 0 -128 190 8 Q 0 118 -190 8 Z" />
    </clipPath>
    <g clipPath="url(#olhoFis)">
      <circle cx={olhar * 60} cy={2} r={78} fill="#5A3A22" />
      <circle cx={olhar * 60} cy={2} r={78} fill="none" stroke="#2F1E12" strokeWidth={8} />
      <circle cx={olhar * 60} cy={2} r={32 * pupila} fill="#0F0A08" />
      <circle cx={olhar * 60 + 22} cy={-22} r={12} fill="#fff" opacity={0.9} />
    </g>
    <path d="M -196 10 Q 0 -134 196 10" stroke="#2A1A12" strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -190 -112 Q 0 -196 196 -92" stroke="#17120F" strokeWidth={26} fill="none" strokeLinecap="round" />
  </g>
);

// a mochila de entrega, no chão do quarto
const Mochila: React.FC<{ x: number; y: number; op?: number; dentro?: boolean }> = ({ x, y, op = 1, dentro }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={6} rx={190} ry={18} fill="rgba(0,0,0,0.3)" />
    {dentro && (
      <g>
        <rect x={-110} y={-210} width={220} height={36} rx={5} fill="#7A8C96" />
        <rect x={-110} y={-160} width={220} height={36} rx={5} fill="#7A8C96" />
        <rect x={-96} y={-104} width={70} height={96} rx={8} fill="#7A8C96" />
      </g>
    )}
    <g opacity={op}>
      <rect x={-165} y={-310} width={330} height={310} rx={22} fill="#1FA6A0" />
      <rect x={-165} y={-310} width={330} height={70} rx={22} fill="#178A85" />
      <rect x={-96} y={-200} width={192} height={18} rx={8} fill="#E8FFFD" opacity={0.65} />
      <path d="M -165 -310 L 165 0" stroke="rgba(255,255,255,0.05)" strokeWidth={90} />
    </g>
    {dentro && <rect x={-165} y={-310} width={330} height={310} rx={22} fill="none" stroke={COR.aurora} strokeWidth={6} />}
  </g>
);

type W = { atravessa: number; jogar: number; osso: number; metal: number; chumbo: number; dentista: number; fracao: number; dele: number; lanterna: number };

export const CenaFisica: React.FC<{ t: number; w: W; fala: Janela[] }> = ({ t, w, fala }) => {
  // ---------- "o olho só vê luz que bate e volta" ----------
  if (t < w.atravessa) {
    return (
      <Zoom z={1.03 + t * 0.012} ox={540} oy={1000}>
        <Quarto t={t} blur={7} />
        <AbsoluteFill style={{ background: "rgba(25,18,45,0.2)" }} />
        <Tela>
          <Mochila x={590} y={1520} />
          <Fotons t={t} x1={815} y1={560} x2={620} y2={1210} cor="#FFE27A" v={0.8} />
          <Fotons t={t + 0.5} x1={560} y1={1210} x2={300} y2={790} cor="#FFE27A" v={0.8} op={suave(t, 0.5, 1, 0, 1)} />
          <Olho x={270} y={640} e={0.82} pupila={suave(t, 1, 2, 1.25, 0.8)} olhar={0.35} />
        </Tela>
        <Rotulo x={590} y={330} texto="SÓ QUE A FÍSICA COBRA" tam={70} cor={COR.amarelo} op={interpolate(t, [0.1, 0.3, 1.5, 1.8], [0, 1, 1, 0], clamp)} />
      </Zoom>
    );
  }
  // ---------- "raio-x atravessa tudo" ----------
  if (t < w.jogar) {
    const tf = t - w.atravessa;
    return (
      <Zoom z={1.05 + t * 0.012} ox={540} oy={1000}>
        <Quarto t={t} blur={7} />
        <AbsoluteFill style={{ background: "rgba(5,30,28,0.55)" }} />
        <Tela>
          <Mochila x={590} y={1520} op={0.28} dentro />
          {[0, 1, 2].map((i) => (
            <Fotons key={i} t={t + i * 0.3} x1={1140} y1={930 + i * 130} x2={-60} y2={1290 + i * 130} n={7} cor={COR.aurora} v={0.85} />
          ))}
          <Olho x={270} y={640} e={0.82} pupila={1.25} olhar={Math.sin(tf * 2.4) * 0.8} />
        </Tela>
        <Rotulo x={590} y={1730} texto="NÃO VOLTA PRO OLHO" tam={58} op={suave(tf, 0.4, 0.7, 0, 1)} />
      </Zoom>
    );
  }
  // ---------- "pra enxergar, precisa jogar raio-x, igual lanterna" ----------
  if (t < w.osso) {
    const tf = t - w.jogar;
    const cx = 725 + Math.sin(tf * 1.05 - 0.6) * 120;
    const cy = 760 + Math.sin(tf * 1.6 + 0.5) * 150;
    const R = 230;
    const KX = 250;
    const hy = 1650 - CABECA_Y * 0.95;
    const dx = cx - KX;
    const dy = cy - hy;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const liga = suave(tf, 0, 0.35, 0, 1);
    return (
      <AbsoluteFill>
        <Quarto t={t} blur={2} />
        <Tela>
          <defs>
            <mask id="furo">
              <rect width={1080} height={1920} fill="#fff" />
              <circle cx={cx} cy={cy} r={R * liga} fill="#000" />
            </mask>
            <clipPath id="circulo">
              <circle cx={cx} cy={cy} r={R * liga} />
            </clipPath>
          </defs>
          {/* quarto às escuras, só o círculo da lanterna mostra a parede por dentro */}
          <rect width={1080} height={1920} fill="#07090F" opacity={0.86} mask="url(#furo)" />
          <g clipPath="url(#circulo)">
            <rect width={1080} height={1920} fill="#0C352A" />
            {new Array(30).fill(0).map((_, j) =>
              new Array(10).fill(0).map((__, i) => <rect key={`${j}${i}`} x={i * 150 - (j % 2) * 75 + 4} y={j * 62 + 4} width={142} height={54} rx={4} fill="#124536" stroke="#2F8A6C" strokeWidth={2} />),
            )}
            {/* cano, fio e prego dentro da parede */}
            <rect x={0} y={640} width={1080} height={46} fill="#D7E9E2" />
            <rect x={0} y={650} width={1080} height={10} fill="#fff" opacity={0.7} />
            <rect x={760} y={640} width={46} height={700} fill="#D7E9E2" />
            <path d="M 0 900 C 300 860 520 960 760 900 S 980 860 1080 910" stroke="#F4F7F2" strokeWidth={9} fill="none" />
            <path d="M 0 930 C 300 890 520 990 760 930 S 980 890 1080 940" stroke="#BFD6CC" strokeWidth={7} fill="none" />
            {/* um ratinho morando na parede */}
            <g transform={`translate(${520 + ((tf * 90) % 500)} 810)`} stroke="#F4F7F2" strokeWidth={5} fill="none" strokeLinecap="round">
              <path d="M -46 0 L 34 0" />
              {[-34, -20, -6, 8, 22].map((rx) => (
                <path key={rx} d={`M ${rx} 0 q 3 -16 0 -28`} strokeWidth={4} />
              ))}
              <circle cx={48} cy={-8} r={15} fill="#F4F7F2" />
              <path d={`M -46 0 q -40 ${Math.sin(tf * 7) * 16} -70 -6`} />
              <path d={`M -28 0 l ${Math.sin(tf * 14) * 8} 18 M 18 0 l ${-Math.sin(tf * 14) * 8} 18`} />
            </g>
          </g>
          <circle cx={cx} cy={cy} r={R * liga} fill="none" stroke={COR.aurora} strokeWidth={6} />
          <Feixe t={t} x={KX + 14} y={hy} ang={ang} comp={dist} abre={R * 0.92} forca={liga * 0.75} id="fl1" />
          <Kaique x={KX} y={1650} escala={0.95} raio={1} olhos="espanto" olha={Math.max(-0.2, dx / dist)} gesto={false} pose={{ cabeca: ang * 0.2 }} />
        </Tela>
      </AbsoluteFill>
    );
  }
  // ---------- "osso e metal barram, chumbo barra tudo": a esteira do scanner ----------
  if (t < w.dentista) {
    const tf = t - w.osso;
    // a esteira anda e dá uma parada em cada objeto, na hora da palavra
    const passo = 560;
    const s = interpolate(t, [w.osso, w.metal - 0.02, w.metal + 0.3, w.chumbo - 0.02, w.chumbo + 0.3, w.dentista], [-40, 0, passo, passo, passo * 2, passo * 2 + 70], { ...clamp, easing: Easing.inOut(Easing.quad) });
    const itens = [
      { x: 540 - s, hw: 170, topo: 910, passa: 0.5, nome: "OSSO" },
      { x: 540 + passo - s, hw: 110, topo: 900, passa: 0, nome: "METAL" },
      { x: 540 + passo * 2 - s, hw: 140, topo: 760, passa: 0, nome: "CHUMBO" },
    ];
    const raios = new Array(19).fill(0).map((_, i) => 40 + i * 55);
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#0A1C24 0%,#0E2A2E 55%,#081318 100%)" }}>
        <Tela>
          {/* emissor em cima */}
          <rect x={0} y={250} width={1080} height={90} fill="#2C343A" />
          <rect x={0} y={330} width={1080} height={10} fill={COR.aurora} opacity={0.8} />
          {raios.map((rx) => {
            const it = itens.find((i) => Math.abs(i.x - rx) < i.hw);
            const fim = it && it.passa === 0 ? it.topo : 1056;
            return (
              <g key={rx}>
                <line x1={rx} y1={340} x2={rx} y2={fim} stroke={COR.aurora} strokeWidth={6} strokeDasharray="26 22" strokeDashoffset={-t * 500} opacity={it && it.passa > 0 ? 0.4 : 0.8} />
                {/* detector embaixo da esteira: acende onde o raio chega */}
                <rect x={rx - 24} y={1090} width={48} height={22} rx={4} fill={it ? (it.passa > 0 ? "#2A8C6C" : "#14181C") : COR.aurora} />
              </g>
            );
          })}
          {/* corpo da máquina, embaixo da esteira */}
          <rect x={0} y={1120} width={1080} height={800} fill="#2C343A" />
          <rect x={0} y={1120} width={1080} height={800} fill="url(#corpoMaq)" />
          <defs>
            <linearGradient id="corpoMaq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={0.07} />
              <stop offset="1" stopColor="#000" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <rect x={90} y={1340} width={900} height={330} rx={22} fill="#1B2228" />
          <rect x={120} y={1370} width={500} height={270} rx={12} fill="#0A1518" />
          {new Array(8).fill(0).map((_, i) => (
            <rect key={i} x={140 + i * 58} y={1590 - (40 + 90 * Math.abs(Math.sin(t * 2.2 + i * 0.8)))} width={40} height={40 + 90 * Math.abs(Math.sin(t * 2.2 + i * 0.8))} rx={5} fill={COR.aurora} opacity={0.75} />
          ))}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={720 + i * 90} cy={1450} r={26} fill={["#C8322B", "#E6B83A", "#3CC48A"][i]} />
          ))}
          <rect x={690} y={1530} width={260} height={46} rx={10} fill="#3A4248" />
          {/* esteira andando */}
          <rect x={0} y={1056} width={1080} height={26} fill="#3A4248" />
          {new Array(16).fill(0).map((_, i) => (
            <rect key={i} x={(((i * 80 - s) % 1280) + 1280) % 1280 - 100} y={1056} width={10} height={26} fill="#22282C" />
          ))}
          {/* mão em raio-x */}
          <MaoOssos x={itens[0].x + 70} y={985} e={0.4} raio={1} rot={90} />
          {/* chaves e moedas */}
          <g transform={`translate(${itens[1].x} 1056)`}>
            <circle cx={-36} cy={-96} r={36} fill="none" stroke="#8A9096" strokeWidth={16} />
            <rect x={-14} y={-104} width={110} height={18} rx={5} fill="#8A9096" />
            <rect x={70} y={-90} width={14} height={26} fill="#8A9096" />
            <rect x={40} y={-90} width={14} height={18} fill="#8A9096" />
            <ellipse cx={-30} cy={-16} rx={52} ry={16} fill="#70767C" />
            <ellipse cx={-30} cy={-30} rx={52} ry={16} fill="#8A9096" />
          </g>
          {/* bloco de chumbo */}
          <g transform={`translate(${itens[2].x} 1056)`}>
            <rect x={-140} y={-296} width={280} height={296} rx={8} fill="#2B2E35" />
            <rect x={-140} y={-296} width={280} height={40} rx={8} fill="#3C4048" />
            <text x={0} y={-132} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={56} fill="#9AA0A8">
              CHUMBO
            </text>
          </g>
        </Tela>
        {itens.map((it, i) => (
          <Rotulo key={i} x={it.x} y={i === 2 ? 660 : 800} texto={it.nome} tam={70} cor={i === 2 ? COR.vermelho : COR.amarelo} />
        ))}
        <Rotulo x={540} y={170} texto="O QUE BARRA O RAIO-X" tam={62} op={suave(tf, 0, 0.25, 0, 1)} />
      </AbsoluteFill>
    );
  }
  // ---------- "raio-x de dentista dura uma fração de segundo" ----------
  if (t < w.dele) {
    const tf = t - w.dentista;
    const hy = 1720 - CABECA_Y * 0.95;
    const dispara = t >= w.fracao && t < w.fracao + 0.14;
    const chapa = suave(t, w.fracao + 0.15, w.fracao + 0.42, 0, 1);
    return (
      <Zoom z={1.5 + tf * 0.06} ox={540} oy={1060}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#DCE9EE 0%,#C5D8DF 75%,#AFC6CE 100%)" }} />
        <Tela>
          {new Array(9).fill(0).map((_, i) => new Array(14).fill(0).map((__, j) => <rect key={`${i}${j}`} x={i * 130} y={j * 130} width={126} height={126} fill="#fff" opacity={(i + j) % 2 ? 0.12 : 0.04} />))}
          <rect x={0} y={1560} width={1080} height={360} fill="#8FA7B0" />
          {/* encosto da cadeira */}
          <rect x={300} y={1010} width={350} height={700} rx={80} fill="#2F7F8C" />
          <rect x={360} y={900} width={230} height={150} rx={50} fill="#2F7F8C" />
          <Gente x={475} y={1720} e={0.95} cor="#E0A83A" pele="#C98B5E" cabelo="#2B1E1A" boca="aberta" olhos="fechado" pose={{ bracoD: 4, bracoE: 4 }} semente="paciente" />
          {/* avental de chumbo no peito do paciente */}
          <rect x={395} y={1160} width={160} height={250} rx={24} fill="#5A6068" />
          {/* braço do aparelho e o cone apontado pro queixo */}
          <path d="M 1120 420 L 800 620 L 760 980" stroke="#7D8C96" strokeWidth={40} fill="none" strokeLinejoin="round" />
          <circle cx={800} cy={620} r={30} fill="#5F6D76" />
          <rect x={690} y={hy - 70} width={160} height={150} rx={16} fill="#E9EEF1" stroke="#7D8C96" strokeWidth={6} />
          <rect x={712} y={hy - 46} width={70} height={26} rx={5} fill="#2A3238" />
          <polygon points={`690,${hy - 40} 585,${hy - 16} 585,${hy + 52} 690,${hy + 76}`} fill="#C9D2D8" stroke="#7D8C96" strokeWidth={6} />
          {dispara && <Feixe t={t} x={585} y={hy + 18} ang={180} comp={70} abre={46} id="dent" />}
          {/* a chapa aparecendo no monitor */}
          <g transform={`translate(${650 + (1 - chapa) * 500} 630) scale(0.82)`} opacity={chapa}>
            <rect x={-200} y={-140} width={400} height={280} rx={14} fill="#1B2228" />
            <rect x={-186} y={-126} width={372} height={252} rx={8} fill="#0A1518" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`translate(${-140 + i * 56} -14)`}>
                <rect x={-22} y={-34} width={44} height={52} rx={10} fill="#E8E4D8" />
                <path d="M -14 16 L -8 70 L 2 18 L 10 70 L 16 16 Z" fill="#CFCABA" />
              </g>
            ))}
          </g>
        </Tela>
        <Flash t={t - w.fracao} forca={0.45} cor="#B8FFE0" />
      </Zoom>
    );
  }
  // ---------- "o dele ia ficar ligado o dia todo": o dia passa inteiro em segundos ----------
  if (t < w.lanterna) {
    const tf = t - w.dele;
    const k = Math.min(1, tf / Math.max(0.1, w.lanterna - w.dele - 0.1));
    const MX = 470;
    const MY = 1590;
    const [hx, hy] = cabecaMoto(MX, MY, 1.2);
    const sx = -60 + k * 1200;
    const sy = 560 - Math.sin(k * Math.PI) * 400;
    const giro = tf * 1100;
    return (
      <AbsoluteFill>
        <RuaFundo t={t} pan={t * 1500} transito={false} gente={false} />
        <AbsoluteFill style={{ background: "#FF8A3C", opacity: interpolate(k, [0.3, 0.65, 0.85], [0, 0.32, 0], clamp), mixBlendMode: "multiply" }} />
        <AbsoluteFill style={{ background: "#141A4C", opacity: interpolate(k, [0.6, 1], [0, 0.72], clamp), mixBlendMode: "multiply" }} />
        <Tela>
          <circle cx={sx} cy={sy} r={110} fill="#FFE9A8" opacity={0.3} />
          <circle cx={sx} cy={sy} r={66} fill="#FFF3C4" />
          <Feixe t={t} x={hx + 14} y={hy} ang={-6} comp={800} abre={110} forca={0.9} id="dia" />
          <Piloto x={MX} y={MY} e={1.2} v={1500} t={t} raio={1} olha={0.8} />
          {/* relógio correndo */}
          <g transform="translate(540 300)">
            <circle r={104} fill="#F4F0E6" stroke="#2A2230" strokeWidth={10} />
            {new Array(12).fill(0).map((_, i) => (
              <rect key={i} x={-3} y={-92} width={6} height={16} fill="#2A2230" transform={`rotate(${i * 30})`} />
            ))}
            <rect x={-5} y={-54} width={10} height={58} rx={5} fill="#2A2230" transform={`rotate(${giro / 12})`} />
            <rect x={-3} y={-84} width={6} height={88} rx={3} fill={COR.vermelho} transform={`rotate(${giro})`} />
            <circle r={9} fill="#2A2230" />
          </g>
        </Tela>
      </AbsoluteFill>
    );
  }
  // ---------- "então eu sou uma lanterna de raio-x?" ----------
  const tf = t - w.lanterna;
  const hy = 1640 - CABECA_Y * 0.95;
  return (
    <Zoom z={1.36 + tf * 0.04} ox={540} oy={1050}>
      <Quarto t={t} clarao={0.3} frente={<>
        <Feixe t={t} x={554} y={hy} ang={-3 + Math.sin(t * 1.2) * 5} comp={800} abre={110} forca={0.8} id="fin" />
        <Kaique x={540} y={1640} escala={0.95} raio={1} olhos="espanto" t={t} fala={fala} olha={0.3} />
      </>} />
    </Zoom>
  );
};
