import {api, requireAdmin, method} from '../../../lib/server/auth.mjs';
import {readState, readImage} from '../../../lib/server/storage.mjs';
import {CmsError} from '../../../lib/server/model.mjs';
import {publishedImageResponse} from '../../../lib/server/cache.mjs';
export default api(async(req,res)=>{
  method(req,['GET','HEAD']);
  res.setHeader('Netlify-Vary','query=size');
  const checkedAt=Date.now();
  const {state}=await readState();
  const photo=state.photos.find(p=>p.id===req.query.id);
  if (!photo) throw new CmsError('Bilden finns inte.',404);
  if (photo.status!=='published') await requireAdmin(req);
  if (req.query.size!==undefined && !['640','1600'].includes(req.query.size)) throw new CmsError('Ogiltig bildstorlek.',400);
  const size=req.query.size==='640'?'640':'1600';
  const data=await readImage(`${photo.id}-${size}`);
  if (!data) throw new CmsError('Bilden finns inte.',404);
  // Cache only successful public bytes, never an authenticated draft or error.
  if (photo.status==='published') publishedImageResponse(res,checkedAt);
  res.setHeader('Content-Type','image/webp');
  res.setHeader('Content-Length',data.length);
  if (req.method==='HEAD') return res.end();
  res.send(data);
});
