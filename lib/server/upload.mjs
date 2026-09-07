import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { CmsError, text } from './model.mjs';
import { writeImage, mutateState, readState } from './storage.mjs';

export async function uploadPhoto(body) {
  if (typeof body.image !== 'string' || body.image.length > 4000000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.image)) throw new CmsError('Välj en JPEG-, PNG- eller WebP-bild på högst 3 MB.');
  const input = Buffer.from(body.image, 'base64');
  if (!input.length || input.length > 3000000) throw new CmsError('Webbkopian får vara högst 3 MB.');
  const { state } = await readState();
  const seriesId = body.seriesId || null;
  if (seriesId && !state.series.some(s => s.id === seriesId)) throw new CmsError('Serien finns inte längre. Välj en annan serie.');
  const requestId = body.requestId;
  if (typeof requestId !== 'string' || !/^([a-f0-9-]{36}|[a-f0-9]{64})$/.test(requestId)) throw new CmsError('Uppladdningen behöver ett giltigt ID.');
  const existing = state.photos.find(p => p.requestId === requestId);
  if (existing) return existing;
  let meta, full, small;
  try {
    const source = sharp(input, { limitInputPixels: 40000000, animated: false });
    meta = await source.metadata();
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages || 1) > 1) throw new Error('Unsupported image');
    // rotate() applies EXIF orientation. WebP output drops GPS and other source metadata.
    full = await source.clone().rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    small = await source.clone().rotate().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  } catch { throw new CmsError('Bilden kunde inte läsas. Exportera HEIC/RAW som JPEG och försök igen.'); }
  const id = randomUUID();
  const photo = { id, requestId, width: full.info.width, height: full.info.height, alt: text(body.alt || '', 500), uploadedAt: new Date().toISOString(), status: 'draft', publishedAt: null };
  await Promise.all([writeImage(`${id}-1600`, full.data), writeImage(`${id}-640`, small)]);
  const next = await mutateState(current => {
    if (current.photos.some(p => p.requestId === requestId)) return current;
    if (seriesId && !current.series.some(s => s.id === seriesId)) throw new CmsError('Serien finns inte längre.');
    current.photos.push(photo);
    if (seriesId) current.series.find(s => s.id === seriesId).photoIds.push(id);
    return current;
  });
  return next.photos.find(p => p.requestId === requestId);
}
