import Link from '../../components/TransitionLink';
import { ArrowUpRight } from 'phosphor-react';
import {coverSizes} from '../../lib/images.mjs';
import { Shell, Photo } from '../../components/GallerySite';

export default function Series({ series, photos }) {
  return <Shell active="series" title="Photographic series" path="/series" photo={photos.find(p=>p.id===series[0]?.coverId)} description="Explore photographic series by Samuel Sjöblom. Selected photographs brought together as bodies of work at snabb.studio."><section className="page-intro"><span className="eyebrow">Photographic works</span><h1>Series</h1><p>Images that find their meaning together.</p></section><section className="series-list">{series.map((s,i) => <Link key={s.id} className="series-card" href={`/series/${s.slug}`}><Photo photo={photos.find(p => p.id === s.coverId)} eager={i===0} priority={i===0} sizes={coverSizes}/><div className="series-label"><h2>{s.title}</h2><span>{s.photoIds.length} photographs <ArrowUpRight size={18} aria-hidden="true"/></span></div></Link>)}{!series.length && <p className="sample-note">New work is taking shape.</p>}</section></Shell>;
}
export async function getServerSideProps({ res }) {
  const { readState } = await import('../../lib/server/storage.mjs');
  const { publicCatalog } = await import('../../lib/server/model.mjs');
  const {privateResponse}=await import('../../lib/server/cache.mjs');
  const {withImageDimensions}=await import('../../lib/server/image-dimensions.mjs');
  privateResponse(res);
  const catalog=publicCatalog((await readState()).state);
  return {props:{series:catalog.series,photos:await withImageDimensions(catalog.photos.filter(p=>catalog.series.some(s=>s.coverId===p.id)))}};
}
