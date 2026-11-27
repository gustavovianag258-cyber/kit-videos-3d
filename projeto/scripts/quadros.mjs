// Renderiza vários quadros de uma composição reaproveitando o mesmo navegador.
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
const [, , serve, comp, pasta, escala, ...frames] = process.argv;
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl: serve, id: comp, puppeteerInstance: browser, timeoutInMilliseconds: 180000 });
for (const f of frames) {
  await renderStill({ composition, serveUrl: serve, frame: Number(f), output: `${pasta}/q${String(f).padStart(4, "0")}.jpeg`, imageFormat: "jpeg", scale: Number(escala), puppeteerInstance: browser, timeoutInMilliseconds: 180000 });
  process.stdout.write(".");
}
await browser.close({ silent: true });
console.log("ok");
