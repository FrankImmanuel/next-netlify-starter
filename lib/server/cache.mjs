export function privateResponse(res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Netlify-CDN-Cache-Control', 'no-store');
}
// The five-minute budget begins before the visibility check, not after blob I/O.
// No durable cache or stale-while-revalidate: stale images must be re-authorized.
export function publishedImageResponse(res, checkedAt, now = Date.now()) {
  const seconds = Math.max(0, Math.floor(300 - (now - checkedAt) / 1000));
  const policy = `public, max-age=${seconds}, must-revalidate`;
  res.setHeader('Cache-Control', policy);
  res.setHeader('CDN-Cache-Control', policy);
  res.setHeader('Netlify-CDN-Cache-Control', policy);
}
