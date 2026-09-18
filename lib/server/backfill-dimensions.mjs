import sharp from 'sharp';

// Read everything before writing: a missing/corrupt variant must not leave a
// partially migrated catalog. Never derive portrait widths from the size label.
export async function planImageDimensions(photos, readImage) {
  const updates = [];
  for (const photo of photos) {
    if (photo.thumbnailWidth || (photo.src && !photo.src.startsWith('/api/media/'))) continue;
    const bytes = await readImage(`${photo.id}-640`);
    if (!bytes) throw new Error(`Missing thumbnail: ${photo.id}`);
    const {width, format} = await sharp(bytes).metadata();
    if (format !== 'webp' || !Number.isInteger(width) || width < 1 || width > photo.width) {
      throw new Error(`Invalid thumbnail dimensions: ${photo.id}`);
    }
    updates.push({id: photo.id, width, bytes: bytes.length});
  }
  return updates;
}

export function applyImageDimensions(state, updates) {
  for (const {id, width} of updates) {
    const photo = state.photos.find(photo => photo.id === id);
    if (!photo || photo.thumbnailWidth) throw new Error(`Catalog changed: ${id}`);
    photo.thumbnailWidth = width;
  }
  return state;
}
