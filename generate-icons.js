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
    
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated ${size}x${size} icon: logo${size}.png`);
    } catch (error) {
      console.error(`Error generating ${size}x${size} icon:`, error.message);
    }
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons();
