import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'direct-download-index',
        configureServer(server) {
          server.middlewares.use('/download-index.html', (_req, res) => {
            const filePath = path.resolve(__dirname, 'index.html');
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.end('index.html not found');
              return;
            }
            const stat = fs.statSync(filePath);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
            res.setHeader('Content-Length', String(stat.size));
            res.setHeader('Cache-Control', 'no-store');
            fs.createReadStream(filePath).pipe(res);
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use('/download-index.html', (_req, res) => {
            const filePath = path.resolve(__dirname, 'index.html');
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.end('index.html not found');
              return;
            }
            const stat = fs.statSync(filePath);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
            res.setHeader('Content-Length', String(stat.size));
            res.setHeader('Cache-Control', 'no-store');
            fs.createReadStream(filePath).pipe(res);
          });
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          const rootIndex = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(distDir) && fs.existsSync(rootIndex)) {
            fs.copyFileSync(rootIndex, path.resolve(distDir, 'raw-index.txt'));
            fs.writeFileSync(
              path.resolve(distDir, 'download-index.html'),
              '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تنزيل index.html</title></head><body style="font-family:sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#091322;color:#f8fafc"><div style="text-align:center"><p id="st">جاري تنزيل index.html تلقائياً...</p><a id="dl" href="/raw-index.txt" download="index.html" style="display:inline-block;margin-top:12px;padding:10px 18px;background:#0d9488;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">اضغط هنا إذا لم يبدأ التنزيل</a></div><script>fetch("/raw-index.txt").then(function(r){return r.blob();}).then(function(b){var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="index.html";document.body.appendChild(a);a.click();document.getElementById("st").textContent="تم بدء التنزيل";}).catch(function(){document.getElementById("dl").click();});</script></body></html>',
              'utf8'
            );
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
