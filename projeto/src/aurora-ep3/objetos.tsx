import { random } from "remotion";
import { COR, FONTE } from "../aurora/estilo";
import { Olheiro } from "../aurora/elenco";

// Kit do ep. 3: prédio, guarita, garagem e a casa do Seu Edson (mesmo traço dos kits dos
// eps. 1 e 2: base em (x, y), `e` = escala).

type P = { x: number; y: number; e?: number };
const G: React.FC<P & { children: React.ReactNode; a?: number }> = ({ x, y, e = 1, a = 0, children }) => (
  <g transform={`translate(${x} ${y}) scale(${e}) rotate(${a})`}>{children}</g>
);

// ---------- rua ----------
// Fachada do Condomínio Residencial Jardim Aurora: 4 andares, janelas com grade e varal,
// caixa de ar-condicionado, plantas e roupa estendida. Base no chão em (x, y), largura 640.
export const Predio: React.FC<P & { noite?: boolean }> = ({ noite, ...p }) => {
  const acesa = (i: number) => noite && [1, 4, 6].includes(i);
  return (
    <G {...p}>
      <rect x={-320} y={-1240} width={640} height={1240} fill={noite ? "#4A3E5C" : "#D9C2A0"} />
      <rect x={-336} y={-1262} width={672} height={26} fill={noite ? "#3E3450" : "#C4AC88"} />
      {/* manchas de umidade */}
      <ellipse cx={-240} cy={-1180} rx={40} ry={90} fill="rgba(60,40,20,0.12)" />
      <ellipse cx={250} cy={-700} rx={30} ry={70} fill="rgba(60,40,20,0.1)" />
      {[0, 1, 2, 3].map((andar) =>
        [0, 1].map((k) => {
          const i = andar * 2 + k;
          const x = -270 + k * 320;
          const y = -1180 + andar * 270;
          return (
            <g key={i}>
              <rect x={x} y={y} width={220} height={150} rx={4} fill={acesa(i) ? "#FFD27A" : noite ? "#2A2240" : "#7FA4BE"} />
              <rect x={x - 8} y={y + 150} width={236} height={12} fill={noite ? "#3E3450" : "#B89C78"} />
              {[0, 1, 2, 3, 4].map((g) => (
                <rect key={g} x={x + g * 54} y={y} width={6} height={150} fill="#3A3A40" opacity={0.7} />
              ))}
              {(i === 2 || i === 5) && (
                <g>
                  <path d={`M ${x + 10} ${y + 30} L ${x + 210} ${y + 30}`} stroke="#ddd" strokeWidth={2} />
                  <rect x={x + 30} y={y + 32} width={40} height={50} fill="#E0565B" />
                  <rect x={x + 90} y={y + 32} width={50} height={60} fill="#F4ECDD" />
                  <rect x={x + 150} y={y + 32} width={36} height={46} fill="#2F5DA8" />
                </g>
              )}
              {i === 3 && <rect x={x + 150} y={y + 110} width={80} height={56} rx={6} fill="#E8E8E8" />}
              {i === 4 && (
                <g>
                  <path d={`M ${x + 20} ${y + 150} L ${x + 20} ${y + 120} M ${x + 60} ${y + 150} L ${x + 50} ${y + 110}`} stroke="#4E8A43" strokeWidth={10} />
                  <circle cx={x + 30} cy={y + 110} r={22} fill="#5FA052" />
                </g>
              )}
            </g>
          );
        }),
      )}
      {/* letreiro */}
      <rect x={-200} y={-120} width={400} height={50} rx={6} fill="#2A2230" />
      <text x={0} y={-84} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#F4ECDD">
        COND. RESIDENCIAL JARDIM AURORA
      </text>
    </G>
  );
};

// Portão de garagem em grade de ferro (sobe e desce). `aberto` 0–1.
export const PortaoGrade: React.FC<P & { largura?: number; altura?: number; aberto?: number }> = ({ largura = 420, altura = 360, aberto = 0, ...p }) => (
  <G {...p}>
    <rect x={-largura / 2 - 20} y={-altura - 20} width={largura + 40} height={altura + 20} fill="#2A2A30" />
    <rect x={-largura / 2} y={-altura} width={largura} height={altura} fill="#14141A" />
    <g transform={`translate(0 ${-aberto * altura * 0.85})`}>
      <rect x={-largura / 2} y={-altura} width={largura} height={altura} fill="none" stroke="#5C6068" strokeWidth={10} />
      {new Array(Math.floor(largura / 30)).fill(0).map((_, i) => (
        <rect key={i} x={-largura / 2 + 10 + i * 30} y={-altura} width={7} height={altura} fill="#6B6F78" />
      ))}
      {[0.25, 0.6].map((k) => (
        <rect key={k} x={-largura / 2} y={-altura + altura * k} width={largura} height={10} fill="#6B6F78" />
      ))}
      <rect x={-50} y={-altura * 0.55} width={100} height={60} rx={6} fill="#F2C230" />
      <text x={0} y={-altura * 0.55 + 40} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={22} fill={COR.tinta}>
        SAÍDA DE VEÍCULOS
      </text>
    </g>
  </G>
);

// Guarita vista de fora: vidro, placa PORTARIA, interfone e a luz de dentro.
export const GuaritaFora: React.FC<P & { noite?: boolean; children?: React.ReactNode }> = ({ noite, children, ...p }) => (
  <G {...p}>
    <rect x={-170} y={-420} width={340} height={420} fill={noite ? "#5A4E6A" : "#CDB895"} />
    <rect x={-186} y={-444} width={372} height={30} fill={noite ? "#3E3450" : "#A88E68"} />
    <rect x={-130} y={-360} width={260} height={180} rx={6} fill={noite ? "#FFE3A0" : "#A9CBE0"} />
    <svg x={-130} y={-360} width={260} height={180}>
      {children}
    </svg>
    <rect x={-130} y={-360} width={260} height={180} rx={6} fill="rgba(255,255,255,0.12)" />
    <path d="M -120 -350 L -60 -190" stroke="rgba(255,255,255,0.35)" strokeWidth={8} />
    <rect x={-136} y={-184} width={272} height={14} fill="#8C8F96" />
    <rect x={-90} y={-470} width={180} height={34} rx={6} fill="#2F5DA8" />
    <text x={0} y={-445} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill="#fff">
      PORTARIA
    </text>
    <rect x={186} y={-250} width={40} height={64} rx={8} fill="#3A3C44" />
    <circle cx={206} cy={-230} r={8} fill="#9EA3AB" />
    <rect x={194} y={-208} width={24} height={10} rx={3} fill="#9EA3AB" />
  </G>
);

// Contêiner de lixo de condomínio (verde, com tampa e rodinha).
export const Conteiner: React.FC<P & { tampa?: number }> = ({ tampa = 0, ...p }) => (
  <G {...p}>
    <path d="M -130 -220 L 130 -220 L 116 -20 L -116 -20 Z" fill="#2E7D4F" />
    <rect x={-120} y={-150} width={240} height={14} fill="#25663F" />
    <text x={0} y={-80} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#CDE8D6">
      LIXO
    </text>
    <g transform={`rotate(${-tampa} -140 -228)`}>
      <rect x={-142} y={-244} width={284} height={28} rx={8} fill="#25663F" />
    </g>
    <circle cx={-90} cy={-12} r={16} fill="#1E1E22" />
    <circle cx={90} cy={-12} r={16} fill="#1E1E22" />
  </G>
);

export const SacoLixo: React.FC<P & { cor?: string }> = ({ cor = "#26262C", ...p }) => (
  <G {...p}>
    <path d="M -50 0 Q -64 -70 -20 -96 L 20 -96 Q 64 -70 50 0 Z" fill={cor} />
    <path d="M -14 -96 L -24 -120 M 14 -96 L 26 -122" stroke={cor} strokeWidth={10} strokeLinecap="round" />
    <path d="M -30 -60 Q -10 -40 -20 -10" stroke="rgba(255,255,255,0.12)" strokeWidth={6} fill="none" />
  </G>
);

// Fedor: ondinhas verdes subindo.
export const Fedor: React.FC<P & { t: number }> = ({ t, ...p }) => (
  <G {...p}>
    {[-60, 0, 60].map((dx, i) => {
      const y = -((t * 60 + i * 40) % 160);
      return (
        <path key={i} d={`M ${dx} ${y} q 14 -20 0 -40 q -14 -20 0 -40`} stroke="#9BC45A" strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - -y / 180} />
      );
    })}
  </G>
);

export const Poste: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-12} y={-900} width={24} height={900} fill="#8C8F96" />
    <rect x={-80} y={-880} width={160} height={14} fill="#8C8F96" />
    <path d="M 70 -880 q 20 -30 50 -30" stroke="#8C8F96" strokeWidth={10} fill="none" />
    <ellipse cx={130} cy={-900} rx={34} ry={12} fill="#C9C9C9" />
    <rect x={-40} y={-700} width={80} height={110} rx={8} fill="#5C6068" />
    {/* emaranhado de fios */}
    <path d="M -12 -760 q -40 40 -10 70 q 30 30 -10 60 M 12 -740 q 50 20 20 60 q -20 30 10 50" stroke="#1A1A1E" strokeWidth={6} fill="none" />
  </G>
);

export const Fios: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <path d={`M -20 ${y} Q 540 ${y + 90} 1100 ${y}`} stroke="#1A1A1E" strokeWidth={4} fill="none" />
    <path d={`M -20 ${y + 30} Q 540 ${y + 130} 1100 ${y + 20}`} stroke="#1A1A1E" strokeWidth={3} fill="none" />
    <path d={`M -20 ${y + 60} Q 540 ${y + 150} 1100 ${y + 50}`} stroke="#1A1A1E" strokeWidth={3} fill="none" />
    {/* tênis pendurado no fio */}
    <path d={`M 700 ${y + 74} L 700 ${y + 120} M 730 ${y + 72} L 734 ${y + 110}`} stroke="#ddd" strokeWidth={2} />
    <ellipse cx={700} cy={y + 130} rx={22} ry={12} fill="#F4F1EA" />
    <ellipse cx={736} cy={y + 120} rx={22} ry={12} fill="#F4F1EA" />
  </g>
);

// Lambe-lambe do canal (marca d'água dentro da cena).
export const LambeLambe: React.FC<P & { a?: number }> = ({ a = -3, ...p }) => (
  <G {...p} a={a}>
    <rect x={-120} y={-80} width={240} height={160} fill="#F4ECDD" />
    <rect x={-120} y={-80} width={240} height={46} fill={COR.aurora} />
    <text x={0} y={-48} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill={COR.tinta}>
      MUNDO PARALELO
    </text>
    <text x={0} y={10} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill={COR.tinta}>
      @mundoparalelo.br
    </text>
    <text x={0} y={52} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={22} fill="#7A6A5A">
      E SE CÊ ACORDASSE AMANHÃ…?
    </text>
    <path d="M 90 80 L 120 50 L 120 80 Z" fill="#D8CCB4" />
  </G>
);

// ---------- guarita por dentro ----------
// Monitor de câmera com o relógio. `cena` desenha o que a câmera vê (svg 300x200).
export const Monitor: React.FC<P & { cam: string; hora: string; children?: React.ReactNode }> = ({ cam, hora, children, ...p }) => (
  <G {...p}>
    <rect x={-170} y={-130} width={340} height={250} rx={14} fill="#22232A" />
    <svg x={-150} y={-112} width={300} height={200}>
      <rect width={300} height={200} fill="#2B3A33" />
      {children}
      <rect width={300} height={200} fill="rgba(120,255,180,0.08)" />
      {new Array(25).fill(0).map((_, i) => (
        <rect key={i} x={0} y={i * 8} width={300} height={2} fill="rgba(0,0,0,0.18)" />
      ))}
      <text x={10} y={22} fontFamily="monospace" fontSize={18} fill="#E8FFE8">
        {cam}
      </text>
      <text x={290} y={192} textAnchor="end" fontFamily="monospace" fontSize={18} fill="#E8FFE8">
        {hora}
      </text>
    </svg>
    <rect x={-30} y={120} width={60} height={30} fill="#22232A" />
  </G>
);

// O que as câmeras mostram (miniaturas pro Monitor).
export const CamRua: React.FC<{ olheiro?: number }> = ({ olheiro = -1 }) => (
  <g>
    <rect x={0} y={130} width={300} height={70} fill="#46524C" />
    <rect x={0} y={40} width={300} height={90} fill="#36423C" />
    <rect x={30} y={60} width={50} height={70} fill="#2B332F" />
    <rect x={200} y={50} width={80} height={80} fill="#2B332F" />
    {olheiro >= 0 && (
      <svg x={130} y={40} width={80} height={150} viewBox="-120 -700 240 720">
        <Olheiro x={0} y={0} olhosVerdes={olheiro} />
      </svg>
    )}
  </g>
);
export const CamGaragem: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={0} y={120} width={300} height={80} fill="#4E5A54" />
    <rect x={40} y={20} width={30} height={110} fill="#5E6A64" />
    <rect x={230} y={20} width={30} height={110} fill="#5E6A64" />
    <rect x={40} y={90} width={30} height={10} fill="#B8A640" />
    <rect x={230} y={90} width={30} height={10} fill="#B8A640" />
    {children}
  </g>
);
export const CamElevador: React.FC = () => (
  <g>
    <rect x={90} y={30} width={120} height={170} fill="#5E6A64" />
    <rect x={148} y={30} width={4} height={170} fill="#3A443F" />
    <rect x={220} y={80} width={20} height={40} rx={4} fill="#3A443F" />
  </g>
);

// Livro de ocorrências aberto, com as linhas escritas.
export const LivroOcorrencias: React.FC<P & { linhas?: string[]; nova?: string; novaOp?: number }> = ({ linhas = [], nova, novaOp = 1, ...p }) => (
  <G {...p}>
    <rect x={-250} y={-170} width={500} height={340} rx={12} fill="#2A3A6A" />
    <rect x={-236} y={-158} width={232} height={316} fill="#F7F1E1" />
    <rect x={4} y={-158} width={232} height={316} fill="#F7F1E1" />
    {new Array(11).fill(0).map((_, i) => (
      <g key={i}>
        <rect x={-226} y={-120 + i * 26} width={212} height={2} fill="#B8C8E0" />
        <rect x={14} y={-120 + i * 26} width={212} height={2} fill="#B8C8E0" />
      </g>
    ))}
    {linhas.map((l, i) => (
      <text key={i} x={-222} y={-126 + i * 26} fontFamily="'Segoe Print', 'Comic Sans MS', cursive" fontSize={16} fill="#2A3A6A">
        {l}
      </text>
    ))}
    {nova && (
      <text x={18} y={-100} fontFamily="'Segoe Print', 'Comic Sans MS', cursive" fontSize={17} fill="#1E6B4A" opacity={novaOp}>
        {nova.split("|").map((t, i) => (
          <tspan key={i} x={18} dy={i ? 26 : 0}>
            {t}
          </tspan>
        ))}
      </text>
    )}
    <rect x={-4} y={-160} width={8} height={320} fill="#1E2A50" />
  </G>
);

export const Radinho: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-70} y={-90} width={140} height={90} rx={14} fill="#8B3A2E" />
    <circle cx={-26} cy={-44} r={28} fill="#5A2A22" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={14} y={-70 + i * 14} width={42} height={6} rx={3} fill="#E6B83A" />
    ))}
    <path d="M 50 -90 L 90 -200" stroke="#B8BCC4" strokeWidth={4} />
  </G>
);

export const Garrafa: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-34} y={-170} width={68} height={170} rx={20} fill="#C8322B" />
    <rect x={-26} y={-196} width={52} height={34} rx={10} fill="#2A2A30" />
    <rect x={-34} y={-110} width={68} height={16} fill="#F4F4F0" opacity={0.6} />
  </G>
);

export const PainelChaves: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-150} y={-120} width={300} height={240} rx={8} fill="#8B6A43" />
    {new Array(15).fill(0).map((_, i) => {
      const cx = -110 + (i % 5) * 55;
      const cy = -80 + Math.floor(i / 5) * 76;
      return (
        <g key={i}>
          <circle cx={cx} cy={cy} r={5} fill="#3A2A1A" />
          {i !== 7 && <rect x={cx - 4} y={cy + 4} width={8} height={34} rx={3} fill={i % 3 ? "#C9A43A" : "#B8BCC4"} />}
          <rect x={cx - 14} y={cy + 30} width={28} height={16} rx={4} fill={["#E0565B", "#2F5DA8", "#F2C230", "#2E8B57"][i % 4]} />
        </g>
      );
    })}
  </G>
);

export const Santinho: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-40} y={-60} width={80} height={110} rx={6} fill="#F4ECDD" />
    <path d="M -24 -40 Q 0 -60 24 -40 L 24 30 L -24 30 Z" fill="#5A7FBF" />
    <circle cx={0} cy={-26} r={14} fill="#E8C9A0" />
    <circle cx={0} cy={-26} r={22} fill="none" stroke="#E6B83A" strokeWidth={4} />
  </G>
);

export const CalendarioBorracharia: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-90} y={-140} width={180} height={260} fill="#F4F4F0" />
    <rect x={-90} y={-140} width={180} height={110} fill="#2A2A30" />
    <circle cx={0} cy={-85} r={40} fill="#1A1A1E" stroke="#5C6068" strokeWidth={10} />
    <text x={0} y={-6} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={20} fill="#C8322B">
      BORRACHARIA DO TICO
    </text>
    {new Array(20).fill(0).map((_, i) => (
      <rect key={i} x={-76 + (i % 5) * 32} y={12 + Math.floor(i / 5) * 24} width={22} height={14} fill={i === 3 ? "#C8322B" : "#C9CED6"} />
    ))}
  </G>
);

export const VentiladorMesa: React.FC<P & { t: number }> = ({ t, ...p }) => (
  <G {...p}>
    <rect x={-8} y={-120} width={16} height={110} fill="#5C6068" />
    <ellipse cx={0} cy={-6} rx={50} ry={12} fill="#5C6068" />
    <circle cx={0} cy={-150} r={60} fill="none" stroke="#C9CED6" strokeWidth={5} />
    <g transform={`translate(0 -150) rotate(${t * 900})`}>
      {[0, 120, 240].map((a) => (
        <ellipse key={a} cx={0} cy={-28} rx={14} ry={28} fill="#9FC0D8" opacity={0.8} transform={`rotate(${a})`} />
      ))}
    </g>
  </G>
);

export const Cadeirao: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-6} y={-140} width={12} height={110} fill="#2A2A30" />
    {[-60, 0, 60].map((x) => (
      <path key={x} d={`M 0 -30 L ${x} 0`} stroke="#2A2A30" strokeWidth={10} />
    ))}
    <rect x={-80} y={-180} width={160} height={44} rx={16} fill="#1F2F55" />
    <rect x={-70} y={-380} width={140} height={210} rx={30} fill="#1F2F55" />
  </G>
);

// ---------- garagem ----------
export const Pilar: React.FC<P & { altura?: number; numero?: string }> = ({ altura = 1100, numero, ...p }) => (
  <G {...p}>
    <rect x={-70} y={-altura} width={140} height={altura} fill="#9A9EA6" />
    <rect x={40} y={-altura} width={30} height={altura} fill="rgba(0,0,0,0.12)" />
    {new Array(6).fill(0).map((_, i) => (
      <path key={i} d={`M -70 ${-180 + i * 30} l 140 -40`} stroke={i % 2 ? "#1A1A1E" : "#F2C230"} strokeWidth={22} opacity={0.95} />
    ))}
    <rect x={-70} y={-360} width={140} height={150} fill="none" />
    {numero && (
      <g>
        <circle cx={0} cy={-520} r={46} fill="#F4F4F0" />
        <text x={0} y={-502} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={50} fill={COR.tinta}>
          {numero}
        </text>
      </g>
    )}
  </G>
);

export const Luminaria: React.FC<P & { acesa?: boolean }> = ({ acesa = true, ...p }) => (
  <G {...p}>
    <rect x={-110} y={-10} width={220} height={24} rx={6} fill="#C9CED6" />
    <rect x={-100} y={10} width={200} height={10} rx={4} fill={acesa ? "#FFFBE6" : "#8C8F96"} />
    {acesa && <ellipse cx={0} cy={40} rx={180} ry={40} fill="rgba(255,250,220,0.25)" style={{ filter: "blur(14px)" }} />}
  </G>
);

export const Cano: React.FC<{ y: number; cor?: string }> = ({ y, cor = "#C9A43A" }) => (
  <g>
    <rect x={-20} y={y} width={1120} height={26} fill={cor} />
    {[180, 520, 860].map((x) => (
      <rect key={x} x={x} y={y - 6} width={30} height={38} rx={4} fill="rgba(0,0,0,0.25)" />
    ))}
  </g>
);

// Uno quadradinho visto de lado; `pisca` acende as setas (alarme).
export const Uno: React.FC<P & { cor?: string; pisca?: boolean; amassado?: number }> = ({ cor = "#C8322B", pisca, amassado = 0, ...p }) => (
  <G {...p}>
    <rect x={-210} y={-150} width={420} height={110} rx={18} fill={cor} />
    <path d={`M -130 -150 L -100 ${-250 + amassado} L 110 ${-250 + amassado} L 150 -150 Z`} fill={cor} />
    <path d={`M -110 -156 L -88 ${-236 + amassado} L 0 ${-236 + amassado} L 0 -156 Z M 14 -156 L 14 ${-236 + amassado} L 100 ${-236 + amassado} L 132 -156 Z`} fill="#9FC0D8" />
    <rect x={-210} y={-96} width={420} height={10} fill="rgba(0,0,0,0.2)" />
    <rect x={180} y={-130} width={30} height={22} rx={4} fill={pisca ? "#FFB020" : "#E8C060"} />
    <rect x={-212} y={-130} width={22} height={22} rx={4} fill={pisca ? "#FFB020" : "#E04040"} />
    {pisca && (
      <>
        <circle cx={196} cy={-120} r={40} fill="#FFB020" opacity={0.4} style={{ filter: "blur(10px)" }} />
        <circle cx={-200} cy={-120} r={40} fill="#FFB020" opacity={0.4} style={{ filter: "blur(10px)" }} />
      </>
    )}
    <rect x={-60} y={-80} width={120} height={24} rx={4} fill="#F4F4F0" />
    <text x={0} y={-61} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={20} fill={COR.tinta}>
      FUA-3172
    </text>
    {[-130, 130].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-40} r={44} fill="#1E1E22" />
        <circle cx={x} cy={-40} r={20} fill="#9EA3AB" />
      </g>
    ))}
  </G>
);

export const Rampa: React.FC<{ topo: number; base: number }> = ({ topo, base }) => (
  <path d={`M 340 ${topo} L 740 ${topo} L 1080 ${base} L 0 ${base} Z`} fill="#6B6F78" />
);

// ---------- casa do Seu Edson ----------
export const CamaCasal: React.FC<P & { afunda?: number }> = ({ afunda = 0, ...p }) => (
  <G {...p}>
    <rect x={-420} y={-420} width={60} height={420} rx={10} fill="#6E4C34" />
    <rect x={-420} y={-180} width={840} height={110} rx={10} fill="#8B5E3C" />
    <path d={`M -380 -190 L 380 -190 L 380 -120 L 60 -120 Q 0 ${-120 + afunda} -60 -120 L -380 -120 Z`} fill="#F4ECDD" />
    <path d={`M -380 -200 L 380 -200 L 390 -110 L 70 -110 Q 0 ${-110 + afunda * 1.2} -70 -110 L -390 -110 Z`} fill="#5A7FBF" opacity={0.95} />
    <rect x={-360} y={-250} width={150} height={60} rx={26} fill="#F4F4F0" />
    {[-60, 60, 180, 300].map((x) => (
      <circle key={x} cx={x} cy={-160} r={14} fill="#E6B83A" opacity={0.7} />
    ))}
    <rect x={-400} y={-70} width={30} height={70} fill="#6E4C34" />
    <rect x={370} y={-70} width={30} height={70} fill="#6E4C34" />
  </G>
);

export const GuardaRoupa: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-170} y={-640} width={340} height={640} fill="#8B6A43" />
    <rect x={-160} y={-630} width={155} height={600} fill="#9C7A50" />
    <rect x={5} y={-630} width={155} height={600} fill="#9C7A50" />
    <rect x={-24} y={-340} width={10} height={60} rx={4} fill="#E6B83A" />
    <rect x={14} y={-340} width={10} height={60} rx={4} fill="#E6B83A" />
    <rect x={20} y={-600} width={120} height={300} rx={6} fill="#B8D4E8" opacity={0.6} />
    {/* uniforme pendurado na porta */}
    <path d="M -130 -580 L -40 -580 L -30 -420 L -140 -420 Z" fill="#9CC3E4" />
    <path d="M -100 -600 Q -86 -620 -70 -600" stroke="#5C6068" strokeWidth={4} fill="none" />
  </G>
);

export const RelogioParede: React.FC<P & { hora?: number; minuto?: number }> = ({ hora = 2, minuto = 0, ...p }) => (
  <G {...p}>
    <circle r={60} fill="#F4F4F0" stroke="#6E4C34" strokeWidth={10} />
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={-2} y={-52} width={4} height={10} fill={COR.tinta} transform={`rotate(${i * 30})`} />
    ))}
    <rect x={-3} y={-30} width={6} height={32} rx={3} fill={COR.tinta} transform={`rotate(${hora * 30 + minuto / 2})`} />
    <rect x={-2} y={-46} width={4} height={48} rx={2} fill={COR.tinta} transform={`rotate(${minuto * 6})`} />
  </G>
);

export const Crucifixo: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-6} y={-60} width={12} height={90} fill="#6E4C34" />
    <rect x={-30} y={-40} width={60} height={12} fill="#6E4C34" />
  </G>
);

// Remedinhos e óculos no criado-mudo.
export const Remedios: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-50} y={-50} width={30} height={50} rx={6} fill="#E8E8E8" />
    <rect x={-50} y={-58} width={30} height={12} rx={3} fill="#E0565B" />
    <rect x={-10} y={-36} width={26} height={36} rx={5} fill="#F2C230" />
    <path d="M 30 -10 a 14 10 0 1 0 28 0 a 14 10 0 1 0 28 0" stroke={COR.tinta} strokeWidth={4} fill="none" />
  </G>
);

// ---------- terra e camadas (a queda) ----------
export const Pedrinhas: React.FC<{ semente: string; n?: number; dy?: number; cor?: string }> = ({ semente, n = 40, dy = 0, cor = "#5A3E2A" }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const x = random(`${semente}x${i}`) * 1080;
      const y = (((random(`${semente}y${i}`) * 1920 - dy) % 1920) + 1920) % 1920;
      const r = 8 + random(`${semente}r${i}`) * 26;
      return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill={cor} />;
    })}
  </g>
);

// Chaveiro da portaria (argola, três chaves e a plaquinha vermelha).
export const Chaveiro: React.FC<P> = (p) => (
  <G {...p}>
    <circle r={26} fill="none" stroke="#B8BCC4" strokeWidth={7} />
    {[-30, 10, 50].map((a, i) => (
      <g key={a} transform={`rotate(${a}) translate(0 26)`}>
        <rect x={-6} y={0} width={12} height={54} rx={4} fill={i === 1 ? "#B8BCC4" : "#C9A43A"} />
        <rect x={6} y={34} width={10} height={6} fill={i === 1 ? "#B8BCC4" : "#C9A43A"} />
        <rect x={6} y={44} width={8} height={6} fill={i === 1 ? "#B8BCC4" : "#C9A43A"} />
      </g>
    ))}
    <g transform="rotate(-70) translate(0 26)">
      <rect x={-26} y={0} width={52} height={70} rx={8} fill="#C8322B" />
      <text x={0} y={42} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={16} fill="#fff">
        PORTARIA
      </text>
    </g>
  </G>
);

// Adesivo de chaveiro 24h colado no poste.
export const AdesivoChaveiro: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-70} y={-50} width={140} height={100} rx={6} fill="#F2C230" />
    <text x={0} y={-14} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill={COR.tinta}>
      CHAVEIRO 24H
    </text>
    <text x={0} y={26} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={34} fill="#C8322B">
      R$ 180
    </text>
  </G>
);
