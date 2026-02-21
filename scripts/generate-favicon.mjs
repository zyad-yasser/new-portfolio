import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple PNG generator using Canvas (requires canvas package)
async function generateFavicon() {
  try {
    const { createCanvas } = await import('canvas');

    const sizes = [16, 32, 180, 192, 512];

    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.4, '#FFC832');
      gradient.addColorStop(1, '#FFAA32');

      // Draw rounded rectangle background
      const radius = size * 0.15625; // 80/512
      ctx.fillStyle = gradient;
      roundRect(ctx, 0, 0, size, size, radius);
      ctx.fill();

      // Draw "ZY" text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold ${size * 0.55}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ZY', size / 2, size / 2 + size * 0.04);

      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      const filename = size === 180 ? 'apple-touch-icon.png' :
                       size === 192 ? 'android-chrome-192x192.png' :
                       size === 512 ? 'android-chrome-512x512.png' :
                       `favicon-${size}x${size}.png`;

      writeFileSync(join(__dirname, '../public', filename), buffer);
      console.log(`✓ Generated ${filename}`);
    }

    console.log('\n✅ All favicon formats generated successfully!');
  } catch (error) {
    console.log('⚠️  Canvas package not found. Installing...');
    console.log('Run: npm install --save-dev canvas');
    console.log('\nAlternatively, use an online tool like https://realfavicongenerator.net/');
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

generateFavicon();
