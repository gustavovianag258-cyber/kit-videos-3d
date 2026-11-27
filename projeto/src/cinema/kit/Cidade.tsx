import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { Hora, ehNoite } from "./Luz";
import { Morro, materialPredio } from "./Pecas";

// CIDADE VISTA DE CIMA (drone / avião / "a cidade inteira"): quarteirões em grade em volta da origem,
// casas baixas de telhado laranja e prédios brancos/claros, ruas escuras com postes que brilham à
// noite, baía de um lado (x > metade) e morros. Escala real: quarteirão de 50 m, rua de 10 m.

const Q = 50;
const RUA = 10;

export const Cidade: React.FC<{ hora: Hora; quarteiroes?: number; semente?: string; baia?: boolean; s?: number }> = ({ hora, quarteiroes = 14, semente = "cidade", baia = true }) => {
  const noite = ehNoite(hora);
  const metade = (quarteiroes * (Q + RUA)) / 2;
  const { casas, predios, luzes } = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const casas = new THREE.InstancedMesh(geo, materialPredio(noite, { telhado: "#b4532a", andar: 3, vao: 2.4 }), 6000);
    const predios = new THREE.InstancedMesh(geo, materialPredio(noite, { telhado: "#9a958e", andar: 3, vao: 2.4 }), 2000);
    const m = new THREE.Matrix4();
    const cor = new THREE.Color();
    const CORES_CASA = ["#f2b5a0", "#f6d58e", "#9fd3c7", "#f4f1ea", "#c9e4ff", "#ffcfb0", "#e9dcc9"];
    const CORES_PREDIO = ["#f4efe6", "#e3ebf2", "#ece6dc", "#d9d4cc", "#fff7e4"];
    let nc = 0;
    let np = 0;
    const luzesPos: THREE.Vector3[] = [];
    for (let i = 0; i < quarteiroes; i++)
      for (let j = 0; j < quarteiroes; j++) {
        const cx = -metade + i * (Q + RUA) + RUA / 2 + Q / 2;
        const cz = -metade + j * (Q + RUA) + RUA / 2 + Q / 2;
        if (baia && cx > metade * 0.45) continue; // água
        const dist = Math.hypot(cx, cz) / metade;
        const centro = random(`${semente}c${i}${j}`) < 0.55 - dist * 0.35;
        // lotes em volta do quarteirão
        for (let a = 0; a < 4; a++)
          for (let k = 0; k < 5; k++) {
            const t = -Q / 2 + 5 + k * 10;
            const lx = a === 0 ? t : a === 1 ? Q / 2 - 7 : a === 2 ? -t : -Q / 2 + 7;
            const lz = a === 0 ? -Q / 2 + 7 : a === 1 ? t : a === 2 ? Q / 2 - 7 : -t;
            const r = random(`${semente}l${i}${j}${a}${k}`);
            if (centro && r < 0.35 && np < 2000) {
              const h = 15 + random(`${semente}h${i}${j}${a}${k}`) ** 1.5 * 55;
              m.compose(new THREE.Vector3(cx + lx, 0, cz + lz), new THREE.Quaternion(), new THREE.Vector3(10, h, 10));
              predios.setMatrixAt(np, m);
              predios.setColorAt(np, cor.set(CORES_PREDIO[Math.floor(r * 100) % CORES_PREDIO.length]));
              np++;
            } else if (nc < 6000) {
              const h = 3.4 + Math.floor(random(`${semente}a${i}${j}${a}${k}`) * 3) * 3;
              const w = 7 + random(`${semente}w${i}${j}${a}${k}`) * 2.5;
              m.compose(new THREE.Vector3(cx + lx, 0, cz + lz), new THREE.Quaternion(), new THREE.Vector3(w, h, w));
              casas.setMatrixAt(nc, m);
              casas.setColorAt(nc, cor.set(CORES_CASA[Math.floor(r * 100) % CORES_CASA.length]));
              nc++;
            }
          }
        // postes nas esquinas
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) luzesPos.push(new THREE.Vector3(cx + (dx * (Q + RUA / 2)) / 2, 7, cz + (dz * (Q + RUA / 2)) / 2));
      }
    casas.count = nc;
    predios.count = np;
    for (const im of [casas, predios]) {
      im.castShadow = true;
      im.receiveShadow = true;
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
    const luzes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.6, 8, 6), new THREE.MeshStandardMaterial({ color: "#ffd59a", emissive: "#ffb14a", emissiveIntensity: noite ? 8 : 0 }), luzesPos.length);
    luzesPos.forEach((p, i) => luzes.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)));
    return { casas, predios, luzes };
  }, [quarteiroes, semente, baia, noite, metade]);
  return (
    <group>
      {/* ruas (o chão todo) e calçadas dos quarteirões */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[metade * 4, metade * 4]} />
        <meshStandardMaterial color="#45464a" roughness={0.9} />
      </mesh>
      {Array.from({ length: quarteiroes * quarteiroes }, (_, n) => {
        const i = Math.floor(n / quarteiroes);
        const j = n % quarteiroes;
        const cx = -metade + i * (Q + RUA) + RUA / 2 + Q / 2;
        const cz = -metade + j * (Q + RUA) + RUA / 2 + Q / 2;
        if (baia && cx > metade * 0.45) return null;
        return (
          <mesh key={n} rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.05, cz]} receiveShadow>
            <planeGeometry args={[Q, Q]} />
            <meshStandardMaterial color="#b9b2a6" roughness={0.95} />
          </mesh>
        );
      })}
      <primitive object={casas} />
      <primitive object={predios} />
      <primitive object={luzes} />
      {baia && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[metade * 0.45 + metade * 1.2, 0.08, 0]}>
          <planeGeometry args={[metade * 2.4, metade * 6]} />
          <meshPhysicalMaterial color="#2e6f8e" roughness={0.08} clearcoat={1} envMapIntensity={1.2} />
        </mesh>
      )}
      <Morro pos={[metade * 0.75, 0, -metade * 0.4]} raio={60} altura={180} semente={`${semente}pao`} pedra={0.9} />
      <Morro pos={[-metade * 1.1, 0, -metade * 0.9]} raio={metade * 0.5} altura={240} semente={`${semente}m1`} />
      <Morro pos={[-metade * 0.3, 0, -metade * 1.3]} raio={metade * 0.45} altura={200} semente={`${semente}m2`} pedra={0.3} />
    </group>
  );
};
