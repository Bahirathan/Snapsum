import fs from 'fs';
import path from 'path';
import { ALL_ROUTES, getRouteSeoData, injectSeoIntoHtmlTemplate } from '../src/server/seoPrerender';

function prerender() {
  const distDir = path.join(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  console.log(`[SSG Prerender] Starting pre-rendering for ${ALL_ROUTES.length} routes...`);

  for (const route of ALL_ROUTES) {
    const seoData = getRouteSeoData(route);
    const renderedHtml = injectSeoIntoHtmlTemplate(baseHtml, seoData);

    let targetFilePath: string;
    if (route === '/') {
      targetFilePath = templatePath;
    } else {
      const routeDir = path.join(distDir, route.substring(1));
      fs.mkdirSync(routeDir, { recursive: true });
      targetFilePath = path.join(routeDir, 'index.html');
    }

    fs.writeFileSync(targetFilePath, renderedHtml, 'utf-8');
    console.log(`  ✓ Pre-rendered: ${route} -> ${path.relative(process.cwd(), targetFilePath)}`);
  }

  console.log('[SSG Prerender] Completed successfully!');
}

prerender();
