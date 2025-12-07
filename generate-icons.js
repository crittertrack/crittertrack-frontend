const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'public', 'logo.png');
const sizes = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(inputFile)) {
    console.error('Error: logo.png not found in public folder');
    process.exit(1);
  }

  for (const size of sizes) {
    const outputFile = path.join(__dirname, 'public', `logo${size}.png`);
    const paddedSize = Math.round(size * 0.8); // 20% padding (10% on each side)
    
    try {
      await sharp(inputFile)
        .resize(paddedSize, paddedSize, {
          fit: 'contain',
          background: { r: 241, g: 209, b: 220, alpha: 1 } // #F1D1DC page-bg color
        })
        .extend({
          top: Math.round((size - paddedSize) / 2),
          bottom: Math.round((size - paddedSize) / 2),
          left: Math.round((size - paddedSize) / 2),
          right: Math.round((size - paddedSize) / 2),
          background: { r: 241, g: 209, b: 220, alpha: 1 } // #F1D1DC
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated ${size}x${size} icon with pink background: logo${size}.png`);
    } catch (error) {
      console.error(`Error generating ${size}x${size} icon:`, error.message);
    }
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons();
