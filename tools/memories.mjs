// Convierte las fotos de los recuerdos a assets/memories/nivelN.jpg (reduce tamaño y corrige giro).
//   node tools/memories.mjs origen1 origen2 origen3 origen4 origen5   (rotación en grados con ":90", ":-90" o ":180")
import { chromium } from 'playwright';
import fs from 'node:fs';
const args = process.argv.slice(2);
const b = await chromium.launch(); const page = await b.newPage();
for (let i = 0; i < args.length; i++) {
  const [src, rotS] = args[i].split(/:(?=-?\d+$)/); const rot = Number(rotS || 0);
  const ext = src.split('.').pop().toLowerCase(), mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const data = `data:${mime};base64,` + fs.readFileSync(src).toString('base64');
  const out = await page.evaluate(async ([data, rot]) => {
    const img = new Image(); img.src = data; await img.decode();
    const q = (Math.abs(rot) / 90) % 2 === 1;
    let w = q ? img.naturalHeight : img.naturalWidth, h = q ? img.naturalWidth : img.naturalHeight;
    const k = Math.min(1, 1100 / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
    const g = c.getContext('2d'); g.translate(c.width / 2, c.height / 2); g.rotate(rot * Math.PI / 180); g.scale(k, k);
    g.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    return c.toDataURL('image/jpeg', 0.84);
  }, [data, rot]);
  fs.writeFileSync(`assets/memories/nivel${i + 1}.jpg`, Buffer.from(out.split(',')[1], 'base64'));
  console.log(`nivel${i + 1}.jpg <- ${src} (giro ${rot})`);
}
await b.close();
