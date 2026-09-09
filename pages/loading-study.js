import {useState} from 'react';
import {Shell,Photo} from '../components/GallerySite';
export default function LoadingStudy({photo}) {
  const [show,setShow]=useState(false);
  return <Shell title="Loading study" path="/loading-study" noindex><section className="loading-study"><span className="eyebrow">snabb.studio · Loading study</span><h1>A little mark on paper.</h1><p>Two quiet placeholders. The photograph takes over as soon as it is available.</p><div className="loading-study-grid">{[['corners','A · Pencil corners'],['underline','B · A small underline']].map(([variant,label])=><section key={variant}><h2>{label}</h2>{show?<Photo photo={photo} eager variant={variant}/>:<span className={`photo-surface photo-surface--${variant}`}><span className="photo-paper" aria-hidden="true"><svg className="photo-pen" viewBox="0 0 64 64" fill="none"><path d={variant==='corners'?'M9 24 Q8 12 11 10 Q18 8 26 10 M38 54 Q49 56 54 52 Q56 45 54 38':'M11 35 Q26 29 53 31 M18 39 Q36 34 49 35'}/></svg></span></span>}</section>)}</div><div className="loading-study-controls"><button className="text-button" onClick={()=>setShow(v=>!v)}>{show?'Compare placeholders':'Load photograph'}</button><a className="text-button" href="/">Open gallery</a></div></section></Shell>;
}
export async function getServerSideProps({res}) {
  if(process.env.NODE_ENV!=='development') return {notFound:true};
  const {privateResponse}=await import('../lib/server/cache.mjs');
  const {readState}=await import('../lib/server/storage.mjs');
  const {publicCatalog}=await import('../lib/server/model.mjs');
  const {withImageDimensions}=await import('../lib/server/image-dimensions.mjs');
  privateResponse(res);
  const photo=(await withImageDimensions(publicCatalog((await readState()).state).photos.slice(0,1)))[0];
  return photo?{props:{photo}}:{notFound:true};
}
