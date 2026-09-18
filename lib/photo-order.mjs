// Missing preferences preserve the original newest-first gallery.
export function orderedPhotos(state) {
  const rank = new Map((state.photoOrder || []).map((id, index) => [id, index]));
  return [...state.photos].sort((a, b) => {
    const ar = rank.get(a.id), br = rank.get(b.id);
    if (ar !== undefined && br !== undefined) return ar - br;
    if (ar !== undefined) return 1;
    if (br !== undefined) return -1;
    return b.uploadedAt.localeCompare(a.uploadedAt) || b.id.localeCompare(a.id);
  });
}
export const homePhotos = state => orderedPhotos(state).filter(p => p.showOnHome !== false);
