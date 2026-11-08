// @ts-check
import { defineConfig } from 'astro/config';
import { cp, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';

const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };
const allowIndex = env.PUBLIC_ALLOW_INDEX === 'true';

/**
 * After the build:
 * - writes Cloudflare Pages `_headers`. Until launch (PUBLIC_ALLOW_INDEX !== "true") every response carries
 *   X-Robots-Tag: noindex (robots.txt stays open, so crawlers can read the noindex).
 * - copies the design-system sample page to /design-system/ (it is a plain HTML page, not part of the site).
 */
const pages = () => ({
  name: 'ne0nni-pages',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const all = ['/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin'];
      if (!allowIndex) all.push('  X-Robots-Tag: noindex, nofollow');
      const lines = [...all, '', '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable', ''];
      await writeFile(new URL('_headers', dir), lines.join('\n'));
      await cp(new URL('./design-system/', import.meta.url), new URL('design-system/', dir), { recursive: true });
    },
  },
});

export default defineConfig({
  site: env.SITE_URL || 'https://ne0nni-demo.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  image: {
    // microCMS images are downloaded and resized at build time
    domains: ['images.microcms-assets.io'],
  },
  integrations: [pages()],
});
