export const validColumnSpan = value => Number.isInteger(value) && value >= 1 && value <= 12;

// Stable pseudo-random alignment: identical during SSR, hydration and pagination.
export function photoLayout(photo) {
  if (!validColumnSpan(photo.columnSpan)) return null;
  let hash = 2166136261;
  for (const char of photo.id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const alignment = (hash >>> 0) % 3;
  const span = photo.columnSpan;
  const mobileSpan = Math.max(3, Math.ceil(span / 2));
  const start = (columns, width) => 1 + Math.round((columns - width) * alignment / 2);
  return {span, mobileSpan, alignment, start:start(12, span), mobileStart:start(6, mobileSpan), solo:span > 8};
}

// Compose consecutive photographs together; saved widths remain untouched.
export function galleryLayouts(photos, offset = 0) {
  const layouts = photos.map((photo, index) => photoLayout({
    ...photo,
    columnSpan: validColumnSpan(photo.columnSpan) ? photo.columnSpan : [5,4,4,6,6,4,5,4][(index + offset) % 8],
  }));
  let row = 1;
  for (let i = 0; i < layouts.length; row++) {
    const first = layouts[i];
    first.row = row;
    const second = !first.solo && !layouts[i + 1]?.solo ? layouts[i + 1] : null;
    if (!second) { i++; continue; }
    second.row = row;
    second.span = Math.min(second.span, 12 - first.span);
    // Leave spare columns around/between the pair for an organic composition.
    const spare = 12 - first.span - second.span;
    first.start = 1 + Math.round(spare * first.alignment / 2);
    second.start = first.start + first.span + Math.round((spare - first.start + 1) * second.alignment / 2);
    first.mobileSpan = Math.min(3, first.mobileSpan);
    second.mobileSpan = Math.min(3, second.mobileSpan);
    first.mobileStart = 1;
    second.mobileStart = 4;
    i += 2;
  }
  return layouts;
}
