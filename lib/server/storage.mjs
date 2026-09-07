import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { emptyState, CmsError } from './model.mjs';

const directory = () => path.resolve(process.env.SNABB_DATA_DIR || '.data');
const hash = value => createHash('sha256').update(value).digest('hex');
export const localMode = () => process.env.SNABB_LOCAL_CMS === '1' && !process.env.NETLIFY;
async function store() {
  if (process.env.SNABB_STORAGE !== 'netlify') throw new CmsError('Lagringen är inte konfigurerad.', 503);
  const { getStore } = await import('@netlify/blobs');
  // Deploy previews must never read or mutate the production catalog.
  const context = process.env.CONTEXT || 'development';
  const name = process.env.SNABB_STORE_NAME || `snabb-cms-${context}`;
  return getStore({ name, consistency: 'strong' });
}
export async function readState() {
  if (localMode()) {
    try {
      const raw = await readFile(path.join(directory(), 'catalog.json'), 'utf8');
      return { state: JSON.parse(raw), etag: hash(raw) };
    } catch (error) { if (error.code === 'ENOENT') return { state: emptyState(), etag: null }; throw error; }
  }
  const result = await (await store()).getWithMetadata('catalog', { type: 'json', consistency: 'strong' });
  return result ? { state: result.data, etag: result.etag } : { state: emptyState(), etag: null };
}
async function commit(state, etag) {
  if (localMode()) {
    const current = await readState();
    if (current.etag !== etag) return false;
    await mkdir(directory(), { recursive: true, mode: 0o700 });
    const temporary = path.join(directory(), `${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, path.join(directory(), 'catalog.json'));
    return true;
  }
  const result = await (await store()).setJSON('catalog', state, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
  return result.modified;
}
let queue = Promise.resolve();
export function mutateState(change, expectedRevision) {
  const operation = async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { state, etag } = await readState();
      if (expectedRevision !== undefined && expectedRevision !== state.revision) throw new CmsError('Innehållet har ändrats. Ladda om innan du sparar igen.', 409);
      const next = await change(structuredClone(state));
      next.revision = state.revision + 1;
      if (await commit(next, etag)) return next;
    }
    throw new CmsError('Någon annan ändring pågår. Försök igen.', 409);
  };
  // Serialize the local server; remote writes additionally use Blobs ETag conditions.
  const result = queue.then(operation, operation);
  queue = result.catch(() => {});
  return result;
}
export async function writeImage(key, bytes) {
  if (!/^[a-f0-9-]+-(640|1600)$/.test(key)) throw new CmsError('Ogiltig bildnyckel.');
  if (localMode()) {
    await mkdir(path.join(directory(), 'images'), { recursive: true, mode: 0o700 });
    await writeFile(path.join(directory(), 'images', key), bytes, { mode: 0o600 });
  } else await (await store()).set(`images/${key}`, bytes);
}
export async function readImage(key) {
  if (!/^[a-f0-9-]+-(640|1600)$/.test(key)) return null;
  if (localMode()) {
    try { return await readFile(path.join(directory(), 'images', key)); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  const data = await (await store()).get(`images/${key}`, { type: 'arrayBuffer' });
  return data ? Buffer.from(data) : null;
}
