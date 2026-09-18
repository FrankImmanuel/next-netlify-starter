import test from 'node:test';
import assert from 'node:assert/strict';
import {photoLayout} from '../lib/photo-layout.mjs';
import {applyAction,publicCatalog,emptyState} from '../lib/server/model.mjs';
import {gallerySizes} from '../lib/images.mjs';

test('column widths round-trip through the catalog and can return to automatic',()=>{
  const state={...emptyState(),photos:[{id:'photo',status:'published',uploadedAt:'2026-09-18',width:1600,height:1000}]};
  const updated=applyAction(state,{type:'photo.update',id:'photo',columnSpan:9});
  assert.equal(publicCatalog(updated).photos[0].columnSpan,9);
  assert.equal(state.photos[0].columnSpan,undefined);
  assert.equal(photoLayout(publicCatalog(applyAction(updated,{type:'photo.update',id:'photo',columnSpan:null})).photos[0]),null);
  for(const columnSpan of [0,13,2.5,'9',false])assert.throws(()=>applyAction(state,{type:'photo.update',id:'photo',columnSpan}));
});
test('stable alignments stay in bounds for every span and reserve wide rows',()=>{
  const alignments=new Set();
  for(let id=0;id<40;id++)for(let columnSpan=1;columnSpan<=12;columnSpan++){
    const photo={id:String(id),columnSpan},layout=photoLayout(photo);
    assert.deepEqual(photoLayout(photo),layout);
    alignments.add(layout.alignment);
    assert.ok(layout.start>=1 && layout.start+layout.span<=13);
    assert.ok(layout.mobileStart>=1 && layout.mobileStart+layout.mobileSpan<=7);
    assert.equal(layout.solo,columnSpan>8);
  }
  assert.equal(alignments.size,3);
  assert.equal(photoLayout({id:'legacy'}),null);
});
test('responsive image sizes follow custom spans instead of default positions',()=>{
  const layout=photoLayout({id:'wide',columnSpan:12});
  assert.equal(gallerySizes(1,false,layout),'(max-width: 700px) calc(100vw - 40px), 86vw');
  assert.equal(gallerySizes(1,true,layout),'(max-width: 700px) calc(100vw - 40px), 76vw');
});
