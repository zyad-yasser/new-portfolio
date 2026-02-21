import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateFavicons() {
  const svgPath = join(__dirname, '../public/favicon.svg');
  const svgBuffer = readFileSync(svgPath);

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ];

  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '../public', name));

    console.log(`✓ Generated ${name}`);
  }

  // Generate ICO (using 32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFormat('png')
    .toFile(join(__dirname, '../public/favicon.ico'));

  console.log(`✓ Generated favicon.ico`);
  console.log('\n✅ All favicon formats generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Error:', err.message);
  console.log('\n💡 Tip: Visit https://realfavicongenerator.net/ to generate favicons from your SVG');
});
