import Link from '../../components/TransitionLink';
import { ArrowLeft, ArrowUpRight } from 'phosphor-react';
import {pageDescription} from '../../lib/seo.mjs';
import { Shell, Gallery } from '../../components/GallerySite';

export default function Series({ series, photos }) {
  return <Shell active="series" title={series.title} path={`/series/${series.slug}`} photo={photos.find(p=>p.id===series.coverId)||photos[0]} description={pageDescription(series.description, `${series.title}: a photographic series by Samuel Sjöblom. ${photos.length} photographs, presented in a curated sequence at snabb.studio.`)}><section className="series-intro"><Link className="eyebrow" href="/series"><ArrowLeft size={15} aria-hidden="true"/> All series</Link><h1>{series.title}</h1><div className="series-description"><span className="eyebrow">{photos.length} photographs</span>{series.description && <p style={{ whiteSpace: 'pre-line' }}>{series.description}</p>}</div></section><Gallery photos={photos} sequence/><div className="archive-end"><Link className="text-button" href="/series">Back to series <ArrowUpRight size={18} aria-hidden="true"/></Link></div></Shell>;
}
export async function getServerSideProps({ params, res }) {
  const { readState } = await import('../../lib/server/storage.mjs');
  const { publicCatalog } = await import('../../lib/server/model.mjs');
  const catalog = publicCatalog((await readState()).state);
  const series = catalog.series.find(s => s.slug === params.slug);
  const {privateResponse}=await import('../../lib/server/cache.mjs');
  privateResponse(res);
  if (!series) return { notFound: true };
  return { props: { series, photos: series.photoIds.map(id => catalog.photos.find(p => p.id === id)) } };
}
