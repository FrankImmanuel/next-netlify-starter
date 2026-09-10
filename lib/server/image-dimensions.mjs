import sharp from 'sharp';
import { readImage } from './storage.mjs';
// Development study helper only: public routes must use stored dimensions and
// must never fetch image bytes before responding. Use the backfill script for
// legacy catalog entries. Legacy uploads lack variant dimensions. Cache only immutable dimensions, never
// visibility or image bytes. Every caller filters through the current catalog.
const dimensions = new Map();
export async function withImageDimensions(photos) {
  return Promise.all(photos.map(async photo => {
    if (photo.thumbnailWidth || !photo.src.startsWith('/api/media/')) return photo;
    const key = photo.id;
    if (!dimensions.has(key)) {
      if (dimensions.size >= 512) dimensions.delete(dimensions.keys().next().value);
      dimensions.set(key, (async () => {
        const bytes = await readImage(`${key}-640`);
        if (!bytes) return null;
        const {width} = await sharp(bytes).metadata();
        return width;
      })().catch(() => null));
    }
    const width = await dimensions.get(key);
    if (!width) dimensions.delete(key);
    return {...photo, thumbnailWidth:width};
  }));
}
