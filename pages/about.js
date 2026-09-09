import { ArrowUpRight } from 'phosphor-react';
import {aboutSizes} from '../lib/images.mjs';
import {Shell,Photo} from '../components/GallerySite';
export default function About({photo}){return <Shell active="about" title="About Samuel Sjöblom" path="/about" type="AboutPage" photo={photo} description="Samuel Sjöblom’s photographic observations of everyday life, ordinary places and unexpected colour. Explore the work and get in touch."><section className="about-layout"><div><span className="eyebrow">About snabb.studio</span><h1>With the intention<br/>to make photos<br/>that feel like<br/><em>something.</em></h1><div className="about-copy"><p>Photographs by Samuel Sjöblom.</p><p>An ongoing observation of everyday life. Ordinary places, unexpected colour, and moments that ask for a second look.</p><a className="text-button" href="mailto:s.sjoblom@gmail.com">Get in touch <ArrowUpRight size={18} aria-hidden="true"/></a></div></div>{photo && <figure><Photo photo={photo} eager sizes={aboutSizes} retryable/></figure>}</section></Shell>;}

export async function getServerSideProps({ res }) {
  const { readState } = await import("../lib/server/storage.mjs");
  const { publicCatalog } = await import("../lib/server/model.mjs");
  const {privateResponse}=await import("../lib/server/cache.mjs");
  const {withImageDimensions}=await import("../lib/server/image-dimensions.mjs");
  privateResponse(res);
  return { props: { photo: (await withImageDimensions(publicCatalog((await readState()).state).photos.slice(0,1)))[0] || null } };
}
