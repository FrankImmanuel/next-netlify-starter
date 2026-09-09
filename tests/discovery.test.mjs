import test from 'node:test';
import assert from 'node:assert/strict';
import {archivePage, archivePath, sitemap, jsonLd} from '../lib/seo.mjs';
import {publicCatalog, emptyState} from '../lib/server/model.mjs';
import {imageSources, gallerySizes} from '../lib/images.mjs';

test('archive URLs are bounded and each page has its own URL',()=>{
  assert.equal(archivePage(undefined),1);assert.equal(archivePage('2'),2);
  for(const value of ['0','-1','1.5','02','abc','999999999',['2']]) assert.equal(archivePage(value),null);
  assert.equal(archivePath(1),'/');assert.equal(archivePath(2),'/?page=2');
});
test('sitemap includes older photographs and escapes XML, without drafts or draft series',()=>{
  const photos=Array.from({length:14},(_,i)=>({id:String(i),status:i===13?'draft':'published',uploadedAt:`2026-09-${String(20-i).padStart(2,'0')}`,width:1200,height:800,alt:'',src:`/api/media/${i}?size=1600&v=1`}));
  const series=[{id:'yes',slug:'public',title:'Public',description:'',status:'published',photoIds:['0','13']},{id:'no',slug:'private-series',title:'Private',description:'',status:'draft',photoIds:['0']}];
  const xml=sitemap(publicCatalog({...emptyState(),photos,series}));
  assert.match(xml,/https:\/\/snabb.studio\/\?page=2/);
  assert.match(xml,/\/api\/media\/12\?size=1600&amp;v=1/);
  assert.match(xml,/\/series\/public/);
  assert.doesNotMatch(xml,/\/api\/media\/13|private-series|\/admin/);
});
test('untrusted editorial text cannot terminate the JSON-LD script',()=>{
  assert.doesNotMatch(jsonLd({name:'</script><script>alert(1)</script>'}),/</);
  assert.deepEqual(JSON.parse(jsonLd({name:'<test>'})),{name:'<test>'});
});
test('portrait and undersized image variants use actual width, not bounding-box width',()=>{
  const image={id:'p',src:'/full',thumbnail:'/small',width:1066,height:1600,thumbnailWidth:427};
  assert.equal(imageSources(image).srcSet,'/small 427w, /full 1066w');
  assert.equal(imageSources({...image,width:320,height:480,thumbnailWidth:320}).srcSet,'/full 320w');
  assert.equal(imageSources({...image,thumbnailWidth:null}).srcSet,'/full 1066w');
  assert.match(gallerySizes(0),/34\.666/);
});
