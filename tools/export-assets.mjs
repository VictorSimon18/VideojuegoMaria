// Regenera los PNG de sprites (assets/sprites) y los iconos PWA (assets/icons).
// Uso (desde la raíz del repo, con Playwright instalado):  node tools/export-assets.mjs
import { webkit } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../tests/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const save = (rel, dataUrl) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('escrito', rel);
};

const { server, port } = await startServer(0);
const browser = await webkit.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/tools/export.html`);
await page.waitForFunction(() => window.__ready);
save('assets/sprites/maria.png', await page.evaluate(() => window.__export.maria()));
save('assets/sprites/victor.png', await page.evaluate(() => window.__export.victor()));
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180]]) {
  save(`assets/icons/${name}.png`, await page.evaluate((s) => window.__export.icon(s), size));
}
await browser.close();
server.close();
