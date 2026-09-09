import {api, method} from '../../lib/server/auth.mjs';
import {readState} from '../../lib/server/storage.mjs';
import {publicCatalog, CmsError} from '../../lib/server/model.mjs';
import {withImageDimensions} from '../../lib/server/image-dimensions.mjs';
import {archivePage, PAGE_SIZE} from '../../lib/seo.mjs';
export default api(async(req,res)=>{
  method(req,['GET']);
  const catalog=publicCatalog((await readState()).state);
  if (req.query.page===undefined) return res.json(catalog);
  const page=archivePage(req.query.page);
  if (!page) throw new CmsError('Invalid archive page.',400);
  const start=(page-1)*PAGE_SIZE;
  if (start>=catalog.photos.length && page!==1) throw new CmsError('Archive page not found.',404);
  res.json({photos:await withImageDimensions(catalog.photos.slice(start,start+PAGE_SIZE)),hasMore:start+PAGE_SIZE<catalog.photos.length});
});
