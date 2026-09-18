import test from 'node:test';
import assert from 'node:assert/strict';
import {archivePages,sitemap} from '../lib/seo.mjs';
import {galleryLayouts} from '../lib/photo-layout.mjs';
const photos = widths => widths.map((columnSpan,id)=>({id:String(id),columnSpan,src:`/photos/${id}.webp`}));

test('loading a page finishes the pair after a full-width photograph',()=>{
  const all=photos([12,...Array(24).fill(5)]);
  const pages=archivePages(all);
  assert.deepEqual(pages.map(p=>p.photos.length),[13,12]);
  assert.deepEqual(pages.map(p=>p.start),[0,13]);
  assert.deepEqual(pages.map(p=>p.hasMore),[true,false]);
  assert.deepEqual(pages.flatMap(p=>p.photos),all);
  const before=galleryLayouts(pages[0].photos);
  assert.deepEqual(galleryLayouts(all).slice(0,before.length),before);
  const xml=sitemap({photos:all,series:[]});
  assert.ok(xml.includes('/?page=2'));
  assert.ok(!xml.includes('/?page=3'));
});

test('every archive boundary preserves rows and direct-page layout',()=>{
  for(let wide=0;wide<40;wide++){
    const all=photos(Array.from({length:40},(_,i)=>i===wide?9:5));
    const layouts=galleryLayouts(all);
    for(const page of archivePages(all)){
      const end=page.start+page.photos.length;
      if(page.hasMore)assert.notEqual(layouts[end-1].row,layouts[end].row);
      const direct=galleryLayouts(page.photos,page.start);
      assert.deepEqual(direct,layouts.slice(page.start,end).map(p=>({...p,row:p.row-layouts[page.start].row+1})));
    }
  }
  assert.deepEqual(archivePages([]),[{start:0,photos:[],hasMore:false}]);
  assert.deepEqual(archivePages(photos(Array(24).fill(12))).map(p=>p.photos.length),[12,12]);
});
