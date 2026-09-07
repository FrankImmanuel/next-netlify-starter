import { api, method } from '../../lib/server/auth.mjs';
import { readState } from '../../lib/server/storage.mjs';
import { publicCatalog } from '../../lib/server/model.mjs';
export default api(async (req, res) => {
  method(req, ['GET']); res.json(publicCatalog((await readState()).state));
});
