import {useEffect, useRef, useState} from 'react';
import {ArrowDown} from 'phosphor-react';
import {Shell, Gallery} from '../components/GallerySite';
import {archivePages, archivePage, archivePath} from '../lib/seo.mjs';

export default function Home({photos, pageNumber, hasMore, offset}) {
  const [items,setItems]=useState(photos);
  const [next,setNext]=useState(hasMore ? pageNumber+1 : null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [announcement,setAnnouncement]=useState('');
  const gallery=useRef(null);
  const archiveEnd=useRef(null);
  const pendingFocus=useRef(null);
  const request=useRef(null);
  useEffect(()=>{
    setItems(photos);setNext(hasMore?pageNumber+1:null);setError('');setAnnouncement('');setBusy(false);
    pendingFocus.current=null;
    return ()=>{request.current?.abort();request.current=null;};
  },[photos,pageNumber,hasMore]);
  useEffect(()=>{
    if(pendingFocus.current===null)return;
    const target=gallery.current?.querySelectorAll('.photo-button')[pendingFocus.current] || archiveEnd.current;
    pendingFocus.current=null;
    target?.focus();
  },[items]);
  async function loadOlder(event) {
    if (event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (request.current || !next) return;
    const controller=new AbortController();
    request.current=controller;
    const trigger=event.currentTarget;
    setBusy(true);setError('');setAnnouncement('');
    try {
      const response=await fetch(`/api/catalog?page=${next}`,{signal:controller.signal});
      if (!response.ok) throw new Error('Could not load photographs.');
      const result=await response.json();
      if(controller.signal.aborted)return;
      const added=result.photos.filter(p=>!items.some(existing=>existing.id===p.id));
      // Do not steal focus if the visitor moved elsewhere while loading.
      if(document.activeElement===trigger)pendingFocus.current=items.length;
      setItems([...items,...added]);
      setNext(result.hasMore ? next+1 : null);
      setAnnouncement(`${added.length} ${added.length===1?'photograph':'photographs'} loaded.${result.hasMore?'':' You have reached the beginning.'}`);
    } catch {if(!controller.signal.aborted)setError('The photographs could not be loaded. Please try again.');}
    finally {if(request.current===controller){request.current=null;setBusy(false);}}
  }
  return <Shell title={pageNumber===1?'Photographs':`Photographs · Archive ${pageNumber}`} path={archivePath(pageNumber)} photo={photos[0]} description={pageNumber===1 ? undefined : `Earlier photographs by Samuel Sjöblom. Explore page ${pageNumber} of the ongoing snabb.studio collection.`}>
    <h1 className="sr-only">{pageNumber===1?'Photographs':`Photographs — archive ${pageNumber}`}</h1>
    <div ref={gallery}><Gallery photos={items} offset={offset}/></div>
    <div className="archive-end"><span className="eyebrow">An ongoing collection</span>
      {pageNumber>1 && <a className="text-button" href={archivePath(pageNumber-1)}>Newer photographs</a>}
      {next ? <a ref={archiveEnd} className="text-button" href={archivePath(next)} onClick={loadOlder} aria-disabled={busy}>{busy?'Loading photographs…':'View older photographs'} <ArrowDown size={18} aria-hidden="true"/></a> : <p ref={archiveEnd} tabIndex={-1}>{items.length?'You have reached the beginning.':'A new collection is taking shape.'}</p>}
      <span role="status" aria-atomic="true" className={error?'archive-error':'sr-only'}>{error || (busy?'Loading older photographs.':announcement)}</span>
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
  const all=publicCatalog((await readState()).state).photos.filter(p=>p.showOnHome);
  const page=archivePages(all)[pageNumber-1];
  if (!page) return {notFound:true};
  return {props:{photos:page.photos,pageNumber,hasMore:page.hasMore,offset:page.start}};
}
