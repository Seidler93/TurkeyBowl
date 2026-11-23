import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../public/tb3.png', import.meta.url));
for (const [size, file, padding] of [
  [192, 'pwa-192.png', 16],
  [512, 'pwa-512.png', 44],
  [512, 'pwa-maskable-512.png', 76],
  [180, 'apple-touch-icon.png', 16],
]) {
  const logoSize = size - padding * 2;
  const logo = await sharp(source).resize(logoSize, logoSize, { fit: 'contain', background: '#111111' }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: '#111111' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png().toFile(fileURLToPath(new URL(`../public/${file}`, import.meta.url)));
  console.log(`Created ${file} (${size}x${size})`);
}
