const fs = require('fs');
const path = require('path');

// 创建简单的 PNG 图标（1x1 透明像素作为占位符）
function createPlaceholderPNG(width, height, filename) {
  // 创建一个简单的 PNG 文件（最小有效的 PNG）
  // PNG signature + IHDR + IDAT + IEND
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const widthData = Buffer.alloc(4);
  widthData.writeUInt32BE(width, 0);
  const heightData = Buffer.alloc(4);
  heightData.writeUInt32BE(height, 0);
  const bitDepth = 8;
  const colorType = 6; // RGBA
  const compression = 0;
  const filter = 0;
  const interlace = 0;

  const ihdrBody = Buffer.concat([
    widthData,
    heightData,
    Buffer.from([bitDepth, colorType, compression, filter, interlace])
  ]);

  const ihdr = Buffer.concat([
    Buffer.alloc(4).fill(0), // length
    Buffer.from('IHDR'),
    ihdrBody,
    Buffer.alloc(4) // CRC
  ]);

  ihdr.writeUInt32BE(ihdrBody.length, 0);

  // IDAT chunk with minimal data
  const idatBody = Buffer.from([0x78, 0x9c, 0x01, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01]);

  const idat = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from('IDAT'),
    idatBody,
    Buffer.alloc(4)
  ]);

  idat.writeUInt32BE(idatBody.length, 0);

  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

  const png = Buffer.concat([signature, ihdr, idat, iend]);

  return png;
}

// 创建图标
const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

sizes.forEach(size => {
  const filename = `icon-${size}.png`;
  const filepath = path.join(publicDir, filename);
  const png = createPlaceholderPNG(size, size, filename);
  fs.writeFileSync(filepath, png);
  console.log(`Created ${filename}`);
});

console.log('Icon generation complete!');
