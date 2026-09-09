export const SITE_URL = 'https://snabb.studio';
export const PHOTOGRAPHER = 'Samuel Sjöblom';
export const PAGE_SIZE = 12;
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true';
export const absoluteUrl = path => new URL(path, SITE_URL).href;
export const archivePath = page => page === 1 ? '/' : `/?page=${page}`;
export function archivePage(value) {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d{0,6}$/.test(value)) return null;
  return Number(value);
}
export function pageDescription(value, fallback) {
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.length > 170 ? `${clean.slice(0, 167).replace(/\s+\S*$/, '')}…` : clean;
}
export const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');
export const xmlEscape = value => String(value).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function sitemap(catalog) {
  const pageCount = Math.max(1, Math.ceil(catalog.photos.length / PAGE_SIZE));
  const entries = Array.from({length:pageCount}, (_, i) => ({path:archivePath(i+1), photos:catalog.photos.slice(i*PAGE_SIZE,(i+1)*PAGE_SIZE)}));
  entries.push({path:'/about',photos:catalog.photos.slice(0,1)}, {path:'/series',photos:catalog.series.map(s=>catalog.photos.find(p=>p.id===s.coverId)).filter(Boolean)});
  for (const series of catalog.series) entries.push({path:`/series/${series.slug}`,photos:catalog.photos.filter(p=>series.photoIds.includes(p.id))});
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.map(e=>`<url><loc>${xmlEscape(absoluteUrl(e.path))}</loc>${e.photos.map(p=>`<image:image><image:loc>${xmlEscape(absoluteUrl(p.src))}</image:loc></image:image>`).join('')}</url>`).join('')}</urlset>`;
}
