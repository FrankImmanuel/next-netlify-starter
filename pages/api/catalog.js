import {api, method} from '../../lib/server/auth.mjs';
import {readState} from '../../lib/server/storage.mjs';
import {publicCatalog, CmsError} from '../../lib/server/model.mjs';
import {archivePage, archivePages} from '../../lib/seo.mjs';
export default api(async(req,res)=>{
  method(req,['GET']);
  const catalog=publicCatalog((await readState()).state);
  if (req.query.page===undefined) return res.json(catalog);
  const page=archivePage(req.query.page);
  if (!page) throw new CmsError('Invalid archive page.',400);
  const photos=catalog.photos.filter(p=>p.showOnHome);
  const batch=archivePages(photos)[page-1];
  if (!batch) throw new CmsError('Archive page not found.',404);
  res.json({photos:batch.photos,hasMore:batch.hasMore});
});
