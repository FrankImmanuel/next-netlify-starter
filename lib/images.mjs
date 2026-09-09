export function imageSources(photo) {
  const src = photo.src || `/photos/${photo.id}-1600.webp`;
  const thumbnail = photo.thumbnail || `/photos/${photo.id}-640.webp`;
  // Do not guess widths for legacy/static assets. A single truthful candidate
  // remains usable until the exact thumbnail width is available.
  const srcSet = photo.thumbnailWidth && photo.thumbnailWidth < photo.width
    ? `${thumbnail} ${photo.thumbnailWidth}w, ${src} ${photo.width}w`
    : `${src} ${photo.width}w`;
  return {src,srcSet};
}
export function gallerySizes(index, sequence=false) {
  if (sequence) {
    const nth=index+1;
    const desktop=nth%4===0 ? 68.4 : nth%3===2 ? 34.2 : 54.72;
    const mobile=nth%3===2 ? 'calc(85vw - 34px)' : 'calc(100vw - 40px)';
    return `(max-width: 700px) ${mobile}, ${desktop}vw`;
  }
  const column=[5,4,4,6,6,4,5,4][index%8];
  const mobileColumn=[5,4,4,5,6,4,5,4][index%8];
  const mobile=`calc(${Number((100*mobileColumn/6).toFixed(4))}vw - ${Number((28*mobileColumn/6+12).toFixed(4))}px)`;
  return `(max-width: 700px) ${mobile}, ${Number(((22/3)*column-2).toFixed(4))}vw`;
}
export const coverSizes='(max-width: 700px) calc(100vw - 48px), 54.72vw';
export const aboutSizes='(max-width: 700px) calc(80vw - 38.4px), 32.273vw';
