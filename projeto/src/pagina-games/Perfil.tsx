import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, staticFile, useDelayRender } from "remotion";
import { Acabamento, PalcoCinema } from "../cinema/Palco";
import * as THREE from "three";
import { Camera } from "./Estudio";
import { Mascote3D } from "./Mascote3D";

// Foto de perfil da Fase Extra: o Vyce em close, centralizado para o recorte redondo do Instagram e do TikTok.
// "a": fundo roxo com anel neon. "b": fundo rosa e roxo.
// "c" e "d": versão Vice City em alta qualidade, com fundo das capturas oficiais da Rockstar
// (letreiro VICE ao pôr do sol e perseguição na marina à noite).
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";

const Cena: React.FC<{ modelo: "a" | "b" }> = ({ modelo }) => (
  <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
    <Camera pos={modelo === "a" ? [0.14, 1.66, 1.32] : [-0.16, 1.64, 1.34]} alvo={[0, 1.56, 0]} />
    <hemisphereLight args={["#C9B6FF", "#1A1030", 1.0]} />
    <directionalLight position={[-1.0, 2.4, 2.4]} intensity={2.8} color="#F6EEFF" />
    <pointLight position={[1.1, 1.8, 0.7]} intensity={7} color={ROSA} distance={4} />
    <pointLight position={[-1.2, 1.5, 0.4]} intensity={6} color="#5B6CFF" distance={4} />
    {modelo === "a" ? (
      <Mascote3D giro={-0.12} pose={{ bracoE: [0.02, 0, -0.12], cotoveloE: 0.3, cabeca: [0.04, 0.12, 0.06] }} boca={0} olhar={0.3} sorriso />
    ) : (
      <Mascote3D giro={0.15} pose={{ bracoE: [0.02, 0, -0.12], cotoveloE: 0.35, cabeca: [0.08, -0.12, -0.08] }} boca={0} olhar={-0.4} sorriso />
    )}
  </ThreeCanvas>
);

const FUNDO = { c: "fase-extra/perfil/fundo-por-do-sol.jpg", d: "fase-extra/perfil/fundo-noite.jpg" };

// imagem como textura, liberando o quadro só depois de desenhar (mesmo cuidado do monitor do SetupGamer)
const useImagem = (src: string) => {
  const { advance } = useThree();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const tex = useMemo(() => {
    const t = new THREE.Texture();
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useLayoutEffect(() => {
    const h = delayRender("fundo da foto");
    const img = new Image();
    img.onload = () => {
      tex.image = img;
      tex.needsUpdate = true;
      advance(performance.now());
      requestAnimationFrame(() => {
        advance(performance.now());
        continueRender(h);
      });
    };
    img.onerror = () => cancelRender(new Error("fundo não carregou: " + src));
    img.src = src;
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps
  return tex;
};

const Fundo: React.FC<{ src: string; x: number; y: number }> = ({ src, x, y }) => {
  const tex = useImagem(src);
  return (
    <mesh position={[x, y, -4.2]}>
      <planeGeometry args={[7.2, 4.05]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

// versão Vice City em alta qualidade: luz de cinema com HDRI, fundo dentro da cena com desfoque de lente,
// brilho, vinheta e granulado. Render com --scale=2 e redução depois (bordas lisas).
export const FotoPerfilVice: React.FC<{ modelo: "c" | "d" }> = ({ modelo }) => {
  const c = modelo === "c";
  const cam: [number, number, number] = c ? [0.16, 1.63, 1.45] : [-0.15, 1.63, 1.45];
  return (
    <AbsoluteFill style={{ background: "#12072A" }}>
      <PalcoCinema ceu="estudio" fundo="#12072A" fov={30} luzCeu={0.55} brilhoCeu={0}>
        <Camera pos={cam} alvo={[0, 1.5, 0]} />
        <Fundo src={staticFile(FUNDO[modelo])} x={c ? 0.2 : 0.9} y={c ? 2.15 : 1.75} />
        {/* anel neon atrás da cabeça, entre o fundo e o Vyce (marca da página) */}
        <mesh position={[0, 1.5, -0.45]} rotation={[0, Math.atan2(cam[0], cam[2] + 0.45), 0]}>
          <torusGeometry args={[0.31, 0.01, 16, 128]} />
          <meshStandardMaterial color={c ? "#FFB3EE" : ROXO} emissive={c ? "#FF8BE0" : ROXO} emissiveIntensity={3.2} toneMapped={false} />
        </mesh>
        {/* luz principal de softbox, contra-luz com a cor do fundo e preenchimento suave */}
        <directionalLight position={[-1.2, 2.6, 2.6]} intensity={2.4} color="#FFF4EC" castShadow />
        <pointLight position={[1.1, 2.0, -0.7]} intensity={10} color={c ? "#FF9A5A" : ROSA} distance={4} />
        <pointLight position={[-1.2, 1.8, -0.6]} intensity={9} color={c ? ROSA : "#4FB8FF"} distance={4} />
        <pointLight position={[0.5, 1.5, 1.2]} intensity={2.2} color="#E9DDFF" distance={3} />
        <Mascote3D giro={c ? -0.16 : 0.16} pose={{ bracoE: [0.02, 0, -0.12], cotoveloE: 0.3, bracoD: [0.02, 0, 0.12], cotoveloD: 0.3, cabeca: c ? [0.03, 0.14, 0.06] : [0.05, -0.13, -0.07] }} boca={0} olhar={c ? 0.25 : -0.25} sorriso />
        <Acabamento foco={Math.hypot(cam[0], cam[1] - 1.62, cam[2])} desfoque={6} brilho={0.9} saturacao={0.14} contraste={0.12} vinheta={0.5} ao={0} />
      </PalcoCinema>
    </AbsoluteFill>
  );
};

export const FotoPerfil: React.FC<{ modelo: "a" | "b" }> = ({ modelo }) => (
  <AbsoluteFill
    style={{
      background:
        modelo === "a"
          ? "radial-gradient(circle at 50% 42%, #5A2BB8 0%, #2A1060 45%, #12072A 75%)"
          : "radial-gradient(circle at 50% 40%, #FF5FD6 0%, #8E2BD9 45%, #2A0D5C 80%)",
    }}
  >
    {/* anel neon atrás da cabeça */}
    <div style={{ position: "absolute", left: 140, top: 110, width: 800, height: 800, borderRadius: "50%", border: `16px solid ${modelo === "a" ? ROXO : "#FFE0FA"}`, boxShadow: `0 0 60px ${modelo === "a" ? ROXO : ROSA}, inset 0 0 60px ${modelo === "a" ? ROXO : ROSA}`, opacity: 0.9 }} />
    {/* brilhos */}
    {new Array(18).fill(0).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 120 + ((i * 197) % 840), top: 90 + ((i * 331) % 860), width: 8 + (i % 3) * 5, height: 8 + (i % 3) * 5, borderRadius: "50%", background: i % 2 ? ROSA : "#E9D5FF", boxShadow: `0 0 14px ${i % 2 ? ROSA : ROXO}`, opacity: 0.8 }} />
    ))}
    <Cena modelo={modelo} />
  </AbsoluteFill>
);
