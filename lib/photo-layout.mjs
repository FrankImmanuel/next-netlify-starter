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
