import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {planImageDimensions, applyImageDimensions} from '../lib/server/backfill-dimensions.mjs';
import {imageSources} from '../lib/images.mjs';

test('migration measures real variants, preserves catalog data and is idempotent', async () => {
  const bytes = await sharp({create:{width:427,height:640,channels:3,background:'#888'}}).webp().toBuffer();
  const state = {revision:7, devices:[{id:'device'}], series:[], photos:[
    {id:'legacy', width:1066, height:1600, status:'published', alt:'Portrait'},
    {id:'draft', width:1066, height:1600, status:'draft'},
    {id:'existing', width:1066, thumbnailWidth:427},
    {id:'static', width:1066, src:'/photos/static.webp'},
  ]};
  const before = structuredClone(state);
  const reads = [];
  const updates = await planImageDimensions(state.photos, async key => {reads.push(key); return bytes;});
  assert.deepEqual(state, before);
  assert.deepEqual(reads, ['legacy-640','draft-640']);
  const result = applyImageDimensions(structuredClone(state), updates);
  assert.deepEqual(result, {...before, photos:before.photos.map((p,i)=>i<2?{...p,thumbnailWidth:427}:p)});
  assert.match(imageSources(result.photos[0]).srcSet, /427w, .*1066w/);
  assert.deepEqual(await planImageDimensions(result.photos, () => {throw Error('Unexpected read');}), []);
});

test('missing or invalid variants abort planning before a catalog write', async () => {
  const photos = [{id:'broken',width:320}];
  await assert.rejects(planImageDimensions(photos,async()=>null),/Missing thumbnail/);
  const oversized = await sharp({create:{width:640,height:640,channels:3,background:'#888'}}).webp().toBuffer();
  await assert.rejects(planImageDimensions(photos,async()=>oversized),/Invalid thumbnail dimensions/);
  await assert.rejects(planImageDimensions(photos,async()=>Buffer.from('broken')),/unsupported image format/i);
  assert.deepEqual(photos,[{id:'broken',width:320}]);
});
