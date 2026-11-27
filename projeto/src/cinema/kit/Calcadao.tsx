import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { Hora, ehNoite } from "./Luz";
import { Carro, Letreiro, Morro, Poste, escolher, materialPredio, texturaCanvas } from "./Pecas";
import { Areia, Coqueiro, Gaivotas, GuardaSol, Mar } from "./Praia";

const LOJAS_CALCADAO: [string, string][] = [
  ["PADARIA", "PÃO QUENTINHO"],
  ["ÓTICA", "LENTES EM 1 HORA"],
  ["CÂMBIO", "DÓLAR · EURO"],
  ["RESTAURANTE", "COMIDA CASEIRA"],
  ["FARMÁCIA", "24 HORAS"],
  ["SORVETERIA", "AÇAÍ · SORVETE"],
];

const texturaToldo = (a: string, b: string) =>
  texturaCanvas(256, 64, (ctx) => {
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? a : b;
      ctx.fillRect((i * 256) / 10, 0, 256 / 10 + 1, 64);
    }
  });

// fachada de loja simples no térreo de um prédio da orla: toldo listrado + letreiro legível
const Fachada: React.FC<{ x: number; l: number; nome: string; sub: string; semente: string }> = ({ x, l, nome, sub, semente }) => {
  const [a, b] = escolher([["#e63946", "#f4f1ea"], ["#2a9d8f", "#f4f1ea"], ["#f2c230", "#1d3557"], ["#1d4ed8", "#f4f1ea"]] as const, `${semente}tc`);
  const toldo = useMemo(() => new THREE.MeshStandardMaterial({ map: texturaToldo(a, b), roughness: 0.85, side: THREE.DoubleSide }), [a, b]);
  return (
    <group position={[x, 0, 52.2]}>
      <mesh position={[0, 3.1, 0.3]} rotation={[0.5, 0, 0]} castShadow material={toldo}>
        <planeGeometry args={[Math.min(l - 0.6, 5), 1.1]} />
      </mesh>
      <Letreiro pos={[0, 3.9, -0.05]} texto={nome} fundo={b} cor={a} largura={Math.min(l - 1, 4.4)} aceso />
      <mesh position={[0, 2, -0.1]}>
        <planeGeometry args={[Math.min(l - 0.8, 4.6), 2.3]} />
        <meshStandardMaterial color="#223042" roughness={0.3} metalness={0.1} />
      </mesh>
      <Letreiro pos={[0, 1.1, -0.05]} texto={sub} fundo="#f4f1ea" cor="#333" largura={Math.min(l - 1.2, 3.6)} />
    </group>
  );
};

// ORLA COM CALÇADÃO (Copacabana/Ipanema/Boa Viagem): praia ao longo do eixo x.
// Mar z < -7 · areia -8…28 · calçadão de ondas 28…34 · ciclovia 34…36 · avenida 36…48 ·
// calçada dos prédios 48…52 · prédios da orla a partir de z = 52. Morro no fim (x negativo).

// pedra portuguesa: faixas pretas onduladas sobre o branco (as ondas correm paralelas à praia)
const texturaOndas = () =>
  texturaCanvas(
    512,
    512,
    (ctx) => {
      ctx.fillStyle = "#efebe3";
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = "#1e1e1e";
      for (let k = -1; k < 5; k++) {
        ctx.beginPath();
        const y0 = k * 128;
        for (let x = 0; x <= 512; x += 4) ctx.lineTo(x, y0 + 30 * Math.sin((x / 512) * Math.PI * 2));
        for (let x = 512; x >= 0; x -= 4) ctx.lineTo(x, y0 + 62 + 30 * Math.sin((x / 512) * Math.PI * 2));
        ctx.closePath();
        ctx.fill();
      }
      // textura das pedrinhas
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = `rgba(${random(`p${i}`) < 0.5 ? "0,0,0" : "255,255,255"},${0.05 + random(`q${i}`) * 0.08})`;
        const x = random(`x${i}`) * 512;
        const y = random(`y${i}`) * 512;
        ctx.fillRect(x, y, 3, 3);
      }
    },
    true,
  );

const Quiosque: React.FC<{ x: number; z: number; nome: string; noite: boolean }> = ({ x, z, nome, noite }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.6, 1.6, 2.6, 24]} />
      <meshStandardMaterial color="#f4f1ea" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.6, 0]}>
      <cylinderGeometry args={[1.62, 1.62, 1.0, 24, 1, true, -0.9, 1.8]} />
      <meshStandardMaterial color="#2c3a46" roughness={0.3} />
    </mesh>
    <mesh position={[0, 2.9, 0]} castShadow>
      <cylinderGeometry args={[2.6, 2.3, 0.35, 24]} />
      <meshStandardMaterial color="#e63946" roughness={0.7} />
    </mesh>
    <Letreiro pos={[0, 3.35, 2.2]} texto={nome} fundo="#ffffff" cor="#1d3557" largura={2.4} aceso={noite} />
    {/* mesas com guarda-sol */}
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 3.2, 0, 1.8]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.04, 18]} />
          <meshStandardMaterial color="#f4f4f4" />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.72, 6]} />
          <meshStandardMaterial color="#ccc" />
        </mesh>
        <GuardaSol pos={[0, 0, 0]} cor={l > 0 ? "#f2c230" : "#2a9d8f"} s={0} />
      </group>
    ))}
    {noite && <pointLight position={[0, 2.6, 2.4]} color="#ffd59a" intensity={30} distance={10} />}
  </group>
);

export const Calcadao: React.FC<{ hora: Hora; s: number; semente?: string; morro?: boolean }> = ({ hora, s, semente = "orla", morro = true }) => {
  const noite = ehNoite(hora);
  const ondas = useMemo(texturaOndas, []);
  ondas.repeat.set(400 / 6, 1);
  const CORES = ["#f4efe6", "#f2d9c0", "#e3ebf2", "#fff7e4", "#e9e2d0", "#f6e1d3"] as const;
  const mats = useMemo(
    () =>
      CORES.map((c) => {
        const m = materialPredio(noite, { andar: 3, vao: 2.4 });
        m.color.set(c);
        return m;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [noite],
  );
  const predios = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        x: -240 + i * 14 + random(`${semente}px${i}`) * 3,
        l: 11 + random(`${semente}pl${i}`) * 4,
        h: 18 + random(`${semente}ph${i}`) ** 1.5 * 36,
        cor: Math.floor(random(`${semente}pc${i}`) * 6),
      })),
    [semente],
  );
  return (
    <group>
      <Mar s={s} />
      <Areia />
      {/* calçadão de ondas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 31]} receiveShadow>
        <planeGeometry args={[400, 6]} />
        <meshStandardMaterial map={ondas} roughness={0.85} />
      </mesh>
      {/* mureta entre a areia e o calçadão */}
      <mesh position={[0, 0.12, 27.95]} receiveShadow>
        <boxGeometry args={[400, 0.24, 0.25]} />
        <meshStandardMaterial color="#e5e0d6" roughness={0.9} />
      </mesh>
      {/* ciclovia vermelha, avenida, canteiro e calçada dos prédios */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 35]} receiveShadow>
        <planeGeometry args={[400, 2]} />
        <meshStandardMaterial color="#b5483c" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 42]} receiveShadow>
        <planeGeometry args={[400, 12]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.85} />
      </mesh>
      {Array.from({ length: 60 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-200 + i * 7, 0.02, 42]}>
          <planeGeometry args={[3, 0.14]} />
          <meshStandardMaterial color="#f4f4f4" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 50]} receiveShadow>
        <planeGeometry args={[400, 4]} />
        <meshStandardMaterial map={ondas} color="#ddd" roughness={0.85} />
      </mesh>
      {/* prédios da orla (janelas acendem à noite); a cada 3 tem loja no térreo com toldo e letreiro */}
      {predios.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, 58]} material={mats[p.cor]} castShadow receiveShadow>
          <boxGeometry args={[p.l, p.h, 12]} />
        </mesh>
      ))}
      {predios
        .filter((_, i) => i % 3 === 1)
        .map((p, i) => <Fachada key={`f${i}`} x={p.x} l={p.l} nome={LOJAS_CALCADAO[i % LOJAS_CALCADAO.length][0]} sub={LOJAS_CALCADAO[i % LOJAS_CALCADAO.length][1]} semente={`${semente}fa${i}`} />)}
      {/* coqueiros e quiosques no calçadão, postes do lado da areia */}
      {Array.from({ length: 16 }, (_, i) => (
        <Coqueiro key={i} pos={[-120 + i * 15 + random(`${semente}cq${i}`) * 4, 0, 29 + random(`${semente}cz${i}`) * 1.5]} s={s} h={7 + random(`${semente}ch${i}`) * 3} inclina={0.15 + random(`${semente}ci${i}`) * 0.2} giro={random(`${semente}cg${i}`) * 6} />
      ))}
      {[-60, -18, 24, 70].map((x, i) => (
        <Quiosque key={x} x={x} z={30.5} nome={["COCO GELADO", "QUIOSQUE", "ÁGUA DE COCO", "AÇAÍ"][i]} noite={noite} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <Poste key={i} pos={[-130 + i * 20, 0, 34.2]} giroY={Math.PI} aceso={noite} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <Carro key={i} pos={[-80 + ((i * 23 + s * (i % 2 ? 9 : -9)) % 180), 0, i % 2 ? 39.5 : 44.5]} giroY={i % 2 ? Math.PI / 2 : -Math.PI / 2} semente={`${semente}car${i}`} farolAceso={noite} />
      ))}
      {/* guarda-sóis na areia — bem densos e variados, igual a praia cheia de domingo */}
      {Array.from({ length: 70 }, (_, i) => (
        <GuardaSol
          key={i}
          pos={[-120 + (i % 25) * 10 + random(`${semente}gx${i}`) * 4, 0, 2 + Math.floor(i / 25) * 7.5 + random(`${semente}gz${i}`) * 4]}
          cor={escolher(["#e63946", "#2a9d8f", "#f4a261", "#1d4ed8", "#ffbe0b", "#8338ec", "#ff6fa5", "#06d6a0"] as const, `${semente}gc${i}`)}
          listrado={random(`${semente}gl${i}`) < 0.6}
          s={s} />
      ))}
      {!noite && <Gaivotas s={s} />}
      {morro && (
        <>
          <Morro pos={[-330, 0, -30]} raio={50} altura={62} semente={`${semente}leme`} />
          <Morro pos={[230, 0, -40]} raio={70} altura={80} semente={`${semente}fim`} pedra={0.3} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 120]} receiveShadow>
        <planeGeometry args={[600, 140]} />
        <meshStandardMaterial color="#8c8273" roughness={1} />
      </mesh>
    </group>
  );
};
