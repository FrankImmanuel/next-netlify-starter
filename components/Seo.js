import Head from 'next/head';
import { INDEXABLE, SITE_URL, PHOTOGRAPHER, absoluteUrl, jsonLd } from '../lib/seo.mjs';

export default function Seo({title='Photographs', description='Photographs by Samuel Sjöblom. Unplanned moments, ordinary places, and things worth looking at twice.', path='/', photo, type='CollectionPage', noindex=false}) {
  const url = absoluteUrl(path);
  const name = `${title} — ${PHOTOGRAPHER} — snabb.studio`;
  const image = photo ? absoluteUrl(photo.src) : null;
  const graph = [
    {'@type':'Person','@id':`${SITE_URL}/#photographer`,name:PHOTOGRAPHER,url:`${SITE_URL}/about`},
    {'@type':'WebSite','@id':`${SITE_URL}/#website`,name:'snabb.studio',url:SITE_URL,inLanguage:'en',creator:{'@id':`${SITE_URL}/#photographer`}},
    {'@type':type,'@id':url,url,name:title,description,inLanguage:'en',isPartOf:{'@id':`${SITE_URL}/#website`},creator:{'@id':`${SITE_URL}/#photographer`},...(image ? {primaryImageOfPage:{'@type':'ImageObject',contentUrl:image,width:photo.width,height:photo.height,creator:{'@id':`${SITE_URL}/#photographer`}}} : {})},
  ];
  return <Head>
    <title>{name}</title>
    <meta name="description" content={description}/>
    <meta name="author" content={PHOTOGRAPHER}/>
    <meta name="robots" content={!INDEXABLE || noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'}/>
    <link rel="canonical" href={url}/>
    <meta property="og:type" content="website"/><meta property="og:site_name" content="snabb.studio"/>
    <meta property="og:title" content={name}/><meta property="og:description" content={description}/><meta property="og:url" content={url}/>
    <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'}/>
    <meta name="twitter:title" content={name}/><meta name="twitter:description" content={description}/>
    {image && <meta property="og:image" content={image}/>}{image && <meta name="twitter:image" content={image}/>}
    {image && <meta property="og:image:width" content={photo.width}/>}{image && <meta property="og:image:height" content={photo.height}/>}
    {image && photo.alt && <meta property="og:image:alt" content={photo.alt}/>}
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@graph':graph})}}/>
  </Head>;
}
