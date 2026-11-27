import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Aurora, Estrelas } from "../aurora/cenas";
import { Camada, COR, FONTE } from "../aurora/estilo";
import { Calendario, Cama, CriadoMudo, Planta, Poster, Prateleira, Quadro, RoupaNoChao, Tapete, Televisao, Tenis, Ventilador } from "../aurora/objetos";
import { Antena, Arvore, Cachorro, Lixeira } from "../aurora-ep2/objetos";
import { Fios, Poste, RelogioParede } from "../aurora-ep3/objetos";
import { Esqueleto } from "./corpo";
import { Balanca, Folhas, Passantes, Passaros, PipaNoCeu, Transito, Varal } from "./vida";

// Cenários do ep. 4: rua do bairro (com `pan` pra câmera seguir a moto), bloco de apartamentos,
// moto, quarto e fachada da padaria. Tudo vivo: ver vida.tsx.

const mod = (a: number, n: number) => ((a % n) + n) % n;

// ---------- rua ----------
const Casa: React.FC<{ x: number; base: number; l: number; a: number; parede: string; telha: string; grade?: boolean; seed?: number; escuro?: number }> = ({ x, base, l, a, parede, telha, grade, seed = 0, escuro = 0 }) => (
  <g>
    <rect x={x} y={base - a} width={l} height={a} fill={parede} />
    <rect x={x} y={base - a} width={l} height={a} fill="url(#luzcasa)" />
    <polygon points={`${x - 14},${base - a} ${x + l / 2},${base - a - 96} ${x + l + 14},${base - a}`} fill={telha} />
    {new Array(5).fill(0).map((_, i) => (
      <line key={i} x1={x - 14 + i * 10} y1={base - a - i * 18} x2={x + l + 14 - i * 10} y2={base - a - i * 18} stroke="rgba(0,0,0,0.18)" strokeWidth={3} />
    ))}
    <rect x={x - 16} y={base - a - 4} width={l + 32} height={14} fill="rgba(0,0,0,0.25)" />
    {seed % 2 === 0 && (
      <g>
        <rect x={x + l * 0.62} y={base - a - 150} width={58} height={50} rx={8} fill="#2F7FB3" />
        <rect x={x + l * 0.62 - 4} y={base - a - 158} width={66} height={12} rx={5} fill="#256A97" />
      </g>
    )}
    <rect x={x + 26} y={base - a + 40} width={l * 0.34} height={100} fill="#F4ECDD" />
    <rect x={x + 32} y={base - a + 46} width={l * 0.34 - 12} height={88} fill={escuro ? "#FFD27A" : "#6F8FB0"} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x + 32} y={base - a + 52 + i * 20} width={l * 0.34 - 12} height={5} fill="rgba(0,0,0,0.18)" />
    ))}
    <rect x={x + l * 0.58} y={base - 190} width={l * 0.28} height={190} fill="#7A4E34" />
    <rect x={x + l * 0.58} y={base - 190} width={l * 0.28} height={190} fill="url(#luzcasa)" />
    <circle cx={x + l * 0.58 + l * 0.2} cy={base - 96} r={6} fill="#D9C27A" />
    {grade && (
      <g>
        <rect x={x + 14} y={base - 150} width={l * 0.4} height={150} fill="none" stroke="#2A2A30" strokeWidth={6} />
        {new Array(6).fill(0).map((_, i) => (
          <line key={i} x1={x + 14 + (i + 1) * ((l * 0.4) / 7)} y1={base - 150} x2={x + 14 + (i + 1) * ((l * 0.4) / 7)} y2={base} stroke="#2A2A30" strokeWidth={5} />
        ))}
      </g>
    )}
    <ellipse cx={x + l * 0.2} cy={base - a + 24} rx={34} ry={14} fill="rgba(0,0,0,0.08)" />
    <rect x={x + 10} y={base - 16} width={l - 20} height={16} fill="rgba(0,0,0,0.16)" />
  </g>
);

// repete o conteúdo duas vezes pra rua "não acabar" quando a câmera anda
const Rep: React.FC<{ off: number; children: React.ReactNode }> = ({ off, children }) => (
  <>
    <g transform={`translate(${off} 0)`}>{children}</g>
    <g transform={`translate(${off + 1080} 0)`}>{children}</g>
  </>
);

// Rua com profundidade de verdade, igual à referência: casas do outro lado, longe e desfocadas;
// a rua no meio, com os carros em tamanho real passando; e a calçada de cá, onde as pessoas ficam,
// todas do mesmo tamanho. Quando a cena é colada num prédio (`perto`), ele cobre o fundo todo.
// Rua com profundidade de verdade, igual à referência: casas do outro lado, longe e desfocadas;
// a rua no meio, com os carros em tamanho real passando; e a calçada de cá, onde as pessoas ficam,
// todas do mesmo tamanho. Quando a cena é colada num prédio (`perto`), ele cobre o fundo todo.
export const RuaFundo: React.FC<{
  t: number;
  noite?: boolean;
  tarde?: boolean;
  children?: React.ReactNode; // construções do outro lado da rua
  perto?: React.ReactNode; // construção colada na calçada de cá
  ruaFrente?: boolean; // com `perto`: mostra a rua embaixo, na frente da calçada
  frente?: React.ReactNode;
  pan?: number; // quanto a câmera já andou pra direita (px)
  transito?: boolean;
  gente?: boolean;
  raioGente?: number;
  semPoste?: boolean;
  semAurora?: boolean; // noite comum, depois da Noite da Aurora
}> = ({ t, noite, tarde, children, perto, ruaFrente, frente, pan = 0, transito = true, gente = true, raioGente = 0, semPoste, semAurora }) => {
  const tg = useCurrentFrame() / 30;
  const par = noite ? ["#3A3354", "#4A4468", "#3F3A5E"] : tarde ? ["#D9A98A", "#C9998A", "#E0B890"] : ["#EAD7B0", "#E9C9A8", "#D8C2A8"];
  const telha = noite ? "#5A3A44" : "#B8553A";
  const longe = noite ? "#2A2444" : tarde ? "#A6849A" : "#B4A8B8";
  const off = (k: number) => -mod(pan * k, 1080);
  const piso = noite ? "#5E5A6C" : "#E2DCCF";
  const desenho = noite ? "#535062" : "#CFC8B8";
  return (
    <>
      <AbsoluteFill
        style={{
          background: noite
            ? "linear-gradient(180deg,#070B1E 0%,#1A1640 50%,#3F2D57 100%)"
            : tarde
              ? "linear-gradient(180deg,#4A5A94 0%,#C58AA0 42%,#F4B070 62%,#F8D09A 72%)"
              : "linear-gradient(180deg,#8FB0D8 0%,#C8D2E0 40%,#F0E2CC 62%)",
        }}
      >
        {noite && (
          <>
            <Estrelas altura={900} />
            {!semAurora && <Aurora altura={1000} />}
          </>
        )}
        {!noite && (
          <svg width={1080} height={1000} style={{ position: "absolute", opacity: 0.7 }}>
            {[
              [160, 180, 1],
              [620, 110, 1.3],
              [880, 280, 0.8],
            ].map(([cx, cy, e], i) => (
              <g key={i} transform={`translate(${mod(cx + tg * (12 + i * 5) - pan * 0.03, 1400) - 160} ${cy}) scale(${e})`}>
                <ellipse cx={0} cy={0} rx={120} ry={32} fill="#fff" />
                <ellipse cx={60} cy={-16} rx={70} ry={28} fill="#fff" />
                <ellipse cx={-60} cy={-12} rx={60} ry={24} fill="#fff" />
              </g>
            ))}
            <Passaros y={330} />
            <PipaNoCeu x={820} y={300} />
          </svg>
        )}
      </AbsoluteFill>
      <Camada blur={10}>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="luzcasa" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={noite ? 0.04 : 0.18} />
              <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
              <stop offset="1" stopColor="#000" stopOpacity={noite ? 0.3 : 0.2} />
            </linearGradient>
          </defs>
          <path d="M 0 860 Q 200 760 420 830 Q 640 740 860 820 Q 980 780 1080 840 L 1080 1200 L 0 1200 Z" fill={noite ? "#1C1838" : "#94A4B0"} opacity={0.7} />
          <Rep off={off(0.12)}>
            {[
              [-60, 280, 330],
              [250, 260, 280],
              [520, 300, 360],
              [830, 290, 310],
            ].map(([x, l, a], i) => (
              <Casa key={i} x={x} base={1060} l={l} a={a} parede={longe} telha={noite ? "#3A2A44" : "#9A6E7A"} seed={i} />
            ))}
          </Rep>
        </svg>
      </Camada>
      <Camada blur={3}>
        <svg width={1080} height={1920}>
          <g transform="translate(0 1150) scale(1.45) translate(0 -1500)">
            <Rep off={off(0.3)}>
              {[
                [-120, 420, 560, 0],
                [330, 350, 470, 1],
                [720, 440, 610, 2],
              ].map(([x, l, a, i]) => (
                <Casa key={i} x={x} base={1500} l={l} a={a} parede={par[i % 3]} telha={telha} grade={i !== 1} seed={i} escuro={noite ? 1 : 0} />
              ))}
              <Antena x={420} y={940} e={0.8} />
              <Varal x1={20} y1={1190} x2={300} y2={1214} />
              <Balanca x={690} y={1500} forca={1.2} fase={1}>
                <Arvore x={690} y={1500} e={0.9} cor={noite ? "#2E4A30" : "#5E9654"} />
              </Balanca>
            </Rep>
          </g>
          <Fios y={190 + Math.sin(tg * 0.9) * 2} />
          <Fios y={260 + Math.sin(tg * 0.7 + 1) * 2} />
          {children}
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="chaoRua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={noite ? "#2B2838" : "#6A6C76"} />
            <stop offset="1" stopColor={noite ? "#1B1A24" : "#494B55"} />
          </linearGradient>
          <linearGradient id="chaoPerto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.05} />
            <stop offset="1" stopColor="#000" stopOpacity={0.2} />
          </linearGradient>
          <pattern id="mosaico" width={132} height={66} patternUnits="userSpaceOnUse" patternTransform={`translate(${-mod(pan, 132)} 0)`}>
            <rect width={132} height={66} fill={piso} />
            <path d="M 0 33 Q 33 4 66 33 T 132 33" stroke={desenho} strokeWidth={13} fill="none" />
          </pattern>
        </defs>
        {/* calçada de lá */}
        <rect x={0} y={1150} width={1080} height={84} fill={piso} />
        <rect x={0} y={1150} width={1080} height={84} fill="rgba(0,0,0,0.05)" />
        <rect x={0} y={1234} width={1080} height={12} fill={noite ? "#4A4658" : "#B4AEA2"} />
        {/* a rua */}
        <rect x={0} y={1246} width={1080} height={322} fill="url(#chaoRua)" />
        <Rep off={off(0.9)}>
          {[0, 1, 2].map((i) => (
            <polygon key={i} points={`${70 + i * 360},1392 ${230 + i * 360},1392 ${252 + i * 360},1408 ${48 + i * 360},1408`} fill="#EDE7CE" opacity={0.85} />
          ))}
        </Rep>
      </svg>
      {transito && <Transito pista={0} noite={noite} />}
      {transito && <Transito pista={1} noite={noite} />}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* calçada de cá */}
        <rect x={0} y={1568} width={1080} height={352} fill="url(#mosaico)" />
        <rect x={0} y={1568} width={1080} height={352} fill="url(#chaoPerto)" />
        <rect x={0} y={1556} width={1080} height={16} fill={noite ? "#6E697E" : "#D6D0C4"} />
        <rect x={0} y={1572} width={1080} height={5} fill="rgba(0,0,0,0.14)" />
        <Rep off={off(1)}>
          {!semPoste && (
            <>
              <Balanca x={70} y={1600} forca={1}>
                <Arvore x={70} y={1600} e={2} cor={noite ? "#2E4A30" : "#4E8A43"} />
              </Balanca>
              <Poste x={1010} y={1600} e={1.5} />
              <Lixeira x={850} y={1600} e={1.9} />
            </>
          )}
        </Rep>
        {perto}
        {perto && ruaFrente && (
          <g>
            <rect x={0} y={1740} width={1080} height={180} fill="url(#chaoRua)" />
            <rect x={0} y={1728} width={1080} height={14} fill={noite ? "#6E697E" : "#D6D0C4"} />
          </g>
        )}
        {gente && <Passantes raio={raioGente} noite={noite} />}
        {gente && (
          <g transform={`translate(${mod(tg * 150 - pan, 1600) - 260} 0)`}>
            <Cachorro x={0} y={1625} e={1.5} t={t} />
          </g>
        )}
      </svg>
      {!noite && <Folhas n={4} />}
      {frente}
    </>
  );
};

// ---------- bloco de apartamentos ----------
export const Bloco: React.FC<{ x: number; y: number; e?: number; raio: number; t?: number }> = ({ x, y, e = 1, raio, t = 0 }) => {
  const cols = 3;
  const lin = 4;
  const jan = (c: number, l: number) => ({ jx: 50 + c * 170, jy: -740 + l * 190 });
  const tem = [true, false, true, true, false, true, false, true, true, true, false, true];
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <rect x={0} y={-820} width={560} height={820} fill="#C9B79A" />
      <rect x={0} y={-820} width={560} height={820} fill="url(#luzcasa)" />
      <rect x={0} y={-840} width={560} height={30} fill="#9A8A70" />
      <rect x={0} y={-60} width={560} height={60} fill="#8A7A62" />
      <rect x={230} y={-170} width={100} height={170} rx={6} fill="#3B3F4A" />
      {new Array(lin).fill(0).map((_, l) =>
        new Array(cols).fill(0).map((__, c) => {
          const { jx, jy } = jan(c, l);
          const i = l * cols + c;
          return (
            <g key={`${l}${c}`}>
              <rect x={jx - 8} y={jy - 8} width={136} height={156} rx={6} fill="#6E5C46" />
              <rect x={jx} y={jy} width={120} height={140} fill={tem[i] ? "#FFE3A0" : "#4A5A7A"} />
              {tem[i] && raio > 0 && (
                <g opacity={raio}>
                  <rect x={jx} y={jy} width={120} height={140} fill="#0E3B2C" opacity={0.7} />
                  <svg x={jx} y={jy} width={120} height={140} viewBox="-60 -170 120 170" overflow="hidden">
                    {/* cada um fazendo uma coisa dentro de casa: andando de um lado pro outro */}
                    <Esqueleto x={Math.sin(t * (1 + i * 0.13) + i) * 30} y={0} e={0.22} anda={i % 2 ? 1.6 : 0} acena={i === 3 ? 1 : 0} semente={i} />
                  </svg>
                </g>
              )}
              <rect x={jx + 58} y={jy} width={4} height={140} fill="#6E5C46" />
              <rect x={jx} y={jy + 140} width={120} height={8} fill="#6E5C46" />
              {(l + c) % 3 === 0 && <rect x={jx - 10} y={jy + 150} width={140} height={20} fill="#5B7C4A" />}
            </g>
          );
        }),
      )}
      <rect x={20} y={-880} width={150} height={100} rx={10} fill="#2F7FB3" />
      <rect x={430} y={-880} width={100} height={60} rx={10} fill="#2F7FB3" />
    </g>
  );
};

// ---------- moto de entrega (`giro` em graus: roda girando) ----------
export const Moto: React.FC<{ x: number; y: number; e?: number; giro?: number }> = ({ x, y, e = 1, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={4} rx={230} ry={14} fill="rgba(0,0,0,0.3)" />
    {[-130, 130].map((wx) => (
      <g key={wx} transform={`translate(${wx} -62) rotate(${giro})`}>
        <circle r={62} fill="#1B1B22" />
        <circle r={30} fill="#9AA0AA" />
        <rect x={-30} y={-3} width={60} height={6} fill="#4A4D58" />
        <rect x={-3} y={-30} width={6} height={60} fill="#4A4D58" />
        <circle r={8} fill="#1B1B22" />
      </g>
    ))}
    <path d="M -130 -62 L -40 -150 L 70 -150 L 130 -62 Z" fill="#B3262C" />
    <path d="M -40 -150 L 70 -150 L 50 -116 L -30 -116 Z" fill="rgba(255,255,255,0.14)" />
    <rect x={-90} y={-176} width={190} height={34} rx={14} fill="#22222A" />
    <path d="M 112 -150 L 140 -250 L 176 -250" stroke="#22222A" strokeWidth={12} fill="none" strokeLinecap="round" />
    <ellipse cx={140} cy={-200} rx={22} ry={16} fill="#FFF0B8" />
    <rect x={-210} y={-300} width={150} height={130} rx={14} fill="#1FA6A0" />
    <rect x={-210} y={-300} width={150} height={34} rx={14} fill="#188884" />
    <rect x={-180} y={-40} width={90} height={14} rx={6} fill="#6A6E78" />
  </g>
);

// ---------- quarto do Kaique ----------
export const Quarto: React.FC<{ t: number; blur?: number; frente?: React.ReactNode; clarao?: number }> = ({ t, blur = 5, frente, clarao = 0 }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ background: "#CDB89A" }}>
      <Camada blur={blur}>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="sombraQuarto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity={0.25} />
              <stop offset="1" stopColor="#000" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="paredeLuz" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#FFF3C8" stopOpacity={0.35} />
              <stop offset="1" stopColor="#000" stopOpacity={0.18} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={1080} height={1500} fill="#D8C7A6" />
          <rect x={0} y={0} width={1080} height={1500} fill="url(#paredeLuz)" />
          <rect x={0} y={1500} width={1080} height={420} fill="#8A6A4E" />
          <rect x={0} y={1490} width={1080} height={16} fill="#6E5238" />
          <rect x={650} y={330} width={330} height={470} rx={10} fill="#6E5C46" />
          <rect x={664} y={344} width={302} height={442} fill="#BFE0F4" />
          <rect x={808} y={344} width={8} height={442} fill="#6E5C46" />
          <rect x={664} y={560} width={302} height={8} fill="#6E5C46" />
          {/* cortina que o vento mexe */}
          {[0, 1].map((i) => (
            <path
              key={i}
              d={`M ${i ? 966 : 664} 344 L ${i ? 880 : 750} 344 Q ${(i ? 880 : 750) + Math.sin(tg * 1.8 + i) * 34} 560 ${(i ? 880 : 750) + Math.sin(tg * 2.3 + i) * 52} 800 L ${i ? 966 : 664} 800 Z`}
              fill="#C05070"
              opacity={0.85}
            />
          ))}
          <polygon points="664,786 966,786 760,1500 100,1500" fill="rgba(255,236,190,0.18)" opacity={0.8 + Math.sin(tg * 0.8) * 0.2} />
          <Poster x={200} y={700} e={1.1} />
          <Quadro x={420} y={640} e={0.8} />
          <RelogioParede x={540} y={300} e={0.9} hora={3} minuto={17} />
          <Prateleira x={60} y={520} e={0.9} />
          <Calendario x={300} y={460} e={0.8} />
          <Ventilador x={880} y={1300} e={0.9} t={t} />
          <Cama x={-460} y={1520} />
          <CriadoMudo x={560} y={1520} e={1.1} />
          <Planta x={960} y={1520} e={0.9} />
          <Tapete x={540} y={1760} e={1.3} />
          <Televisao x={160} y={1520} e={0.9} t={t} />
          <RoupaNoChao x={820} y={1740} e={1.1} />
          <Tenis x={400} y={1820} e={1.2} />
          <Tenis x={470} y={1840} e={1.2} />
          <rect x={0} y={1500} width={1080} height={420} fill="url(#sombraQuarto)" />
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {frente}
      </svg>
      {clarao > 0 && <AbsoluteFill style={{ background: COR.aurora, opacity: clarao * 0.25 }} />}
    </AbsoluteFill>
  );
};

// ---------- fachada da padaria ----------
export const Padaria: React.FC<{ x: number; y: number; e?: number; lambe?: React.ReactNode }> = ({ x, y, e = 1, lambe }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <rect x={0} y={-640} width={760} height={640} fill="#E7D6B2" />
      <rect x={0} y={-640} width={760} height={640} fill="url(#luzcasa)" />
      <rect x={0} y={-700} width={760} height={80} fill="#B3262C" />
      <text x={380} y={-640} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={64} fill="#FFF3D6">
        PADARIA PÃO QUENTE
      </text>
      {/* toldo que balança */}
      <path d={`M 20 -620 L 480 -620 L ${500 + Math.sin(tg * 2) * 6} -560 L ${0 + Math.sin(tg * 2) * 6} -560 Z`} fill="#3C8C6A" />
      {new Array(6).fill(0).map((_, i) => (
        <rect key={i} x={30 + i * 80} y={-620} width={40} height={60} fill="#F4ECDD" opacity={0.75} />
      ))}
      <rect x={40} y={-540} width={400} height={400} fill="#7FB3E8" opacity={0.65} />
      <rect x={40} y={-540} width={400} height={400} fill="none" stroke="#6E5C46" strokeWidth={12} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={70 + i * 120} y={-430 + (i % 2) * 20} width={90} height={50} rx={24} fill="#C98B4E" />
      ))}
      <rect x={500} y={-520} width={200} height={520} fill="#6E4C34" />
      <rect x={520} y={-500} width={160} height={290} fill="#FFE3A0" opacity={0.85} />
      <rect x={40} y={-110} width={420} height={110} fill="#8A6A4E" />
      <text x={470} y={-300} fontFamily={FONTE} fontWeight={800} fontSize={28} fill="#6E5C46" transform="rotate(-90 470 -300)">
        PÃO FRANCÊS
      </text>
      {lambe}
    </g>
  );
};

export const Corrimao: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={0} y={y} width={1080} height={10} fill="#8A8F99" />
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={i * 100 + 20} y={y} width={8} height={70} fill="#8A8F99" />
    ))}
  </g>
);
