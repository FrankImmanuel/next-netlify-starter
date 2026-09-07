import { randomUUID } from 'node:crypto';

export class CmsError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const emptyState = () => ({ revision: 0, photos: [], series: [], devices: [] });
export function text(value, limit = 200) {
  if (typeof value !== 'string' || value.length > limit) throw new CmsError('Textfältet är för långt eller ogiltigt.');
  return value.trim();
}
export function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
const item = (items, id) => {
  const found = items.find(entry => entry.id === id);
  if (!found) throw new CmsError('Innehållet finns inte.', 404);
  return found;
};
function ids(value, allowed) {
  if (!Array.isArray(value) || value.length > 1000 || new Set(value).size !== value.length || value.some(id => !allowed.includes(id))) throw new CmsError('Bildordningen eller urvalet är ogiltigt.');
  return value;
}
export function applyAction(state, action) {
  const next = structuredClone(state);
  switch (action.type) {
    case 'series.create': {
      const title = text(action.title, 120);
      const slug = slugify(title);
      if (!title || !slug) throw new CmsError('Ange ett serienamn med bokstäver eller siffror.');
      if (next.series.some(s => s.slug === slug)) throw new CmsError('En serie med detta namn finns redan.');
      next.series.push({ id: randomUUID(), slug, title, description: '', status: 'draft', photoIds: [], coverId: null });
      break;
    }
    case 'series.update': {
      const series = item(next.series, action.id);
      if (action.title !== undefined) {
        const title = text(action.title, 120);
        if (!title) throw new CmsError('Serien behöver ett namn.');
        series.title = title;
      }
      if (action.description !== undefined) series.description = text(action.description, 4000);
      if (action.photoIds !== undefined) series.photoIds = ids(action.photoIds, next.photos.map(p => p.id));
      if (action.coverId !== undefined) {
        if (action.coverId !== null && !series.photoIds.includes(action.coverId)) throw new CmsError('Omslaget måste ingå i serien.');
        series.coverId = action.coverId;
      }
      if (series.coverId && !series.photoIds.includes(series.coverId)) series.coverId = series.photoIds[0] || null;
      if (action.status !== undefined) {
        if (!['draft', 'published'].includes(action.status)) throw new CmsError('Ogiltig status.');
        if (action.status === 'published' && !series.photoIds.some(id => next.photos.some(p => p.id === id && p.status === 'published'))) throw new CmsError('Publicera minst en bild innan du publicerar serien.');
        series.status = action.status;
      }
      break;
    }
    case 'series.reorder': {
      const ordered = ids(action.ids, next.series.map(s => s.id));
      if (ordered.length !== next.series.length) throw new CmsError('Alla serier måste ingå i ordningen.');
      next.series = ordered.map(id => item(next.series, id));
      break;
    }
    case 'photo.update': {
      const photo = item(next.photos, action.id);
      if (action.noteTitle !== undefined) photo.noteTitle = text(action.noteTitle, 160);
      if (action.noteBody !== undefined) photo.noteBody = text(action.noteBody, 4000);
      if (action.alt !== undefined) photo.alt = text(action.alt, 500);
      if (action.status !== undefined) {
        if (!['draft', 'published'].includes(action.status)) throw new CmsError('Ogiltig status.');
        photo.status = action.status;
        if (photo.status === 'published' && !photo.publishedAt) photo.publishedAt = new Date().toISOString();
      }
      if (action.seriesIds !== undefined) {
        const selected = ids(action.seriesIds, next.series.map(s => s.id));
        next.series.forEach(s => {
          if (selected.includes(s.id) && !s.photoIds.includes(photo.id)) s.photoIds.push(photo.id);
          if (!selected.includes(s.id)) s.photoIds = s.photoIds.filter(id => id !== photo.id);
          if (s.coverId && !s.photoIds.includes(s.coverId)) s.coverId = s.photoIds[0] || null;
        });
      }
      break;
    }
    default: throw new CmsError('Okänd åtgärd.');
  }
  return next;
}

export function publicCatalog(state) {
  const visible = state.photos.filter(p => p.status === 'published');
  const publishedIds = new Set(visible.map(p => p.id));
  const series = state.series.filter(s => s.status === 'published').map(s => ({
    id: s.id, slug: s.slug, title: s.title, description: s.description,
    photoIds: s.photoIds.filter(id => publishedIds.has(id)),
    coverId: publishedIds.has(s.coverId) ? s.coverId : s.photoIds.find(id => publishedIds.has(id)) || null,
  })).filter(s => s.photoIds.length);
  const photos = visible.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt) || b.id.localeCompare(a.id)).map(p => ({
    id: p.id, width: p.width, height: p.height, alt: p.alt, noteTitle: p.noteTitle || '', noteBody: p.noteBody || '', uploadedAt: p.uploadedAt,
    src: p.src || `/api/media/${p.id}?size=1600`, thumbnail: p.thumbnail || `/api/media/${p.id}?size=640`,
    series: series.filter(s => s.photoIds.includes(p.id)).map(s => ({ slug: s.slug, title: s.title })),
  }));
  return { photos, series };
}
