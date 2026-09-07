import { api, requireAdmin, method } from '../../../lib/server/auth.mjs';
import { readState, readImage } from '../../../lib/server/storage.mjs';
import { CmsError } from '../../../lib/server/model.mjs';
export default api(async (req, res) => {
  method(req, ['GET']);
  const { state } = await readState();
  const photo = state.photos.find(p => p.id === req.query.id);
  if (!photo) throw new CmsError('Bilden finns inte.', 404);
  if (photo.status !== 'published') await requireAdmin(req);
  const size = req.query.size === '640' ? '640' : '1600';
  const data = await readImage(`${photo.id}-${size}`);
  if (!data) throw new CmsError('Bilden finns inte.', 404);
  // No CDN caching: unpublishing immediately closes access to previously public copies.
  res.setHeader('Content-Type', 'image/webp'); res.send(data);
});
