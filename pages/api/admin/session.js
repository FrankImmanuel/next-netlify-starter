import { api, isLocalRequest, requireAdmin } from '../../../lib/server/auth.mjs';
export default api(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const local = isLocalRequest(req);
  if (local) return res.json({ local: true, authenticated: true });
  try { await requireAdmin(req); res.json({ local: false, authenticated: true }); }
  catch { res.json({ local: false, authenticated: false, identityUrl: process.env.SNABB_IDENTITY_URL || null }); }
});
