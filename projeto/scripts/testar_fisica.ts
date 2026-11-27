// Confere os números do módulo de física (roda fora do vídeo).
import { orbitaNoDisco, perfilAguaEquilibrio, setasNaSuperficie } from "../src/v2/fisica";

const graus = (rad: number) => ((rad * 180) / Math.PI).toFixed(1);
console.log("SETAS (x, y) -> inclinação em relação à vertical, intensidade relativa");
for (const s of setasNaSuperficie()) {
  const inclinacao = Math.atan2(Math.abs(s.dx), Math.abs(s.dy));
  console.log(
    `x=${s.x.toFixed(2).padStart(5)} y=${s.y.toFixed(3)}  dir=(${s.dx.toFixed(2)}, ${s.dy.toFixed(2)})  ` +
      `inclinação=${graus(inclinacao).padStart(5)}°  intensidade=${s.intensidade.toFixed(2)}`,
  );
}
console.log("\nÁGUA EM EQUILÍBRIO (r -> altura relativa)");
console.log(perfilAguaEquilibrio().filter((_, i) => i % 5 === 0).map((a) => `r=${a.r.toFixed(2)} h=${a.h.toFixed(4)}`).join("\n"));
const o = orbitaNoDisco();
const raios = o.map((p) => Math.hypot(p[0], p[1], p[2]));
console.log(`\nÓRBITA: ${o.length} pontos, raio min=${Math.min(...raios).toFixed(2)} max=${Math.max(...raios).toFixed(2)}`);
