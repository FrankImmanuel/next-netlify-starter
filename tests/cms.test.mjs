import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { emptyState, applyAction, publicCatalog } from '../lib/server/model.mjs';
import { requireAdmin, checkOrigin, requireDevice, tokenHash } from '../lib/server/auth.mjs';
import { mutateState, readState, readImage } from '../lib/server/storage.mjs';
import { uploadPhoto } from '../lib/server/upload.mjs';

const directory = await mkdtemp(path.join(tmpdir(), 'snabb-cms-test-'));
process.env.SNABB_LOCAL_CMS = '1';
process.env.SNABB_DATA_DIR = directory;
after(() => rm(directory, { recursive: true, force: true }));
const photo = (id, status='published', uploadedAt='2026-09-01') => ({id,status,uploadedAt,width:800,height:600,alt:'A photograph'});
const series = (id, status, photoIds) => ({id,slug:id,title:id,description:'',status,photoIds,coverId:photoIds[0]});

test('draft series and images never appear in the public catalog or membership links', () => {
 const state={...emptyState(),photos:[photo('one'),photo('private','draft')],series:[series('work-in-progress','draft',['one','private']),series('visible','published',['one','private'])]};
 const result=publicCatalog(state);
 assert.equal(result.photos.length,1);
 assert.deepEqual(result.series[0].photoIds,['one']);
 assert.deepEqual(result.photos[0].series,[{slug:'visible',title:'visible'}]);
 assert.equal(JSON.stringify(result).includes('work-in-progress'),false);
 assert.equal(JSON.stringify(result).includes('private'),false);
});
test('unpublishing removes the image from every public series without deleting the relationships', () => {
 const state={...emptyState(),photos:[photo('one'),photo('two')],series:[series('first','published',['one','two']),series('second','published',['one'])]};
 const next=applyAction(state,{type:'photo.update',id:'one',status:'draft'});
 const visible=publicCatalog(next);
 assert.equal(visible.series.length,1);
 assert.deepEqual(visible.series[0].photoIds,['two']);
 assert.equal(visible.series[0].coverId,'two');
 assert.deepEqual(next.series[1].photoIds,['one']);
});
test('series membership and sequence are independent and exclude duplicate or unknown IDs', () => {
 const state={...emptyState(),photos:[photo('one'),photo('two')],series:[series('first','draft',['one','two']),series('second','draft',['one','two'])]};
 const next=applyAction(state,{type:'series.update',id:'first',photoIds:['two','one']});
 assert.deepEqual(next.series[1].photoIds,['one','two']);
 assert.throws(()=>applyAction(next,{type:'series.update',id:'first',photoIds:['one','one']}));
 assert.throws(()=>applyAction(next,{type:'series.update',id:'first',coverId:'missing'}));
 const detached=applyAction(next,{type:'photo.update',id:'one',seriesIds:['second']});
 assert.deepEqual(detached.series[0].photoIds,['two']);
 assert.deepEqual(detached.series[1].photoIds,['one','two']);
});
test('chronology uses upload time, not publication or series order', () => {
 const state={...emptyState(),photos:[photo('old','draft','2026-01-01'),photo('new','published','2026-09-01')]};
 const next=applyAction(state,{type:'photo.update',id:'old',status:'published'});
 assert.deepEqual(publicCatalog(next).photos.map(p=>p.id),['new','old']);
});
test('empty series cannot be published and duplicate slugs are rejected', () => {
 let state=applyAction(emptyState(),{type:'series.create',title:'Våra dagar'});
 assert.equal(state.series[0].slug,'vara-dagar');
 assert.throws(()=>applyAction(state,{type:'series.create',title:'Vara dagar'}));
 assert.throws(()=>applyAction(state,{type:'series.update',id:state.series[0].id,status:'published'}));
});
test('local auth requires explicit loopback and same-origin mutations; Netlify disables local bypass', async () => {
 const req={method:'POST',socket:{remoteAddress:'127.0.0.1'},headers:{host:'127.0.0.1:3100',origin:'http://127.0.0.1:3100'}};
 assert.equal((await requireAdmin(req)).local,true);
 assert.throws(()=>checkOrigin({...req,headers:{...req.headers,origin:'https://attacker.example'}}));
 await assert.rejects(()=>requireAdmin({...req,headers:{...req.headers,host:'attacker.example'}}));
 process.env.NETLIFY='true'; await assert.rejects(()=>requireAdmin(req)); delete process.env.NETLIFY;
});
test('local catalog persists, concurrent appends survive, and stale writes fail', async () => {
 const initial=(await readState()).state;
 await Promise.all(Array.from({length:5},(_,i)=>mutateState(s=>{s.photos.push(photo(`seed-${i}`));return s;})));
 assert.equal((await readState()).state.photos.length,5);
 await assert.rejects(()=>mutateState(s=>s,initial.revision),e=>e.status===409);
});
test('image pipeline validates input, stages privately, strips metadata and deduplicates retries', async () => {
 const bytes=await sharp({create:{width:2500,height:1200,channels:3,background:'#a93322'}}).jpeg().toBuffer();
 const body={image:bytes.toString('base64'),requestId:'11111111-1111-4111-8111-111111111111',alt:'Test image'};
 const created=await uploadPhoto(body);
 assert.equal(created.status,'draft');
 assert.equal(created.width,1600);
 assert.equal(publicCatalog((await readState()).state).photos.some(p=>p.id===created.id),false);
 const saved=await readImage(`${created.id}-1600`);
 const metadata=await sharp(saved).metadata();
 assert.equal(metadata.format,'webp');assert.equal(metadata.exif,undefined);
 assert.equal((await uploadPhoto(body)).id,created.id);
 await assert.rejects(()=>uploadPhoto({...body,requestId:'22222222-2222-4222-8222-222222222222',image:Buffer.from('<svg/>').toString('base64')}));
 await assert.rejects(()=>uploadPhoto({...body,seriesId:'missing'}));
});
test('device keys are scoped, hash-only in storage, and revocation takes effect', async () => {
 const token='snabb_'+'a'.repeat(64);
 await mutateState(s=>{s.devices.push({id:'test-device',hash:tokenHash(token),revokedAt:null});return s;});
 const req={headers:{authorization:`Bearer ${token}`}};
 assert.equal((await requireDevice(req)).id,'test-device');
 assert.equal(JSON.stringify((await readState()).state).includes(token),false);
 await assert.rejects(()=>requireDevice({headers:{authorization:`Bearer ${token}`,origin:'https://attacker.example'}}));
 await mutateState(s=>{s.devices[0].revokedAt=new Date().toISOString();return s;});
 await assert.rejects(()=>requireDevice(req),e=>e.status===401);
});

test('notes persist independently, publish only with the photograph, and can be cleared', () => {
 let state={...emptyState(),photos:[photo('note','draft')]};
 state=applyAction(state,{type:'photo.update',id:'note',noteTitle:'Morning light',noteBody:'First paragraph.\nAnother thought.'});
 assert.equal(publicCatalog(state).photos.length,0);
 state=applyAction(state,{type:'photo.update',id:'note',status:'published'});
 assert.equal(publicCatalog(state).photos[0].noteTitle,'Morning light');
 assert.equal(publicCatalog(state).photos[0].noteBody,'First paragraph.\nAnother thought.');
 state=applyAction(state,{type:'photo.update',id:'note',noteTitle:'',noteBody:''});
 assert.equal(publicCatalog(state).photos[0].noteTitle,'');
 assert.equal(publicCatalog({...emptyState(),photos:[photo('old')]}).photos[0].noteBody,'');
});
