// Vite utility functions for server-side logging and static file serving
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function log(message: string, category?: string) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = category ? `[${category}]` : '[express]';
  console.log(`${timestamp} ${prefix} ${message}`);
}

export async function setupVite(app: any, server: any) {
  // Vite setup for development
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  
  app.use(vite.ssrLoadModule);
  return vite;
}

export function serveStatic(app: any) {
  // Serve static files in production
  const distPath = join(__dirname, '..', 'dist', 'public');
  app.use(express.static(distPath));
  
  // Serve index.html for all routes (SPA)
  app.get('*', (req: any, res: any) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

