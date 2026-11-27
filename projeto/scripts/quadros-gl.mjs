// Igual ao quadros.mjs, mas com a GPU ligada (--gl=angle), necessária nas cenas com muita sombra.
// Uso: node scripts/quadros-gl.mjs <bundle> <composição> <pasta> <escala> <quadro> <quadro> ...
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
const [, , serve, comp, pasta, escala, ...frames] = process.argv;
const chromiumOptions = { gl: "angle" };
const browser = await openBrowser("chrome", { chromiumOptions });
const composition = await selectComposition({ serveUrl: serve, id: comp, puppeteerInstance: browser, timeoutInMilliseconds: 180000, chromiumOptions });
for (const f of frames) {
  await renderStill({ composition, serveUrl: serve, frame: Number(f), output: `${pasta}/q${String(f).padStart(4, "0")}.jpeg`, imageFormat: "jpeg", scale: Number(escala), puppeteerInstance: browser, timeoutInMilliseconds: 180000, chromiumOptions });
  process.stdout.write(".");
}
await browser.close({ silent: true });
console.log("ok");
