import { randomBytes, randomUUID } from 'node:crypto';
import { api, method, requireAdmin, tokenHash } from '../../../lib/server/auth.mjs';
import { mutateState } from '../../../lib/server/storage.mjs';
import { CmsError } from '../../../lib/server/model.mjs';
export default api(async (req, res) => {
  method(req, ['POST', 'DELETE']); await requireAdmin(req);
  if (req.method === 'DELETE') {
    await mutateState(state => {
      const device = state.devices.find(d => d.id === req.body.id);
      if (!device) throw new CmsError('Nyckeln finns inte.', 404);
      device.revokedAt = new Date().toISOString(); return state;
    });
    return res.json({ ok: true });
  }
  const token = `snabb_${randomBytes(32).toString('hex')}`;
  const device = { id: randomUUID(), name: 'iPhone', createdAt: new Date().toISOString(), revokedAt: null, hash: tokenHash(token) };
  await mutateState(state => { state.devices.push(device); return state; });
  res.status(201).json({ token });
});
