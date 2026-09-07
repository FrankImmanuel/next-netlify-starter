import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
if (process.env.NETLIFY) throw new Error('The preview seed must never run on Netlify.');
await mkdir('.data', { recursive: true, mode: 0o700 });
const fixtures = JSON.parse(await readFile('lib/photos.json', 'utf8'));
const photos = [];
for (const [index, fixture] of fixtures.entries()) {
  const image = await sharp(`public/photos/${fixture.id}-1600.webp`).metadata();
  photos.push({ ...fixture, series: undefined, width: image.width, height: image.height, src: `/photos/${fixture.id}-1600.webp`, thumbnail: `/photos/${fixture.id}-640.webp`, status: 'published', uploadedAt: new Date(Date.UTC(2026, 7, 30 - index)).toISOString(), publishedAt: new Date(Date.UTC(2026, 7, 30 - index)).toISOString() });
}
const state = { revision: 1, photos, devices: [], series: [{ id: randomUUID(), slug: 'ordinary-days', title: 'Ordinary days', description: 'A working sequence for this preview. Final selection to follow.', status: 'published', coverId: photos[0].id, photoIds: photos.slice(0,12).map(p=>p.id) }] };
try { await writeFile('.data/catalog.json', JSON.stringify(state), { flag: 'wx', mode: 0o600 }); console.log('Local preview catalog created. Upload dates are illustrative.'); }
catch (error) { if (error.code !== 'EEXIST') throw error; console.log('Existing catalog retained.'); }
