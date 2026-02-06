import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to save scene config
function sceneConfigSaver(): Plugin {
    return {
        name: 'scene-config-saver',
        configureServer(server) {
            server.middlewares.use('/api/save-config', (req, res) => {
                if (req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const configPath = path.resolve(__dirname, 'public/scene-config.json');
                            fs.writeFileSync(configPath, body, 'utf-8');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                            console.log('✅ Scene config saved to public/scene-config.json');
                        } catch (error) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: String(error) }));
                        }
                    });
                } else {
                    res.writeHead(405);
                    res.end('Method not allowed');
                }
            });
        }
    }
}

export default defineConfig({
    plugins: [react(), sceneConfigSaver()],
    assetsInclude: ['**/*.glb'],
})
