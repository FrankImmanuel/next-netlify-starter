import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {applyAction,publicCatalog,emptyState} from '../lib/server/model.mjs';
import {orderedPhotos,homePhotos} from '../lib/photo-order.mjs';
import {readState,mutateState} from '../lib/server/storage.mjs';
import {tokenHash} from '../lib/server/auth.mjs';
import shortcut from '../pages/api/shortcut.js';
import catalog from '../pages/api/catalog.js';
import {sitemap} from '../lib/seo.mjs';

const photo=(id,status='published')=>({id,status,uploadedAt:`2026-09-0${id}`,width:800,height:600,alt:'Photo'});
const fixture=()=>({...emptyState(),photos:[photo('1'),photo('2'),photo('3','draft')],series:[{id:'s',slug:'s',title:'Series',status:'published',photoIds:['1','2','3'],coverId:'1'}]});
test('manual order, home visibility and series sequences are independent',()=>{
  let s=fixture();
  assert.deepEqual(orderedPhotos(s).map(p=>p.id),['3','2','1']);
  s=applyAction(s,{type:'photos.reorder',ids:['1','3','2']});
  s=applyAction(s,{type:'photo.update',id:'1',showOnHome:false});
  assert.deepEqual(homePhotos(s).map(p=>p.id),['3','2']);
  assert.deepEqual(publicCatalog(s).photos.filter(p=>p.showOnHome).map(p=>p.id),['2']);
  assert.deepEqual(publicCatalog(s).series[0].photoIds,['1','2']);
  s=applyAction(s,{type:'photo.update',id:'1',showOnHome:true,homePosition:2});
  assert.deepEqual(homePhotos(s).map(p=>p.id),['3','1','2']);
  s=applyAction(s,{type:'photo.update',id:'3',status:'published'});
  assert.deepEqual(publicCatalog(s).photos.map(p=>p.id),['3','1','2']);
});
test('bad orders and placements cannot mutate the original catalog',()=>{
  const s=fixture(),before=structuredClone(s);
  for(const ids of [['1'],['1','1','2'],['1','2','unknown']])assert.throws(()=>applyAction(s,{type:'photos.reorder',ids}));
  for(const homePosition of [0,-1,4,1.5,'2'])assert.throws(()=>applyAction(s,{type:'photo.update',id:'1',homePosition}));
  assert.throws(()=>applyAction(s,{type:'photo.update',id:'1',showOnHome:false,homePosition:1}));
  assert.deepEqual(s,before);
});
test('sitemap home pages exclude series-only images but retain their series page',()=>{
  const s=fixture();s.photos[0].showOnHome=false;
  const xml=sitemap(publicCatalog(s));
  const first=xml.split('</url>')[0];
  assert.doesNotMatch(first,/media\/1\?/);
  assert.match(xml.split('<loc>https:\/\/snabb.studio\/series\/s</loc>')[1],/media\/1\?/);
});

const dir=await mkdtemp(path.join(tmpdir(),'snabb-placement-'));
process.env.SNABB_LOCAL_CMS='1';process.env.SNABB_DATA_DIR=dir;
after(()=>rm(dir,{recursive:true,force:true}));
const token='snabb_'+'a'.repeat(64);
function response(){return {code:200,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;}};}
test('phone upload preserves placement on retries, stays draft and validates positions',async()=>{
  await mutateState(()=>({...fixture(),devices:[{id:'phone',hash:tokenHash(token)}]}));
  const headers={authorization:`Bearer ${token}`};
  let res=response();await shortcut({method:'GET',headers},res);
  assert.equal(res.body.choices['Serie: Series'],'s');
  assert.equal(res.body.homeChoices['Visa inte på förstasidan'],'off');
  const image=(await sharp({create:{width:100,height:100,channels:3,background:'#888'}}).jpeg().toBuffer()).toString('base64');
  const body={image,seriesId:'s',homePlacement:'2',requestId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',status:'published'};
  res=response();await shortcut({method:'POST',headers,body},res);assert.equal(res.code,201);
  const id=res.body.photoId;
  let state=(await readState()).state;
  assert.equal(state.photos.find(p=>p.id===id).status,'draft');
  assert.equal(homePhotos(state)[1].id,id);
  assert.ok(state.series[0].photoIds.includes(id));
  const revision=state.revision;
  res=response();await shortcut({method:'POST',headers,body},res);assert.equal(res.body.photoId,id);
  assert.equal((await readState()).state.revision,revision);
  res=response();await shortcut({method:'POST',headers,body:{...body,requestId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',homePlacement:'off'}},res);
  state=(await readState()).state;assert.equal(state.photos.find(p=>p.id===res.body.photoId).showOnHome,false);
  res=response();await shortcut({method:'POST',headers,body:{...body,requestId:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',homePlacement:'999'}},res);assert.equal(res.code,400);
  res=response();await shortcut({method:'GET',headers:{}},res);assert.equal(res.code,401);
  await mutateState(s=>applyAction(s,{type:'photo.update',id:'1',showOnHome:false}));
  res=response();await catalog({method:'GET',query:{page:'1'}},res);
  assert.deepEqual(res.body.photos.map(p=>p.id),['2']);
});
