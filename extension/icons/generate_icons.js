const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#007AFF';
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${size/2}px Arial`;
    ctx.fillText('A', size/2, size/2);
    
    // Save file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon${size}.png`, buffer);
}

// Generate icons
[16, 48, 128].forEach(size => generateIcon(size)); 