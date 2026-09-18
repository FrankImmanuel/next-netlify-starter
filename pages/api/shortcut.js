import { createHash } from 'node:crypto';
import { api, method, requireDevice } from '../../lib/server/auth.mjs';
import { readState } from '../../lib/server/storage.mjs';
import { uploadPhoto } from '../../lib/server/upload.mjs';
import { homePhotos } from '../../lib/photo-order.mjs';
import { CmsError } from '../../lib/server/model.mjs';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
export default api(async (req, res) => {
  method(req, ['GET', 'POST']); await requireDevice(req);
  if (req.method === 'GET') {
    const { state } = await readState();
    const series = state.series.map(({ id, title }) => ({ id, title }));
    // Prefix labels so a user-created title cannot collide with the no-series option.
    const choices = Object.fromEntries([['Ingen serie', ''], ...series.map(s => [`Serie: ${s.title}`, s.id])]);
    const count = homePhotos(state).length + 1;
    const homeChoices = Object.fromEntries([
      ['Visa inte på förstasidan', 'off'],
      ...Array.from({length:count}, (_, i) => [`${i+1}${i===0?' · Först':i===count-1?' · Sist':''}`, String(i+1)]),
    ]);
    return res.json({ series, choices, homeChoices });
  }
  const body = { ...req.body };
  if (body.homePlacement !== undefined) {
    if (typeof body.homePlacement !== 'string' || !/^(off|[1-9]\d{0,5})$/.test(body.homePlacement)) throw new CmsError('Välj en placering på förstasidan.');
    body.showOnHome = body.homePlacement !== 'off';
    body.homePosition = body.showOnHome ? Number(body.homePlacement) : undefined;
  }
  if (!body.requestId && typeof body.image === 'string') body.requestId = createHash('sha256').update(body.image).digest('hex');
  const photo = await uploadPhoto(body);
  res.status(201).json({ photoId: photo.id, previewPath: `/admin?photo=${photo.id}`, status: 'draft' });
});
