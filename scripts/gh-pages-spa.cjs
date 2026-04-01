const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (!fs.existsSync(indexPath)) {
    console.error('index.html not found in dist/. Build may have failed.');
    process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
console.log('Created dist/404.html for SPA fallback on GitHub Pages.');
