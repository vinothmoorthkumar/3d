// Optimises source assets in assets-src/ into web-ready files in public/.
// Textures: resized JPEGs (4K desktop / 2K mobile). Photos: responsive WebP sizes.
// Run: npm run assets
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import fs from 'node:fs';

const src = (p) => new URL(`../assets-src/${p}`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const out = (p) => new URL(`../public/${p}`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

await mkdir(out('textures'), { recursive: true });
await mkdir(out('images'), { recursive: true });

const tex = [
  ['textures/8k_earth_daymap.jpg', 'textures/earth-day-4k.jpg', 4096, 84],
  ['textures/2k_earth_daymap.jpg', 'textures/earth-day-2k.jpg', 2048, 84],
  ['textures/2k_earth_nightmap.jpg', 'textures/earth-night-2k.jpg', 2048, 80],
  ['textures/2k_earth_clouds.jpg', 'textures/earth-clouds-2k.jpg', 2048, 78, true],
  ['textures/2k_earth_specular_map.tif', 'textures/earth-specular-1k.jpg', 1024, 80, true],
  ['textures/2k_earth_normal_map.tif', 'textures/earth-normal-2k.jpg', 2048, 86],
];
for (const [from, to, w, q, grey] of tex) {
  let img = sharp(src(from)).resize(w, w / 2);
  if (grey) img = img.greyscale();
  await img.jpeg({ quality: q, mozjpeg: true }).toFile(out(to));
  console.log('texture', to);
}

// Static Earth used only when WebGL is unavailable (NASA, public domain).
for (const w of [640, 1280]) {
  await sharp(src('photos/bluemarble.jpg'))
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 74 })
    .toFile(out(`images/blue-marble-${w}.webp`));
}

// Media from the careers.un.org home page (assets-src/home), resized for the web.
await mkdir(out('home'), { recursive: true });
const homeImages = [
  ['hero-o.png', 'hero-o.webp', 400],
  ['location-jiwon-kim.jpg', 'location-jiwon-kim.webp', 768],
  ['expertise-alexander-kiselinchev.png', 'expertise-alexander-kiselinchev.webp', 505],
  ['icon-ypp.png', 'icon-ypp.webp', 640],
  ['icon-talent-pool.png', 'icon-talent-pool.webp', 240],
  ['icon-early-careers.png', 'icon-early-careers.webp', 400],
  ['video-poster.jpg', 'video-poster.webp', 971],
  // Spotlight graphics: English (jpg) and French (png) versions from the home page.
  ...fs
    .readdirSync(src('home'))
    .filter((f) => f.startsWith('spotlight-'))
    .map((name) => [name, name.replace(/\.(jpg|png)$/, '.webp'), 1280]),
];
for (const [from, to, w] of homeImages) {
  await sharp(src(`home/${from}`)).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out(`home/${to}`));
  console.log('home', to);
}
for (const svg of fs.readdirSync(src('home')).filter((f) => f.endsWith('.svg'))) {
  fs.copyFileSync(src(`home/${svg}`), out(`home/${svg}`));
}
