import Jimp from 'jimp';
import { resolve, dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcPng = resolve(__dirname, '../public/brand/logo.png');
const iconsDir = resolve(__dirname, '../public/icons');
const publicDir = resolve(__dirname, '../public');

async function ensureDir(dir){
  await mkdir(dir, { recursive: true });
}

async function makePng(size, dest, safeRatio = 1){
  const canvas = await new Jimp(size, size, 0x00000000);
  const inner = Math.floor(size * safeRatio);
  const src = await Jimp.read(srcPng);
  src.scaleToFit(inner, inner);
  const x = Math.floor((size - src.bitmap.width) / 2);
  const y = Math.floor((size - src.bitmap.height) / 2);
  canvas.composite(src, x, y);
  await canvas.write(dest);
}

async function makeIco(){
  const sizes = [16, 32, 48];
  const bufs = await Promise.all(sizes.map(async (s) => {
    const canvas = await new Jimp(s, s, 0x00000000);
    const src = await Jimp.read(srcPng);
    src.scaleToFit(s, s);
    const x = Math.floor((s - src.bitmap.width) / 2);
    const y = Math.floor((s - src.bitmap.height) / 2);
    canvas.composite(src, x, y);
    return await canvas.getBufferAsync(Jimp.MIME_PNG);
  }));
  const { default: toIco } = await import('to-ico');
  const ico = await toIco(bufs);
  await writeFile(resolve(publicDir, 'favicon.ico'), ico);
}

async function run(){
  await ensureDir(iconsDir);
  await makePng(192, resolve(iconsDir, 'icon-192.png'), 1);
  await makePng(512, resolve(iconsDir, 'icon-512.png'), 1);
  await makePng(180, resolve(iconsDir, 'apple-touch-icon.png'), 1);
  // maskable icons with safe area padding
  await makePng(192, resolve(iconsDir, 'maskable-192.png'), 0.7);
  await makePng(512, resolve(iconsDir, 'maskable-512.png'), 0.7);
  await makeIco();
  console.log('Icons generated to /public/icons and favicon.ico');
}

run().catch(err => { console.error(err); process.exit(1); });
