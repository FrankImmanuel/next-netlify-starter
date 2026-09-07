import { api, method, requireAdmin } from '../../../lib/server/auth.mjs';
import { readState, mutateState } from '../../../lib/server/storage.mjs';
import { applyAction, CmsError } from '../../../lib/server/model.mjs';
const redact = state => ({ ...state, devices: state.devices.map(({ hash, ...device }) => device) });
export default api(async (req, res) => {
  method(req, ['GET', 'POST']);
  const auth = await requireAdmin(req);
  if (req.method === 'GET') return res.json({ ...redact((await readState()).state), local: auth.local });
  if (!Number.isInteger(req.body.revision)) throw new CmsError('Ladda om innehållet innan du sparar.');
  const state = await mutateState(current => applyAction(current, req.body), req.body.revision);
  res.json({ ...redact(state), local: auth.local });
});
