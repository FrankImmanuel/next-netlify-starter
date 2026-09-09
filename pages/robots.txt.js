import {INDEXABLE, SITE_URL} from '../lib/seo.mjs';
export default function Robots() { return null; }
export async function getServerSideProps({res}) {
  const {privateResponse}=await import('../lib/server/cache.mjs');
  privateResponse(res);
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  res.end(INDEXABLE ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin/\nDisallow: /api/shortcut\nSitemap: ${SITE_URL}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  return {props:{}};
}
