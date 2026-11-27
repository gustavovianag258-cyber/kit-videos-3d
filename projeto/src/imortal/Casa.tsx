import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Bloco } from "../namorada/Bloco";
import { CameraLenta, entre, Palco, suave, texturaCanvas, type PropsPlano } from "../namorada/comum";
import { Bebe, Braco1aPessoa, ChapeuFesta, ENLUTADO, ESPOSA1, ESPOSA2, FIGURANTE, FILHA, FILHO, FILHO_VELHO, ICARO } from "./gente";
import { MARCOS, type Vec3 } from "./tempo";

// Cenas de casa: o quarto no Recife (manhã), a família, os anos passando, o velório e os bolos.

// ---------- Quarto do Ícaro no Recife ----------
const texturaJanela = () =>
  texturaCanvas(512, 420, (ctx) => {
    const ceu = ctx.createLinearGradient(0, 0, 0, 260);
    ceu.addColorStop(0, "#5fb4ff");
    ceu.addColorStop(1, "#cfeaff");
    ctx.fillStyle = ceu;
    ctx.fillRect(0, 0, 512, 420);
    // sol da manhã
    ctx.fillStyle = "#fff4c2";
    ctx.beginPath();
    ctx.arc(400, 70, 34, 0, Math.PI * 2);
    ctx.fill();
    // mar de Boa Viagem
    ctx.fillStyle = "#1b8ec9";
    ctx.fillRect(0, 250, 512, 70);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 9; i++) ctx.fillRect(i * 60 + 10, 262 + (i % 3) * 14, 26, 3);
    // prédios da orla
    for (let i = 0; i < 12; i++) {
      const h = 90 + ((i * 53) % 110);
      const x = i * 44 - 6;
      ctx.fillStyle = ["#e9e4d8", "#f2c6a0", "#d8e2ea", "#f6efe0"][i % 4];
      ctx.fillRect(x, 320 - h, 38, h + 100);
      ctx.fillStyle = "rgba(40,80,120,0.45)";
      for (let y = 330 - h; y < 420; y += 14) for (let k = 0; k < 3; k++) ctx.fillRect(x + 5 + k * 11, y, 7, 7);
    }
    // coqueiros na frente
    ctx.fillStyle = "#2f7d32";
    for (const cx of [70, 300, 470]) {
      ctx.fillRect(cx, 300, 6, 120);
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.ellipse(cx + 3 + Math.cos(k) * 22, 300 + Math.sin(k) * 8, 28, 7, k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

const texturaPiso = () =>
  texturaCanvas(
    256,
    256,
    (ctx) => {
      // lajota clara, típica de apartamento no Recife
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          ctx.fillStyle = (x + y) % 2 ? "#e8dccb" : "#efe5d6";
          ctx.fillRect(x * 64, y * 64, 64, 64);
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(x * 64, y * 64, 64, 2);
          ctx.fillRect(x * 64, y * 64, 2, 64);
        }
    },
    [4, 4],
  );

const Despertador: React.FC<{ s: number; toca: boolean }> = ({ s, toca }) => {
  const treme = toca ? Math.sin(s * 95) * 0.06 : 0;
  const pula = toca ? Math.abs(Math.sin(s * 47)) * 0.015 : 0;
  return (
    <group position={[-1.5, 0.6 + pula, -1.4]} rotation={[0, 0.45, treme]}>
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
        <meshStandardMaterial color="#e63946" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.14, 0.042]}>
        <circleGeometry args={[0.1, 20]} />
        <meshStandardMaterial color="#fffaf0" />
      </mesh>
      {/* ponteiros: 7h */}
      <mesh position={[0, 0.17, 0.045]}>
        <boxGeometry args={[0.012, 0.075, 0.004]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[-0.02, 0.115, 0.046]} rotation={[0, 0, -2.6]}>
        <boxGeometry args={[0.014, 0.055, 0.004]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {/* sinos e martelinho */}
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.08, 0.28, -0.005]}>
          <sphereGeometry args={[0.055, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d9d9d9" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[toca ? Math.sin(s * 120) * 0.05 : 0, 0.3, 0]}>
        <boxGeometry args={[0.02, 0.07, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.07, 0.03, 0]}>
          <boxGeometry args={[0.025, 0.06, 0.025]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
};

const Ventilador: React.FC<{ s: number }> = ({ s }) => (
  <group position={[0.3, 3.55, 0.3]}>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
      <meshStandardMaterial color="#f2f2f2" />
    </mesh>
    <group rotation={[0, s * 9, 0]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 10]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.015, 0.16]} />
          <meshStandardMaterial color="#b98b5e" />
        </mesh>
      ))}
    </group>
  </group>
);

export const QuartoRecife: React.FC<{ s: number; toca?: boolean }> = ({ s, toca = false }) => {
  const janela = useMemo(texturaJanela, []);
  const piso = useMemo(texturaPiso, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={piso} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2, -2]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#5fb8a8" roughness={0.9} />
      </mesh>
      <mesh position={[-2.6, 2, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color="#f3e7cf" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#f6efe3" />
      </mesh>
      <Ventilador s={s} />
      {/* janela grande com a orla de Boa Viagem e a cortina balançando */}
      <group position={[-2.58, 1.85, 0.1]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.7, 1.4, 0.06]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.55, 1.25]} />
          <meshBasicMaterial map={janela} toneMapped={false} />
        </mesh>
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.95, -0.05, 0.12]} rotation={[0, Math.sin(s * 1.6 + l) * 0.12, Math.sin(s * 1.1 + l) * 0.04]}>
            <boxGeometry args={[0.35, 1.6, 0.03]} />
            <meshStandardMaterial color="#ffd166" roughness={0.95} />
          </mesh>
        ))}
      </group>
      {/* faixa de sol entrando pela janela */}
      <mesh position={[-0.8, 0.012, 0.3]} rotation={[-Math.PI / 2, 0, 0.25]}>
        <planeGeometry args={[2.6, 1.3]} />
        <meshBasicMaterial color="#fff1c4" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* pôster do Sport/time genérico: listras vermelho e preto */}
      <group position={[1.1, 2.3, -1.97]}>
        <mesh>
          <boxGeometry args={[0.8, 1.0, 0.03]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.27 + i * 0.18, 0, 0.02]}>
            <planeGeometry args={[0.09, 0.9]} />
            <meshStandardMaterial color="#d62828" />
          </mesh>
        ))}
      </group>
      {/* cama */}
      <group position={[0.1, 0, -1.05]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.4, 1.5]} />
          <meshStandardMaterial color="#8a5a35" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.16, 1.42]} />
          <meshStandardMaterial color="#3a6fd8" roughness={0.85} />
        </mesh>
        <mesh position={[-0.82, 0.6, 0]} castShadow>
          <boxGeometry args={[0.45, 0.14, 0.9]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[-1.12, 0.65, 0]}>
          <boxGeometry args={[0.08, 1.3, 1.5]} />
          <meshStandardMaterial color="#6e4426" roughness={0.8} />
        </mesh>
      </group>
      {/* criado-mudo com o despertador do lado da cabeceira, e a planta no pé da cama */}
      <mesh position={[-1.5, 0.3, -1.5]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.5]} />
        <meshStandardMaterial color="#d9c7a3" />
      </mesh>
      <Despertador s={s} toca={toca} />
      <group position={[1.85, 0, -1.55]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.4, 8]} />
          <meshStandardMaterial color="#c0662b" />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.3) * 0.15, 0.7 + (i % 2) * 0.15, Math.sin(i * 1.3) * 0.15]} rotation={[Math.sin(s + i) * 0.05, i, 0.5]}>
            <boxGeometry args={[0.08, 0.7, 0.25]} />
            <meshStandardMaterial color="#2f9e44" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const LuzManha: React.FC<{ forca?: number }> = ({ forca = 1 }) => (
  <>
    <ambientLight intensity={0.55 * forca} color="#fff1dc" />
    <directionalLight position={[-6, 4, 1.5]} intensity={2.4 * forca} color="#ffe0a8" castShadow shadow-mapSize={[1024, 1024]} />
    <hemisphereLight args={["#cfe8ff", "#d9b48a", 0.5 * forca]} />
  </>
);

// Ícaro deitado na cama (cabeça no travesseiro)
const IcaroDeitado: React.FC<{ frame: number; bracoAlarme?: number; olhos?: boolean; sorri?: boolean }> = ({ frame, bracoAlarme = 0, olhos = false, sorri = false }) => (
  <group position={[1.0, 0.72, -1.05]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
    <Bloco
      v={ICARO}
      frame={frame}
      e={{ olhosFechados: !olhos, boca: sorri ? "sorriso" : "neutra", sobrancelha: olhos ? 0.2 : -0.1 }}
      p={{ bracoE: [-0.2, 0.15], bracoD: [-0.2 - bracoAlarme * 1.6, 0.15 + bracoAlarme * 0.5], cabeca: [-0.1, 0.25] }}
    />
  </group>
);

// Sentado na beira da cama, de frente para a câmera
const IcaroSentado: React.FC<{ frame: number; e?: Parameters<typeof Bloco>[0]["e"]; p?: Parameters<typeof Bloco>[0]["p"] }> = ({ frame, e, p }) => (
  <Bloco v={ICARO} pos={[0.2, -0.125, -0.5]} frame={frame} e={e} p={{ sentado: true, ...p }} />
);

export const PlanoQuartoAcorda: React.FC<PropsPlano & { volta?: boolean }> = ({ t, dur, frame, s, volta = false }) => {
  const bate = entre(t, volta ? 1.2 : 1.35, volta ? 1.6 : 1.75);
  const toca = t < (volta ? 1.45 : 1.6);
  return (
    <Palco fundo="#bfe3ff" sombras>
      {/* de cima e de lado: o rosto no travesseiro e o despertador tocando ficam na metade de baixo
          (a pergunta 3D ocupa a de cima) */}
      <CameraLenta
        de={volta ? [-0.1, 3.3, 0.5] : [-0.35, 3.3, 0.6]}
        para={volta ? [-0.3, 3.0, 0.15] : [-0.5, 2.95, 0.2]}
        alvo={[-0.85, 0.75, -1.05]}
        x={t / dur}
        fov={50}
        treme={toca ? 0.004 : 0}
        s={s}
      />
      <LuzManha />
      <QuartoRecife s={s} toca={toca} />
      <IcaroDeitado frame={frame} bracoAlarme={Math.sin(bate * Math.PI)} olhos={t > 1.0} sorri={volta && t > 1.9} />
    </Palco>
  );
};

export const PlanoEspreguica: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const k = suave(entre(t, 0.1, 0.9));
  return (
    <Palco fundo="#bfe3ff" sombras>
      <CameraLenta de={[1.0, 1.7, 3.9]} para={[0.75, 1.7, 3.5]} alvo={[0.2, 2.05, -0.5]} x={t / dur} fov={46} />
      <LuzManha />
      <QuartoRecife s={s} />
      <IcaroSentado
        frame={frame}
        e={{ olhosFechados: k > 0.3 && k < 0.95, boca: "aberta", abertura: 0.4 + k * 0.6, sobrancelha: 0.3 }}
        p={{ bracoE: [-2.9 * k, 0.25], bracoD: [-2.9 * k, 0.25], cotoveloE: -0.4 * k, cotoveloD: -0.4 * k, cabeca: [-0.25 * k, 0], curvado: -0.05 }}
      />
    </Palco>
  );
};

// "Você não acredita." — close desconfiado; "Normal." — dá de ombros
export const PlanoDesconfiado: React.FC<PropsPlano & { normal?: boolean }> = ({ t, dur, frame, s, normal = false }) => {
  const ombro = normal ? Math.sin(entre(t, 0.4, 1.0) * Math.PI) : 0;
  return (
    <Palco fundo="#bfe3ff" sombras>
      {normal ? (
        <CameraLenta de={[-0.6, 1.45, 2.4]} para={[-0.45, 1.5, 2.1]} alvo={[0.2, 1.45, -0.5]} x={t / dur} fov={42} />
      ) : (
        <CameraLenta de={[0.25, 1.75, 1.75]} para={[0.22, 1.74, 1.4]} alvo={[0.2, 1.7, -0.45]} x={t / dur} fov={40} treme={0.002} s={s} />
      )}
      <LuzManha />
      <QuartoRecife s={s} />
      <IcaroSentado
        frame={frame}
        e={normal ? { sobrancelha: 0.7 * ombro, boca: "meioSorriso" } : { sobrancelha: -0.6, boca: "meioSorriso", espanto: 0 }}
        p={
          normal
            ? { bracoE: [-0.3, 0.5 + ombro * 0.4], bracoD: [-0.3, 0.5 + ombro * 0.4], cotoveloE: -1.5, cotoveloD: -1.5, cabeca: [0, 0.12 * ombro] }
            : { bracoE: [-0.35, 0.1], bracoD: [-0.35, 0.1], cotoveloE: -0.7, cotoveloD: -0.7, cabeca: [0.05, -0.15 + Math.sin(t * 1.5) * 0.05] }
        }
      />
    </Palco>
  );
};

// Volta ao real: sorriso calmo; depois o celular "MÃE · chamando" em primeira pessoa
const texturaLigacao = () =>
  texturaCanvas(256, 480, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 480);
    g.addColorStop(0, "#1d3b2f");
    g.addColorStop(1, "#0b1512");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 480);
    ctx.fillStyle = "#ffd6e7";
    ctx.beginPath();
    ctx.arc(128, 150, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8486f";
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("♥", 128, 172);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px sans-serif";
    ctx.fillText("MÃE", 128, 262);
    ctx.font = "26px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText("chamando…", 128, 300);
    ctx.fillStyle = "#25d366";
    ctx.beginPath();
    ctx.arc(128, 400, 34, 0, Math.PI * 2);
    ctx.fill();
  });

export const PlanoSorri: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#bfe3ff" sombras>
    <CameraLenta de={[0.35, 1.72, 2.2]} para={[0.28, 1.72, 1.95]} alvo={[0.2, 1.62, -0.45]} x={t / dur} fov={40} />
    <LuzManha forca={1.1} />
    <QuartoRecife s={s} />
    <IcaroSentado frame={frame} e={{ boca: "sorriso", sobrancelha: 0.3 }} p={{ bracoE: [-0.35, 0.1], bracoD: [-0.35, 0.1], cotoveloE: -0.6, cotoveloD: -0.6, cabeca: [-0.05, 0.08] }} />
  </Palco>
);

export const PlanoLigaMae: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const tela = useMemo(texturaLigacao, []);
  const sobe = suave(entre(t, 0, 0.5));
  const toque = t > MARCOS.ligar - 91.35 ? Math.sin(t * 30) * 0.004 : 0;
  return (
    <Palco fundo="#bfe3ff" sombras>
      <CameraLenta de={[0.2, 1.78, 0.8]} para={[0.2, 1.76, 0.7]} alvo={[0.2, 1.42, 0]} x={t / dur} fov={46} />
      <LuzManha />
      <QuartoRecife s={s} />
      <group position={[0.2 + toque, 1.12 + sobe * 0.3, 0.05]} rotation={[-0.55, 0, 0.08]}>
        <mesh>
          <boxGeometry args={[0.2, 0.38, 0.025]} />
          <meshStandardMaterial color="#15161a" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <planeGeometry args={[0.18, 0.35]} />
          <meshBasicMaterial map={tela} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0, 0.2]} intensity={0.6} distance={1} color="#bfffe0" />
      </group>
      <Braco1aPessoa ombro={[0.5, 1.05, 0.6]} mao={[0.31, 1.05 + sobe * 0.3, 0.1]} />
    </Palco>
  );
};

// ---------- Família ----------
const LuzDourada: React.FC = () => (
  <>
    <ambientLight intensity={0.5} color="#ffe2b8" />
    <directionalLight position={[-4, 5, 3]} intensity={2.2} color="#ffc76b" castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[2, 2.6, 1.5]} intensity={1.4} color="#ffb36b" />
  </>
);

const SalaJantar: React.FC<{ s: number; panela?: boolean }> = ({ s, panela = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#b98a5a" roughness={0.8} />
    </mesh>
    <mesh position={[0, 2, -2.6]}>
      <planeGeometry args={[12, 4]} />
      <meshStandardMaterial color="#f6c56b" roughness={0.9} />
    </mesh>
    {/* janela com luz de fim de tarde */}
    <mesh position={[-1.4, 2.0, -2.58]}>
      <planeGeometry args={[1.4, 1.2]} />
      <meshBasicMaterial color="#ffe7a8" toneMapped={false} />
    </mesh>
    {/* mesa e comida */}
    <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.4, 0.08, 1.2]} />
      <meshStandardMaterial color="#7a4a2a" />
    </mesh>
    <mesh position={[0, 0.83, 0]}>
      <boxGeometry args={[2.3, 0.02, 1.1]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    {[-0.8, -0.3, 0.3, 0.8].map((x, i) => (
      <group key={x} position={[x, 0.86, 0.32 * (i % 2 ? 1 : -1)]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.13, 0.03, 14]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.14, 0.05, 0.12]} />
          <meshStandardMaterial color={["#d97706", "#65a30d", "#b91c1c", "#ca8a04"][i]} />
        </mesh>
      </group>
    ))}
    {/* panela no meio, soltando vapor (some nos planos em primeira pessoa) */}
    {panela && (
      <>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.22, 0.2, 0.2, 14]} />
          <meshStandardMaterial color="#c2410c" />
        </mesh>
        {[0, 1, 2].map((i) => {
          const c = (s * 0.5 + i / 3) % 1;
          return (
            <mesh key={i} position={[Math.sin(s * 2 + i) * 0.05, 1.1 + c * 0.6, 0]} scale={0.06 + c * 0.08}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={(1 - c) * 0.35} depthWrite={false} />
            </mesh>
          );
        })}
      </>
    )}
    {/* cadeiras (encostos) */}
    {[-0.95, 0.95].map((x) =>
      [-1, 1].map((l) => (
        <mesh key={`${x}${l}`} position={[x, 0.85, l * 0.95]}>
          <boxGeometry args={[0.5, 0.9, 0.06]} />
          <meshStandardMaterial color="#5a3420" />
        </mesh>
      )),
    )}
  </group>
);

export const PlanoAlmoco: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const ri = Math.sin(t * 7) * 0.5 + 0.5;
  return (
    <Palco fundo="#2a1a10" sombras>
      <CameraLenta de={[3.6, 2.5, 3.2]} para={[2.9, 2.2, 2.6]} alvo={[0, 1.0, 0]} x={t / dur} fov={42} />
      <LuzDourada />
      <SalaJantar s={s} />
      {/* Ícaro na cabeceira, a esposa e os dois filhos pequenos rindo */}
      <Bloco v={ICARO} pos={[-1.55, -0.13, 0]} giroY={Math.PI / 2} frame={frame} e={{ boca: "sorriso", sobrancelha: 0.3 }} p={{ sentado: true, bracoE: [-0.9, 0.1], bracoD: [-0.9 - ri * 0.2, 0.1], cotoveloE: -0.6, cotoveloD: -0.9, cabeca: [0, 0.1] }} />
      <Bloco v={ESPOSA1} pos={[0.5, -0.13, -0.95]} frame={frame + 30} e={{ boca: "sorriso", sobrancelha: 0.4 }} p={{ sentado: true, bracoE: [-0.9, 0.1], bracoD: [-0.9, 0.1], cotoveloE: -0.7, cotoveloD: -0.7, cabeca: [0, -0.3] }} />
      <Bloco v={FILHO} pos={[-0.5, 0.15, 0.95]} giroY={Math.PI} escala={0.62} frame={frame + 11} e={{ boca: "aberta", abertura: 0.4 + ri * 0.5, sobrancelha: 0.6 }} p={{ sentado: true, bracoD: [-2.2 - ri * 0.4, 0.3], cabeca: [-0.15, 0] }} />
      <Bloco v={FILHA} pos={[0.5, 0.15, 0.95]} giroY={Math.PI} escala={0.58} frame={frame + 47} e={{ boca: "sorriso", sobrancelha: 0.5 }} p={{ sentado: true, bracoE: [-1.0, 0.2], cabeca: [0, 0.2 * Math.sin(t * 4)] }} />
    </Palco>
  );
};

// "Casou." — arco de flores e pétalas caindo
export const PlanoCasamento: React.FC<PropsPlano> = ({ t, dur, frame }) => {
  const NOIVA = { ...ESPOSA1, camisa: "#ffffff", calca: "#ffffff" };
  const TERNO = { ...ICARO, camisa: "#1f2633", calca: "#1f2633", sapato: "#111" };
  return (
    <Palco fundo="#ffd9a6" sombras>
      <CameraLenta de={[0, 1.7, 4.2]} para={[0, 1.75, 3.6]} alvo={[0, 1.6, 0]} x={t / dur} fov={42} />
      <LuzDourada />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#8fcf6b" />
      </mesh>
      {/* arco */}
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 1.3, 1.4, -0.6]}>
          <boxGeometry args={[0.15, 2.8, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      <mesh position={[0, 2.85, -0.6]}>
        <boxGeometry args={[2.75, 0.18, 0.18]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-1.3 + (i / 17) * 2.6, 2.85 + Math.sin(i) * 0.1, -0.55]}>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color={["#ff6b9a", "#ffd23f", "#ffffff"][i % 3]} flatShading />
        </mesh>
      ))}
      <Bloco v={TERNO} pos={[-0.38, 0, 0]} giroY={0.35} frame={frame} e={{ boca: "sorriso", sobrancelha: 0.4 }} p={{ bracoD: [-0.3, -0.25] }} />
      <Bloco v={NOIVA} pos={[0.38, 0, 0]} giroY={-0.35} frame={frame + 20} e={{ boca: "sorriso", sobrancelha: 0.5 }} p={{ bracoE: [-0.3, -0.25] }} />
      {/* véu */}
      <mesh position={[0.45, 2.0, -0.2]} rotation={[0.2, -0.35, 0]}>
        <boxGeometry args={[0.66, 0.9, 0.04]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      {/* pétalas caindo */}
      {Array.from({ length: 40 }, (_, i) => {
        const y = 3.5 - ((t * 0.9 + random(`pe${i}`) * 3.5) % 3.5);
        return (
          <mesh key={i} position={[(random(`px${i}`) - 0.5) * 4, y, (random(`pz${i}`) - 0.5) * 2 + 0.5]} rotation={[t * 3 + i, t * 2, i]}>
            <planeGeometry args={[0.07, 0.05]} />
            <meshBasicMaterial color={i % 2 ? "#ff7aa8" : "#ffffff"} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </Palco>
  );
};

// "Teve filhos." — o bebê no colo, em primeira pessoa
export const PlanoBebe: React.FC<PropsPlano> = ({ t, dur, frame }) => {
  const nina = Math.sin(t * 3) * 0.03;
  return (
    <Palco fundo="#3a2414" sombras>
      <CameraLenta de={[0, 2.0, 0.95]} para={[0, 1.95, 0.8]} alvo={[0, 1.15, -0.45]} x={t / dur} fov={48} />
      <LuzDourada />
      <SalaJantar s={t} panela={false} />
      <group scale={0.8} position={[0, 0.23, -0.06]}>
        <Bebe pos={[nina, 1.15, -0.25]} rot={[0.35, Math.PI, nina]} frame={frame} />
      </group>
      <Braco1aPessoa ombro={[-0.35, 1.25, 0.35]} mao={[-0.14 + nina, 1.08, -0.2]} />
      <Braco1aPessoa ombro={[0.35, 1.25, 0.35]} mao={[0.16 + nina, 1.06, -0.32]} />
      {/* a esposa sorrindo ao fundo */}
      <Bloco v={ESPOSA1} pos={[0.6, 0, -2.0]} giroY={-0.25} frame={frame} e={{ boca: "sorriso", sobrancelha: 0.5 }} p={{ cotoveloDentro: 0.6, bracoE: [-0.5, 0], bracoD: [-0.5, 0], cotoveloE: -1.2, cotoveloD: -1.2 }} />
    </Palco>
  );
};

// "Vê eles crescerem." — a mão no ombro do filho já adolescente
export const PlanoFilhoGrande: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#3a2414" sombras>
    <CameraLenta de={[-0.15, 2.0, 1.75]} para={[-0.1, 2.0, 1.5]} alvo={[0.1, 1.75, -0.75]} x={t / dur} fov={46} />
    <LuzDourada />
    <SalaJantar s={t} panela={false} />
    <Bloco v={FILHO} pos={[0.1, 0, -0.75]} escala={0.97} frame={frame} e={{ boca: "sorriso", sobrancelha: 0.35 }} p={{ cabeca: [0.05, 0] }} />
    <Braco1aPessoa ombro={[0.42, 1.5, 1.35]} mao={[0.47, 1.45, -0.62]} />
  </Palco>
);

// "Aí os filhos envelhecem… e você não." — lado a lado: o filho de cabelo branco e o Ícaro igual
const LuzFria: React.FC<{ forca?: number }> = ({ forca = 1 }) => (
  <>
    <ambientLight intensity={0.3 * forca} color="#9fb4ff" />
    <directionalLight position={[3, 5, 3]} intensity={1.8 * forca} color="#cfdcff" castShadow shadow-mapSize={[1024, 1024]} />
    <directionalLight position={[-4, 2, -3]} intensity={1.2 * forca} color="#6f86ff" />
  </>
);

export const PlanoFilhoVelho: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#141a2e" sombras>
    <CameraLenta de={[1.5, 1.5, 5.4]} para={[0.7, 1.5, 4.9]} alvo={[0, 1.25, 0]} x={t / dur} fov={40} />
    <LuzFria />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#2b3150" />
    </mesh>
    <mesh position={[0, 2, -2]}>
      <planeGeometry args={[14, 4]} />
      <meshStandardMaterial color="#3b4670" />
    </mesh>
    <Bloco v={FILHO_VELHO} pos={[0.55, 0, 0]} giroY={-0.45} frame={frame} e={{ boca: "sorriso", sobrancelha: 0.25, olhosFechados: frame % 60 > 40 }} p={{ curvado: 0.32, cabeca: [-0.2, 0], bracoD: [-0.7, 0.05], cotoveloD: -0.4 }} />
    {/* bengala */}
    <mesh position={[0.95, 0.5, 0.35]} rotation={[0.1, 0, -0.08]}>
      <cylinderGeometry args={[0.025, 0.025, 1.0, 6]} />
      <meshStandardMaterial color="#5a3420" />
    </mesh>
    <Bloco v={ICARO} pos={[-0.55, 0, 0]} giroY={0.45} frame={frame + 9} e={{ sobrancelha: 0.45, boca: "tremendo", espanto: 0.15 }} p={{ cabeca: [0.05, 0.15] }} />
  </Palco>
);

// Velório em câmera lenta: guarda-chuvas pretos, chuva caindo devagar, o Ícaro igual
export const PlanoVelorio: React.FC<PropsPlano> = ({ t, dur, frame }) => {
  const lento = t * 0.35;
  return (
    <Palco fundo="#0d1222" sombras>
      <CameraLenta de={[0.7, 2.1, 4.6]} para={[0.5, 2.0, 4.0]} alvo={[0, 1.35, -0.8]} x={t / dur} fov={42} />
      <ambientLight intensity={0.22} color="#8ea2ff" />
      <directionalLight position={[2, 4, 2]} intensity={1.4} color="#bcd0ff" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[0, 4, 1.5]} angle={0.4} penumbra={0.6} intensity={6} color="#dfe8ff" target-position={[0, 1.6, -0.3]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#1f2a1f" />
      </mesh>
      {/* caixão com flores */}
      <group position={[0, 0, -1.6]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.0, 0.5, 0.7]} />
          <meshStandardMaterial color="#3a2414" roughness={0.4} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-0.8 + i * 0.2, 0.75, Math.sin(i) * 0.15]}>
            <dodecahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={i % 2 ? "#ffffff" : "#f5c518"} flatShading />
          </mesh>
        ))}
      </group>
      {/* gente de preto com guarda-chuvas */}
      {[-1.7, -1.05, 1.05, 1.7].map((x, i) => (
        <group key={x}>
          <Bloco v={ENLUTADO(i)} pos={[x, 0, -0.6 - (i % 2) * 0.5]} giroY={-x * 0.25} frame={frame + i * 13} e={{ olhosFechados: i % 2 === 0, boca: "tremendo", sobrancelha: 0.3 }} p={{ cabeca: [0.3, 0], bracoD: [-1.6, 0.1], cotoveloD: -1.2 }} />
          <mesh position={[x + 0.25, 2.55, -0.45 - (i % 2) * 0.5]}>
            <coneGeometry args={[0.75, 0.32, 8, 1, true]} />
            <meshStandardMaterial color="#0b0b0f" side={THREE.DoubleSide} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* o Ícaro na frente, de cabeça baixa */}
      <Bloco v={{ ...ICARO, camisa: "#15161b", calca: "#0f1014" }} pos={[0, 0, 0]} frame={frame} e={{ sobrancelha: 0.55, boca: "tremendo", olhosFechados: lento % 1 > 0.85 }} p={{ cabeca: [0.28, 0], cotoveloDentro: 0.5, bracoE: [-0.25, 0], bracoD: [-0.25, 0], cotoveloE: -0.9, cotoveloD: -0.9 }} />
      {/* chuva em câmera lenta */}
      {Array.from({ length: 70 }, (_, i) => {
        const y = 3.6 - ((lento * 2.2 + random(`ch${i}`) * 3.6) % 3.6);
        return (
          <mesh key={i} position={[(random(`cx${i}`) - 0.5) * 5, y, (random(`cz${i}`) - 0.5) * 3]}>
            <boxGeometry args={[0.006, 0.22, 0.006]} />
            <meshBasicMaterial color="#c9d8ff" transparent opacity={0.55} />
          </mesh>
        );
      })}
    </Palco>
  );
};

// "Você recomeça." — outra casa, outra família
export const PlanoNovaFamilia: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#9fc6ff" sombras>
    <CameraLenta de={[-1.0, 1.7, 6.4]} para={[-0.6, 1.7, 5.7]} alvo={[0, 1.6, 0]} x={t / dur} fov={42} />
    <ambientLight intensity={0.55} color="#e6eeff" />
    <directionalLight position={[4, 6, 4]} intensity={2} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#7fbf5c" />
    </mesh>
    {/* casa nova: azul com telhado */}
    <group position={[0, 0, -2.6]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[4.2, 2.8, 2]} />
        <meshStandardMaterial color="#5aa9e6" />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.2, 1.2, 4]} />
        <meshStandardMaterial color="#c0392b" flatShading />
      </mesh>
      <mesh position={[0, 0.8, 1.01]}>
        <planeGeometry args={[0.8, 1.6]} />
        <meshStandardMaterial color="#6b3e1f" />
      </mesh>
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 1.7, 1.01]}>
          <planeGeometry args={[0.8, 0.7]} />
          <meshBasicMaterial color="#fff3c4" toneMapped={false} />
        </mesh>
      ))}
    </group>
    <Bloco v={ICARO} pos={[-0.9, 0, 0]} giroY={0.15} frame={frame} e={{ boca: "meioSorriso", sobrancelha: 0.1 }} p={{ bracoD: [-0.2, -0.3] }} />
    <Bloco v={ESPOSA2} pos={[0, 0, 0.1]} frame={frame + 21} e={{ boca: "sorriso", sobrancelha: 0.4 }} p={{ bracoE: [-0.2, -0.3] }} />
    <Bloco v={{ ...FILHA, camisa: "#ff7aa8" }} pos={[0.85, 0, 0.3]} escala={0.6} frame={frame + 7} e={{ boca: "sorriso" }} p={{ bracoE: [-2.6 + Math.sin(t * 9) * 0.3, 0.3] }} />
  </Palco>
);

// "Duas vezes. Três." — parede de retratos que vão aparecendo
const desenharRetrato = (i: number) =>
  texturaCanvas(256, 320, (ctx) => {
    const fundos = ["#d8b98a", "#9fd3c7", "#c7b5ff"];
    ctx.fillStyle = fundos[i];
    ctx.fillRect(0, 0, 256, 320);
    if (i === 0) {
      ctx.fillStyle = "rgba(120,80,30,0.25)";
      ctx.fillRect(0, 0, 256, 320);
    }
    // família em bloquinhos: o Ícaro (sempre igual, camisa laranja) + esposa + filhos
    const pessoa = (x: number, h: number, pele: string, cabelo: string, camisa: string) => {
      ctx.fillStyle = camisa;
      ctx.fillRect(x - 22, 320 - h + 48, 44, h - 48);
      ctx.fillStyle = pele;
      ctx.fillRect(x - 22, 320 - h, 44, 44);
      ctx.fillStyle = cabelo;
      ctx.fillRect(x - 24, 320 - h - 8, 48, 14);
      ctx.fillStyle = "#111";
      ctx.fillRect(x - 12, 320 - h + 16, 7, 7);
      ctx.fillRect(x + 6, 320 - h + 16, 7, 7);
      ctx.fillStyle = "#5a1a14";
      ctx.fillRect(x - 9, 320 - h + 31, 18, 4);
    };
    const esposas = [
      ["#e2a878", "#3b2214", "#e8486f"],
      ["#8d5524", "#111111", "#2bb38f"],
      ["#f1c27d", "#a0522d", "#8338ec"],
    ][i];
    pessoa(80, 200, "#b9774a", "#16100c", "#f08a24");
    pessoa(160, 190, esposas[0], esposas[1], esposas[2]);
    pessoa(120, 120, "#c98b5a", "#1a1410", ["#3a86ff", "#ff7aa8", "#06d6a0"][i]);
    if (i > 0) pessoa(205, 105, "#c98b5a", "#2a1a10", "#ffbe0b");
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(["1ª FAMÍLIA", "2ª FAMÍLIA", "3ª FAMÍLIA"][i], 14, 34);
  });

export const PlanoRetratos: React.FC<PropsPlano> = ({ t, dur }) => {
  const fotos = useMemo(() => [0, 1, 2].map(desenharRetrato), []);
  const quando = [0.05, 0.4, 1.2];
  // em pirâmide (a tela é vertical): duas em cima, a terceira embaixo no meio
  const lugar: Vec3[] = [
    [-0.47, 3.0, 0.02],
    [0.47, 3.0, 0.02],
    [0, 1.95, 0.02],
  ];
  return (
    <Palco fundo="#1b1f33">
      <CameraLenta de={[0, 2.25, 4.6]} para={[0, 2.25, 4.1]} alvo={[0, 2.2, 0]} x={t / dur} fov={40} />
      <ambientLight intensity={0.5} color="#dfe6ff" />
      <spotLight position={[0, 4, 2.5]} angle={0.7} penumbra={0.5} intensity={9} color="#fff3dd" />
      <mesh position={[0, 2, -0.05]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#6d5a8c" />
      </mesh>
      {fotos.map((tex, i) => {
        const m = suave(entre(t, quando[i], quando[i] + 0.25));
        if (m <= 0) return null;
        return (
          <group key={i} position={lugar[i]} rotation={[0, 0, (i - 1) * -0.06]} scale={(0.6 + 0.4 * m + Math.sin(m * Math.PI) * 0.15) * 0.85}>
            <mesh>
              <boxGeometry args={[0.92, 1.12, 0.05]} />
              <meshStandardMaterial color={["#6b4423", "#d4af37", "#e5e7eb"][i]} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[0.8, 1.0]} />
              <meshStandardMaterial map={tex} />
            </mesh>
          </group>
        );
      })}
    </Palco>
  );
};

// Bolos de aniversário em primeira pessoa: as velas vêm na direção do rosto e ele sopra.
// A piada: o número da vela é sempre "31".
const Vela: React.FC<{ pos: Vec3; acesa: number; s: number; cor: string; digito: string }> = ({ pos, acesa, s, cor, digito }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(64, 96, (ctx) => {
        ctx.fillStyle = cor;
        ctx.fillRect(0, 0, 64, 96);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 84px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(digito, 32, 84);
      }),
    [cor, digito],
  );
  return (
    <group position={pos}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.13, 0.22, 0.05]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      {acesa > 0 && (
        <group position={[0, 0.27, 0]} scale={acesa * (1 + Math.sin(s * 31 + pos[0] * 9) * 0.12)}>
          <mesh>
            <coneGeometry args={[0.025, 0.08, 8]} />
            <meshBasicMaterial color="#ffd36b" toneMapped={false} />
          </mesh>
          <pointLight intensity={0.7 * acesa} distance={1.6} color="#ffb347" />
        </group>
      )}
    </group>
  );
};

const CORES_BOLO = [
  { massa: "#f6b6c8", cobertura: "#ff6fa3", fundo: "#2a1626", vela: "#3a86ff" },
  { massa: "#6b3e1f", cobertura: "#3b1f0e", fundo: "#1a1410", vela: "#ffbe0b" },
  { massa: "#9be7ff", cobertura: "#7c3aed", fundo: "#0b0f2a", vela: "#06d6a0" },
];

export const PlanoBolo: React.FC<PropsPlano & { n: 0 | 1 | 2 }> = ({ t, dur, frame, s, n }) => {
  const c = CORES_BOLO[n];
  const sopro = MARCOS.sopra[n] - [38.7, 39.55, 40.3][n];
  const acesa = 1 - entre(t, sopro, sopro + 0.12);
  const vem = suave(entre(t, 0, dur));
  return (
    <Palco fundo={c.fundo}>
      <CameraLenta de={[0, 1.55, 1.25]} para={[0, 1.45, 0.62]} alvo={[0, 1.15, -0.4]} x={vem} fov={50} treme={0.002} s={s} />
      <ambientLight intensity={0.25} color="#ffcf9e" />
      <pointLight position={[0, 2.2, 0.6]} intensity={1.2} color="#ffe0b8" />
      {/* mesa e bolo */}
      <mesh position={[0, 0.85, -0.4]}>
        <boxGeometry args={[2.6, 0.06, 1.6]} />
        <meshStandardMaterial color={n === 2 ? "#1e293b" : "#ffffff"} />
      </mesh>
      <mesh position={[0, 1.0, -0.4]}>
        <cylinderGeometry args={[0.36, 0.36, 0.26, 24]} />
        <meshStandardMaterial color={c.massa} />
      </mesh>
      <mesh position={[0, 1.14, -0.4]}>
        <cylinderGeometry args={[0.37, 0.37, 0.05, 24]} />
        <meshStandardMaterial color={c.cobertura} />
      </mesh>
      <Vela pos={[-0.08, 1.15, -0.38]} acesa={acesa} s={s} cor={c.vela} digito="3" />
      <Vela pos={[0.08, 1.15, -0.38]} acesa={acesa} s={s + 0.4} cor={c.vela} digito="1" />
      {/* fumacinha depois do sopro */}
      {acesa < 1 &&
        [0, 1].map((i) => {
          const k = entre(t, sopro + 0.05, sopro + 0.9);
          return (
            <mesh key={i} position={[(i ? 0.08 : -0.08) + Math.sin(k * 6) * 0.03, 1.45 + k * 0.4, -0.38]} scale={0.03 + k * 0.05}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial color="#d9d9d9" transparent opacity={(1 - k) * 0.6} depthWrite={false} />
            </mesh>
          );
        })}
      {/* gente batendo palma ao redor, na penumbra */}
      {[-1.4, -0.7, 0.7, 1.4].map((x, i) => (
        <Bloco
          key={x}
          v={FIGURANTE(i + n * 3)}
          pos={[x, 0, -1.6 - Math.abs(x) * 0.2]}
          giroY={-x * 0.3}
          frame={frame + i * 7}
          e={{ boca: "aberta", abertura: 0.6, sobrancelha: 0.5 }}
          p={{ cotoveloDentro: 0.7, bracoE: [-0.9, 0], bracoD: [-0.9, 0], cotoveloE: -1.2 + Math.sin(s * 14 + i) * 0.25, cotoveloD: -1.2 - Math.sin(s * 14 + i) * 0.25 }}
        />
      ))}
      {/* bandeirolas */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-2 + i * 0.36, 2.6 - Math.sin((i / 11) * Math.PI) * 0.3, -2.4]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.12, 0.22, 3]} />
          <meshStandardMaterial color={["#ff4fa3", "#ffd23f", "#3a86ff", "#06d6a0"][i % 4]} emissive={["#ff4fa3", "#ffd23f", "#3a86ff", "#06d6a0"][i % 4]} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </Palco>
  );
};

// "Já cansou de bolo." — chapéu de festa, queixo na mão, cara de quem já viu isso 400 vezes
export const PlanoCansado: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#1b1226" sombras>
    <CameraLenta de={[0.65, 1.85, 3.3]} para={[0.5, 1.8, 2.9]} alvo={[0.1, 1.7, -0.3]} x={t / dur} fov={40} />
    <ambientLight intensity={0.35} color="#ffd1ec" />
    <pointLight position={[0, 1.6, 0.8]} intensity={1.6} color="#ffb347" />
    <directionalLight position={[-3, 3, 2]} intensity={0.8} color="#b18cff" />
    <mesh position={[0, 0.85, 0.2]}>
      <boxGeometry args={[2.2, 0.06, 1.0]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    <mesh position={[0.45, 1.0, 0.35]}>
      <cylinderGeometry args={[0.28, 0.28, 0.24, 20]} />
      <meshStandardMaterial color="#f6b6c8" />
    </mesh>
    <Bloco
      v={ICARO}
      pos={[0, -0.13, -0.45]}
      frame={frame}
      e={{ sobrancelha: -0.35, boca: "neutra", olhosFechados: t > 1.2 && t < 1.45 }}
      p={{ sentado: true, curvado: 0.25, bracoD: [-1.75, 0.15], cotoveloD: -2.1, cotoveloDentro: 0.3, bracoE: [-0.9, 0.1], cotoveloE: -0.6, cabeca: [0.12, 0.3] }}
    />
    <ChapeuFesta pos={[0.0, 2.12, -0.18]} inclina={0.35} />
    {/* confete caindo devagar */}
    {Array.from({ length: 30 }, (_, i) => {
      const y = 3 - ((t * 0.5 + random(`cf${i}`) * 3) % 3);
      return (
        <mesh key={i} position={[(random(`cfx${i}`) - 0.5) * 3, y, (random(`cfz${i}`) - 0.5) * 1.5]} rotation={[t * 2 + i, i, t]}>
          <planeGeometry args={[0.04, 0.025]} />
          <meshBasicMaterial color={["#ff4fa3", "#ffd23f", "#3a86ff", "#06d6a0"][i % 4]} side={THREE.DoubleSide} />
        </mesh>
      );
    })}
  </Palco>
);
