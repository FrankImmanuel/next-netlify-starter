import { useState } from 'react';
import { Shell, Gallery } from '../components/GallerySite';

const notes = [
 ['A little more time.', 'Some photographs begin with waiting. Looking again at the light, and at what happens when nothing much seems to happen.'],
 ['At the edge of the ordinary.', 'A small detail can change the whole picture. This is a note about looking for those details.'],
 null,
 ['Colour, then a moment.', 'An exercise in noticing colour first, then waiting for something to interrupt the order.'],
 ['On the way home.', 'Collected along a familiar route. A place becomes different when there is time to stop.'],
 null,
 ['Worth another look.', 'A photograph to return to when the sequence begins to take shape.'],
];
export default function Journal({photos}) {
 const [sequence,setSequence]=useState(false);
 const [dots,setDots]=useState(true);
 return <div className={`journal-prototype ${dots?'journal-dots':''}`}><Shell title="Journal prototype"><aside className="journal-controls" aria-label="Prototype controls"><span>Local prototype · Example notes</span><button aria-pressed={!sequence} onClick={()=>setSequence(false)}>Home</button><button aria-pressed={sequence} onClick={()=>setSequence(true)}>Series view</button><button aria-pressed={dots} onClick={()=>setDots(!dots)}>Dots {dots?'on':'off'}</button></aside>{sequence && <section className="series-intro"><h1>Along the way.</h1><p>A study in ordinary moments. Example text for the journal prototype.</p></section>}<Gallery key={String(sequence)} photos={photos} sequence={sequence}/><div className="archive-end"><p className="eyebrow">Example notes for layout review. Click a photograph to read the full note.</p></div></Shell></div>;
}
export async function getServerSideProps({res}) {
 if (process.env.NODE_ENV !== 'development') return {notFound:true};
 const {readState}=await import('../lib/server/storage.mjs');
 const {publicCatalog}=await import('../lib/server/model.mjs');
 const photos=publicCatalog((await readState()).state).photos.slice(0,12).map((photo,i)=>({...photo,noteLayout:(i%8===6 || (i%8===0 && photo.height>photo.width))?'side-right':i%8===1?'vertical':i%8===3?'right':'left',noteTilt:[-2.4,1.6,-.8,-1.5,2.1,-1.2,2.7,-1.8][i%8],noteArrow:(i%8===6 || (i%8===0 && photo.height>photo.width))?'curve':i%4===0?'curve':i%7===3?'curve':null,noteTitle:notes[i%notes.length]?.[0]||'',noteBody:notes[i%notes.length]?.[1]||''}));
 res.setHeader('Cache-Control','no-store');
 return {props:{photos}};
}
