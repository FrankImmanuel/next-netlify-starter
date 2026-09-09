import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import media from '../pages/api/media/[id].js';
import {uploadPhoto} from '../lib/server/upload.mjs';
import {readState,mutateState,readImage} from '../lib/server/storage.mjs';
import {withImageDimensions} from '../lib/server/image-dimensions.mjs';
import {publishedImageResponse} from '../lib/server/cache.mjs';
import {publicCatalog} from '../lib/server/model.mjs';
const dir=await mkdtemp(path.join(tmpdir(),'snabb-media-'));
process.env.SNABB_LOCAL_CMS='1';process.env.SNABB_DATA_DIR=dir;
process.env.SNABB_IDENTITY_URL='https://identity.example';process.env.SNABB_ADMIN_EMAIL='owner@example.com';
after(()=>rm(dir,{recursive:true,force:true}));
function response(){return {headers:{},code:200,setHeader(k,v){this.headers[k]=String(v);},status(code){this.code=code;return this;},json(value){this.body=value;},send(value){this.body=value;},end(){}};}
function request(id,size='640',admin=false){return {method:'GET',query:{id,size},headers:{host:admin?'127.0.0.1:3100':'gallery.example'},socket:{remoteAddress:'127.0.0.1'}};}
let photo;
test('a portrait upload records exactly the generated thumbnail width',async()=>{
  const bytes=await sharp({create:{width:2000,height:3001,channels:3,background:'#9e835e'}}).jpeg().toBuffer();
  photo=await uploadPhoto({image:bytes.toString('base64'),requestId:'33333333-3333-4333-8333-333333333333',alt:'Portrait fixture'});
  const small=await sharp(await readImage(`${photo.id}-640`)).metadata();
  assert.equal(photo.thumbnailWidth,small.width);
});
test('draft, public and unpublished media maintain the cache and authorization boundary',async()=>{
  let res=response();await media(request(photo.id),res);assert.equal(res.code,401);assert.match(res.headers['Cache-Control'],/no-store/);
  res=response();await media(request(photo.id,'640',true),res);assert.equal(res.code,200);assert.match(res.headers['Netlify-CDN-Cache-Control'],/no-store/);
  await mutateState(s=>{s.photos[0].status='published';return s;});
  for(const size of ['640','1600']) {
    res=response();await media(request(photo.id,size),res);assert.equal(res.code,200);assert.ok(Buffer.isBuffer(res.body));assert.match(res.headers['Cache-Control'],/^public, max-age=\d+, must-revalidate$/);assert.doesNotMatch(res.headers['Netlify-CDN-Cache-Control'],/stale|durable/);
    const age=Number(res.headers['Cache-Control'].match(/max-age=(\d+)/)[1]);assert.ok(age<=300&&age>0);
  }
  res=response();await media(request(photo.id,'invalid'),res);assert.equal(res.code,400);assert.match(res.headers['Cache-Control'],/no-store/);
  await mutateState(s=>{s.photos[0].status='draft';return s;});
  res=response();await media(request(photo.id),res);assert.equal(res.code,401);assert.match(res.headers['Cache-Control'],/no-store/);
  assert.equal(publicCatalog((await readState()).state).photos.length,0);
});
test('slow origin responses consume the five-minute budget, with no stale extension',()=>{
  let res=response();publishedImageResponse(res,1000,4500);assert.match(res.headers['Cache-Control'],/max-age=296,/);
  res=response();publishedImageResponse(res,1000,400000);assert.match(res.headers['Cache-Control'],/max-age=0,/);
});
test('legacy dimensions are read from the actual WebP and do not cache publication status',async()=>{
  const legacy={id:photo.id,src:`/api/media/${photo.id}?size=1600`,width:photo.width,height:photo.height};
  const result=await withImageDimensions([legacy]);
  assert.equal(result[0].thumbnailWidth,photo.thumbnailWidth);
  assert.deepEqual(await withImageDimensions([]),[]);
});
