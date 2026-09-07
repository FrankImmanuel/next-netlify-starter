import { ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight, X } from 'phosphor-react';
import { useScrollMotion, useGalleryParallax } from './ScrollMotion';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function Shell({children,active='photographs',title='Photographs'}) {
 return <div className="journal-prototype journal-dots"><Head><title>{title + ' — snabb.studio'}</title><meta name="description" content="Photographs by Samuel Sjöblom. Unplanned moments, ordinary places, and things worth looking at twice."/>{process.env.NEXT_PUBLIC_INDEXABLE !== "true" && <meta name="robots" content="noindex,nofollow"/>}</Head><a className="skip" href="#content">Skip to photographs</a><header className="header"><Link className="wordmark" href="/">snabb.studio</Link><nav aria-label="Main navigation">{[['photographs','/','Photographs'],['series','/series','Series'],['about','/about','About']].map(([id,url,label])=><Link key={id} href={url} aria-current={active===id?'page':undefined}>{label}</Link>)}</nav></header><main id="content">{children}</main><footer className="footer"><span>© {new Date().getFullYear()} snabb.studio</span><span>Photographs by Samuel Sjöblom</span><a href="#content">Back to top <ArrowUp size={16} aria-hidden="true"/></a></footer></div>;
}
export function Photo({photo,eager=false}) {
 if (!photo) return null;
 const source = photo.src || `/photos/${photo.id}-1600.webp`;
 const small = photo.thumbnail || `/photos/${photo.id}-640.webp`;
 return <img src={source} srcSet={`${small} 640w, ${source} 1600w`} sizes="(max-width: 700px) 92vw, 55vw" width={photo.width} height={photo.height} alt={photo.alt} loading={eager?'eager':'lazy'} decoding="async"/>;
}
function PhotoNote({photo,full=false}) {
 if (!photo.noteTitle && !(full && photo.noteBody)) return null;
 return <div className={`photo-note${photo.noteArrow?' has-note-arrow':''}${photo.noteLayout ? ` note-${photo.noteLayout}` : ''}`} style={photo.noteTilt ? {'--note-tilt':`${photo.noteTilt}deg`} : undefined}>{photo.noteArrow && <svg className="note-arrow" viewBox="0 0 100 130" fill="none" aria-hidden="true"><path d={'M80 117 C59 107 32 54 28 12 M15 46 Q22 17 28 12 Q37 25 52 36'} /></svg>}{photo.noteTitle && <h2>{photo.noteTitle}</h2>}{full && photo.noteBody && <p>{photo.noteBody}</p>}</div>;
}
export function Gallery({photos,sequence=false}) {
 photos = photos.map((photo,i)=>({...photo,noteLayout:(i%8===6 || (i%8===0 && photo.height>photo.width))?'side-right':i%8===1?'vertical':i%8===3?'right':'left',noteTilt:[-2.4,1.6,-.8,-1.5,2.1,-1.2,2.7,-1.8][i%8],noteArrow:(i%8===6 || (i%8===0 && photo.height>photo.width))?'curve':i%4===0?'curve':i%7===3?'curve':null}));
 const scroll = useScrollMotion();
 const galleryRef = useGalleryParallax(photos.length, sequence);
 const [selected,setSelected]=useState(null); const dialog=useRef(null); const trigger=useRef(null);
 const close=()=>{dialog.current?.close();setSelected(null);trigger.current?.focus();};
 useEffect(()=>{if(selected===null)return;scroll?.stop();const previous=document.body.style.overflow;document.body.style.overflow='hidden';if(!dialog.current.open)dialog.current.showModal();return()=>{document.body.style.overflow=previous;scroll?.start();};},[selected!==null,scroll]);
 const move=(step)=>setSelected(i=>Math.min(photos.length-1,Math.max(0,i+step)));
 return <><div ref={galleryRef} className={sequence?'gallery sequence':'gallery'}>{photos.map((photo,i)=><figure key={photo.id} className={`work position-${i%8}`}><div className="photo-motion"><button className="photo-button" aria-label={`Open photograph ${i+1}: ${photo.alt}`} onClick={e=>{trigger.current=e.currentTarget;setSelected(i);}}><Photo photo={photo} eager={i<2}/></button><PhotoNote photo={photo} full={sequence}/></div></figure>)}</div><dialog data-lenis-prevent ref={dialog} className="viewer" aria-label="Photograph viewer" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===dialog.current)close();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}>{selected!==null&&<><div className="viewer-top"><span aria-live="polite">{String(selected+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button onClick={close} autoFocus aria-label="Close photograph">Close <X size={22} weight="light" aria-hidden="true"/></button></div><div className="viewer-image"><Photo photo={photos[selected]} eager/></div><PhotoNote photo={photos[selected]} full/><div className="viewer-bottom"><button disabled={selected===0} onClick={()=>move(-1)}><ArrowLeft size={18} aria-hidden="true"/> Previous</button>{photos[selected].series.map(series=><Link key={series.slug} href={`/series/${series.slug}`} onClick={close}>{series.title} <ArrowUpRight size={18} aria-hidden="true"/></Link>)}<button disabled={selected===photos.length-1} onClick={()=>move(1)}>Next <ArrowRight size={18} aria-hidden="true"/></button></div></>}</dialog></>;
}
