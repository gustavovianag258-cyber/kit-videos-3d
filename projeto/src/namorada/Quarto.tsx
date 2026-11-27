import { useMemo } from "react";
import * as THREE from "three";
import { Bloco, GABRIEL } from "./Bloco";
import { CameraLenta, entre, Palco, texturaCanvas, type PropsPlano } from "./comum";

// Quarto do Gabriel: parede azul-roxa, quadro amarelo, cama de lençol vermelho.
// À noite só a tela do celular ilumina o rosto; no final é dia.

const PAREDE = "#4b3c94";

const texturaQuadro = () =>
  texturaCanvas(256, 192, (ctx) => {
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(0, 0, 256, 192);
    ctx.fillStyle = "#2f6fd6";
    ctx.fillRect(30, 40, 90, 110);
    ctx.fillStyle = "#ff6b35";
    ctx.beginPath();
    ctx.arc(175, 85, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(140, 140, 90, 14);
  });

const texturaPiso = () =>
  texturaCanvas(
    256,
    256,
    (ctx) => {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#7a5232" : "#86603b";
        ctx.fillRect(0, i * 32, 256, 32);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, i * 32, 256, 2);
        ctx.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32);
      }
    },
    [3, 3],
  );

const Quarto: React.FC<{ dia?: boolean }> = ({ dia = false }) => {
  const quadro = useMemo(texturaQuadro, []);
  const piso = useMemo(texturaPiso, []);
  return (
    <group>
      {/* piso e paredes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={piso} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2, -2]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={PAREDE} roughness={0.9} />
      </mesh>
      <mesh position={[-2.6, 2, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color="#3e3180" roughness={0.9} />
      </mesh>
      {/* rodapé */}
      <mesh position={[0, 0.06, -1.98]}>
        <boxGeometry args={[8, 0.12, 0.03]} />
        <meshStandardMaterial color="#e8e2f5" />
      </mesh>
      {/* quadro amarelo */}
      <group position={[0.75, 2.05, -1.97]}>
        <mesh>
          <boxGeometry args={[1.2, 0.92, 0.05]} />
          <meshStandardMaterial color="#1c1c1c" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.08, 0.8]} />
          <meshStandardMaterial map={quadro} roughness={0.6} />
        </mesh>
      </group>
      {/* janela na parede da esquerda */}
      <group position={[-2.58, 1.8, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.3, 1.1, 0.06]} />
          <meshStandardMaterial color="#e8e2f5" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.15, 0.95]} />
          <meshBasicMaterial color={dia ? "#9fd3ff" : "#0d1640"} toneMapped={false} />
        </mesh>
        {!dia && (
          <mesh position={[0.3, 0.22, 0.04]}>
            <circleGeometry args={[0.09, 24]} />
            <meshBasicMaterial color="#fff6d5" toneMapped={false} />
          </mesh>
        )}
      </group>
      {/* cama encostada na parede do fundo */}
      <group position={[0.1, 0, -1.05]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.4, 1.5]} />
          <meshStandardMaterial color="#5b3a22" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.16, 1.42]} />
          <meshStandardMaterial color="#c8202c" roughness={0.85} />
        </mesh>
        <mesh position={[-0.82, 0.6, 0]} castShadow>
          <boxGeometry args={[0.45, 0.14, 0.9]} />
          <meshStandardMaterial color="#f3f0ea" roughness={0.9} />
        </mesh>
        <mesh position={[-1.12, 0.65, 0]}>
          <boxGeometry args={[0.08, 1.3, 1.5]} />
          <meshStandardMaterial color="#4a2e1a" roughness={0.8} />
        </mesh>
      </group>
      {/* criado-mudo e abajur */}
      <group position={[1.75, 0, -1.55]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.5]} />
          <meshStandardMaterial color="#d9c7a3" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.14, 0.2, 0.28, 6]} />
          <meshStandardMaterial color="#fff2c8" emissive="#ffcf70" emissiveIntensity={dia ? 0 : 0.15} />
        </mesh>
      </group>
    </group>
  );
};

const LuzNoite: React.FC<{ celular: [number, number, number]; forca?: number }> = ({ celular, forca = 1 }) => (
  <>
    <ambientLight intensity={0.16} color="#7f8cff" />
    <directionalLight position={[-4, 3, 1]} intensity={0.55} color="#6f86ff" />
    <pointLight position={celular} intensity={2.4 * forca} distance={2.4} decay={1.4} color="#cfe6ff" />
  </>
);

const LuzDia: React.FC = () => (
  <>
    <ambientLight intensity={0.7} color="#fff3e0" />
    <directionalLight position={[-3, 4, 4]} intensity={2.2} color="#ffe2b8" castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[2, 2.5, 2]} intensity={1.5} color="#c9dcff" />
  </>
);

// Sentado na beira da cama, curvado, olhando o celular
const GabrielNoCelular: React.FC<{ frame: number; espanto?: number; curvado?: number }> = ({ frame, espanto = 0, curvado = 0.4 }) => (
  <Bloco
    v={GABRIEL}
    pos={[0.2, -0.125, -0.5]}
    frame={frame}
    e={{ sobrancelha: espanto ? 1 : -0.2, espanto, boca: espanto ? "aberta" : "neutra", abertura: espanto }}
    p={{
      sentado: true,
      curvado,
      bracoE: [-0.45, 0.05],
      bracoD: [-0.45, 0.05],
      cotoveloE: -1.25,
      cotoveloD: -1.25,
      cotoveloDentro: 0.55,
      cabeca: [espanto ? -0.05 : 0.55, 0],
      celular: true,
      telaAcesa: 1,
    }}
  />
);

export const PlanoQuarto: React.FC<PropsPlano & { variante: "amplo" | "perto" | "chat" }> = ({ t, dur, frame, variante }) => {
  const x = t / dur;
  return (
    <Palco fundo="#05051a" sombras>
      {variante === "amplo" && <CameraLenta de={[1.9, 1.9, 4.4]} para={[1.5, 1.8, 3.7]} alvo={[0.2, 1.1, -0.5]} x={x} fov={42} />}
      {variante === "perto" && <CameraLenta de={[1.5, 1.75, 2.45]} para={[1.25, 1.7, 2.1]} alvo={[0.2, 1.35, -0.2]} x={x} fov={40} />}
      {variante === "chat" && <CameraLenta de={[-1.2, 1.5, 2.8]} para={[-1.0, 1.5, 2.4]} alvo={[0.2, 1.2, -0.4]} x={x} fov={40} />}
      <LuzNoite celular={[0.2, 1.35, 0.15]} />
      <Quarto />
      <GabrielNoCelular frame={frame} />
    </Palco>
  );
};

// "Aceito." — close no rosto: olhos arregalados, boca aberta
export const PlanoChoque: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const susto = entre(t, 0, 0.12);
  return (
    <Palco fundo="#05051a">
      <CameraLenta de={[0.2, 1.72, 1.6]} para={[0.2, 1.72, 1.35]} alvo={[0.2, 1.62, -0.45]} x={t / dur} treme={0.004} s={s} fov={40} />
      <LuzNoite celular={[0.2, 1.3, 0.05]} forca={1.6} />
      <Quarto />
      <GabrielNoCelular frame={frame} espanto={susto} curvado={0.05} />
    </Palco>
  );
};

// Deitado, celular acima do rosto, sorrindo bobo e digitando
export const PlanoDeitado: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#05051a" sombras>
    <CameraLenta de={[-0.1, 2.75, 0.25]} para={[-0.25, 2.5, -0.05]} alvo={[-0.6, 0.95, -1.05]} x={t / dur} fov={42} rolo={1.3} />
    <LuzNoite celular={[-0.55, 1.35, -1.05]} forca={1.3} />
    <Quarto />
    <group position={[1.15, 0.72, -1.05]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
      <Bloco
        v={GABRIEL}
        frame={frame}
        e={{ sobrancelha: 0.45, boca: "sorriso" }}
        p={{
          bracoE: [-1.1, 0.3],
          bracoD: [-1.1 + Math.sin(frame * 1.7) * 0.03, 0.05],
          cotoveloE: -0.95,
          cotoveloD: -0.95,
          celular: true,
          telaAcesa: 1,
          cabeca: [-0.1, 0],
        }}
      />
    </group>
  </Palco>
);

// ---------- Final: sentado de frente, sério; a medalha cai no peito ----------
const Medalha: React.FC<{ y: number; giro: number; brilho: number }> = ({ y, giro, brilho }) => {
  const estrela = useMemo(() => {
    const f = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.045 : 0.1;
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      if (i === 0) f.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else f.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    f.closePath();
    return new THREE.ExtrudeGeometry(f, { depth: 0.02, bevelEnabled: false });
  }, []);
  return (
    <group position={[0, y, 0]} rotation={[0, 0, giro]}>
      {/* fita vermelha e azul subindo até o pescoço */}
      <mesh position={[-0.09, 0.26, -0.02]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.1, 0.5, 0.012]} />
        <meshStandardMaterial color="#d62828" />
      </mesh>
      <mesh position={[0.09, 0.26, -0.02]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.1, 0.5, 0.012]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.035, 32]} />
        <meshStandardMaterial color="#f5c518" metalness={0.85} roughness={0.25} emissive="#f5c518" emissiveIntensity={0.15 + brilho * 0.5} />
      </mesh>
      <mesh geometry={estrela} position={[0, 0, 0.012]}>
        <meshStandardMaterial color="#fff1a8" metalness={0.7} roughness={0.25} emissive="#ffdd55" emissiveIntensity={0.3 + brilho * 0.6} />
      </mesh>
    </group>
  );
};

export const PlanoSentado: React.FC<PropsPlano & { variante: "serio" | "medalha" | "medalhaPerto" }> = ({ t, dur, frame, variante }) => {
  const x = t / dur;
  // a medalha cai e quica no peito
  const queda = variante === "medalha" ? entre(t, 0.15, 0.6) : 1;
  const quique = variante === "medalha" ? Math.max(0, Math.sin(entre(t, 0.6, 1.0) * Math.PI) * 0.06) : 0;
  const yMedalha = 1.12 + (1 - queda * queda) * 2.4 + quique;
  const orgulho = variante === "medalhaPerto" ? 1 : variante === "medalha" ? entre(t, 0.8, 1.2) : 0;
  return (
    <Palco fundo="#1a1440" sombras>
      {variante === "serio" && <CameraLenta de={[0.2, 1.55, 3.4]} para={[0.2, 1.6, 2.7]} alvo={[0.2, 1.45, -0.4]} x={x} fov={40} />}
      {variante === "medalha" && <CameraLenta de={[0.2, 1.6, 2.6]} para={[0.2, 1.62, 2.25]} alvo={[0.2, 1.45, -0.4]} x={x} fov={40} />}
      {variante === "medalhaPerto" && <CameraLenta de={[0.45, 1.55, 1.6]} para={[0.3, 1.58, 1.25]} alvo={[0.2, 1.48, -0.35]} x={x} fov={40} />}
      <LuzDia />
      <Quarto dia />
      <Bloco
        v={GABRIEL}
        pos={[0.2, -0.125, -0.5]}
        frame={frame}
        e={{ sobrancelha: orgulho ? -0.2 + orgulho * 0.3 : -0.85, boca: orgulho > 0.5 ? "meioSorriso" : "neutra" }}
        p={{ sentado: true, curvado: 0.04, bracoE: [-0.35, 0.1], bracoD: [-0.35, 0.1], cotoveloE: -0.6, cotoveloD: -0.6, cabeca: [0.02 - orgulho * 0.08, 0] }}
      />
      {variante !== "serio" && (
        <group position={[0.2, 0, -0.29]}>
          <Medalha y={yMedalha - 0.125} giro={Math.sin(t * 3) * 0.05 * (1 - queda * 0.6)} brilho={0.5 + 0.5 * Math.sin(t * 5)} />
        </group>
      )}
    </Palco>
  );
};
