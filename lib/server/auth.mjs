import { createHash } from 'node:crypto';
import { localMode, readState } from './storage.mjs';
import { CmsError } from './model.mjs';

export const tokenHash = value => createHash('sha256').update(value).digest('hex');
export function isLocalRequest(req) {
  const host = req.headers.host || '';
  const ip = req.socket?.remoteAddress;
  return localMode() && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
}
export function checkOrigin(req) {
  const origin = req.headers.origin;
  if (req.headers['sec-fetch-site'] === 'cross-site') throw new CmsError('Otillåtet ursprung.', 403);
  const expected = isLocalRequest(req) ? `http://${req.headers.host}` : process.env.SNABB_SITE_URL;
  if (!expected || !origin || origin !== new URL(expected).origin) throw new CmsError('Otillåtet ursprung.', 403);
}
export async function requireAdmin(req) {
  if (isLocalRequest(req)) {
    if (!['GET', 'HEAD'].includes(req.method)) checkOrigin(req);
    return { local: true };
  }
  const identity = process.env.SNABB_IDENTITY_URL;
  const adminEmail = process.env.SNABB_ADMIN_EMAIL;
  if (!identity || !adminEmail) throw new CmsError('Inloggningen är inte konfigurerad.', 503);
  const bearer = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const token = bearer || req.cookies?.nf_jwt;
  if (!token) throw new CmsError('Logga in för att fortsätta.', 401);
  // Verify with the configured Identity service, never decode untrusted claims locally.
  const url = new URL(identity);
  if (url.protocol !== 'https:') throw new CmsError('Identity kräver HTTPS.', 503);
  const response = await fetch(`${identity.replace(/\/$/, '')}/user`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new CmsError('Din session har gått ut. Logga in igen.', 401);
  const user = await response.json();
  if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) throw new CmsError('Kontot har inte tillgång till admin.', 403);
  if (!['GET', 'HEAD'].includes(req.method)) checkOrigin(req);
  return { local: false };
}
export async function requireDevice(req) {
  const token = req.headers.authorization?.match(/^Bearer (snabb_[a-f0-9]{64})$/)?.[1];
  if (!token) throw new CmsError('Uppladdningsnyckel saknas.', 401);
  const { state } = await readState();
  const device = state.devices.find(d => !d.revokedAt && d.hash === tokenHash(token));
  if (!device) throw new CmsError('Nyckeln är ogiltig eller återkallad.', 401);
  if (req.headers.origin) throw new CmsError('Använd admin för webbläsaruppladdning.', 403);
  return device;
}
export function api(handler) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try { await handler(req, res); }
    catch (error) {
      const status = error instanceof CmsError ? error.status : 500;
      if (status === 500) console.error('CMS request failed:', error.message);
      res.status(status).json({ error: status === 500 ? 'Något gick fel. Försök igen.' : error.message });
    }
  };
}
export function method(req, allowed) {
  if (!allowed.includes(req.method)) throw new CmsError('Metoden stöds inte.', 405);
}
