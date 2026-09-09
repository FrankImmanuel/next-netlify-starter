import {INDEXABLE, sitemap} from '../lib/seo.mjs';
export default function Sitemap() { return null; }
export async function getServerSideProps({res}) {
  const {privateResponse}=await import('../lib/server/cache.mjs');
  privateResponse(res);
  if (!INDEXABLE) {res.statusCode=404;res.end();return {props:{}};}
  const {readState}=await import('../lib/server/storage.mjs');
  const {publicCatalog}=await import('../lib/server/model.mjs');
  res.setHeader('Content-Type','application/xml; charset=utf-8');
  res.end(sitemap(publicCatalog((await readState()).state)));
  return {props:{}};
}
