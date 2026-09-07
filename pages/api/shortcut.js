import { createHash } from 'node:crypto';
import { api, method, requireDevice } from '../../lib/server/auth.mjs';
import { readState } from '../../lib/server/storage.mjs';
import { uploadPhoto } from '../../lib/server/upload.mjs';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
export default api(async (req, res) => {
  method(req, ['GET', 'POST']); await requireDevice(req);
  if (req.method === 'GET') {
    const { state } = await readState();
    const series = state.series.map(({ id, title }) => ({ id, title }));
    // Prefix labels so a user-created title cannot collide with the no-series option.
    const choices = Object.fromEntries([['Ingen serie', ''], ...series.map(s => [`Serie: ${s.title}`, s.id])]);
    return res.json({ series, choices });
  }
  const body = { ...req.body };
  if (!body.requestId && typeof body.image === 'string') body.requestId = createHash('sha256').update(body.image).digest('hex');
  const photo = await uploadPhoto(body);
  res.status(201).json({ photoId: photo.id, previewPath: `/admin?photo=${photo.id}`, status: 'draft' });
});
