import type { APIRoute } from 'astro';

// Open to crawlers on purpose: until launch the pages say noindex themselves (meta + X-Robots-Tag),
// and a crawler blocked by robots.txt could never read that.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
