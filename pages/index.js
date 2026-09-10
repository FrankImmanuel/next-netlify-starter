import {useEffect, useState} from 'react';
import {ArrowDown} from 'phosphor-react';
import {Shell, Gallery} from '../components/GallerySite';
import {PAGE_SIZE, archivePage, archivePath} from '../lib/seo.mjs';

export default function Home({photos, pageNumber, hasMore}) {
  const [items,setItems]=useState(photos);
  const [next,setNext]=useState(hasMore ? pageNumber+1 : null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{setItems(photos);setNext(hasMore?pageNumber+1:null);setError('');},[photos,pageNumber,hasMore]);
  async function loadOlder(event) {
    if (event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (busy) return;
    setBusy(true);setError('');
    try {
      const response=await fetch(`/api/catalog?page=${next}`);
      if (!response.ok) throw new Error('Could not load photographs.');
      const result=await response.json();
      setItems(current=>[...current,...result.photos.filter(p=>!current.some(existing=>existing.id===p.id))]);
      setNext(result.hasMore ? next+1 : null);
    } catch {setError('The photographs could not be loaded. Please try again.');}
    finally {setBusy(false);}
  }
  return <Shell title={pageNumber===1?'Photographs':`Photographs · Archive ${pageNumber}`} path={archivePath(pageNumber)} photo={photos[0]} description={pageNumber===1 ? undefined : `Earlier photographs by Samuel Sjöblom. Explore page ${pageNumber} of the ongoing snabb.studio collection.`}>
    <h1 className="sr-only">{pageNumber===1?'Photographs':`Photographs — archive ${pageNumber}`}</h1>
    <Gallery photos={items} offset={(pageNumber-1)*PAGE_SIZE}/>
    <div className="archive-end"><span className="eyebrow">An ongoing collection</span>
      {pageNumber>1 && <a className="text-button" href={archivePath(pageNumber-1)}>Newer photographs</a>}
      {next ? <a className="text-button" href={archivePath(next)} onClick={loadOlder} aria-disabled={busy}>{busy?'Loading photographs…':'View older photographs'} <ArrowDown size={18} aria-hidden="true"/></a> : <p>{items.length?'You have reached the beginning.':'A new collection is taking shape.'}</p>}
      <span role="status" className={error?'archive-error':'sr-only'}>{error || (busy?'Loading older photographs.':'')}</span>
    </div>
  </Shell>;
}
export async function getServerSideProps({query,res}) {
  const {privateResponse}=await import('../lib/server/cache.mjs');
  const {readState}=await import('../lib/server/storage.mjs');
  const {publicCatalog}=await import('../lib/server/model.mjs');
  privateResponse(res);
  const pageNumber=archivePage(query.page);
  if (!pageNumber) return {notFound:true};
  if (query.page==='1') return {redirect:{destination:'/',permanent:true}};
  const all=publicCatalog((await readState()).state).photos;
  const start=(pageNumber-1)*PAGE_SIZE;
  if (start>=all.length && pageNumber!==1) return {notFound:true};
  return {props:{photos:all.slice(start,start+PAGE_SIZE),pageNumber,hasMore:start+PAGE_SIZE<all.length}};
}
