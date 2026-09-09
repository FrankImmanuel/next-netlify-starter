import {useEffect, useRef, useState} from 'react';
import {imageSources} from '../lib/images.mjs';

function ImageSurface({photo, eager=false, priority=false, sizes='100vw', variant='underline', retryable=false}) {
  const img=useRef(null);
  const [state,setState]=useState('loading');
  const [attempt,setAttempt]=useState(0);
  const sources=imageSources(photo);
  useEffect(()=>{
    if (img.current?.complete) setState(img.current.naturalWidth ? 'ready' : 'error');
  },[attempt]);
  return <span className={`photo-surface photo-surface--${variant}`} data-state={state}>
    <span className="photo-paper" aria-hidden="true"><svg className="photo-pen" viewBox="0 0 64 64" fill="none">
      {variant==='corners' ? <path d="M9 24 Q8 12 11 10 Q18 8 26 10 M38 54 Q49 56 54 52 Q56 45 54 38"/> : <path d="M11 35 Q26 29 53 31 M18 39 Q36 34 49 35"/>}
    </svg></span>
    <img key={attempt} ref={img} {...sources} sizes={sizes} width={photo.width} height={photo.height} alt={photo.alt || ''} loading={eager?'eager':'lazy'} fetchpriority={priority?'high':undefined} decoding="async" onLoad={()=>setState('ready')} onError={()=>setState('error')}/>
    {state==='error' && <span className="photo-error" role="status">Photograph unavailable.{retryable && <button type="button" onClick={()=>{setState('loading');setAttempt(n=>n+1);}}>Try again</button>}</span>}
  </span>;
}
export default function Photo(props) {
  if (!props.photo) return null;
  return <ImageSurface key={props.photo.src || props.photo.id} {...props}/>;
}
