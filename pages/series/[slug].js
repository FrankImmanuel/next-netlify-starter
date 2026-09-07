import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'phosphor-react';
import { Shell, Gallery } from '../../components/GallerySite';

export default function Series({ series, photos }) {
  return <Shell active="series" title={series.title}><section className="series-intro"><Link className="eyebrow" href="/series"><ArrowLeft size={15} aria-hidden="true"/> All series</Link><h1>{series.title}</h1><div className="series-description"><span className="eyebrow">{photos.length} photographs</span>{series.description && <p style={{ whiteSpace: 'pre-line' }}>{series.description}</p>}</div></section><Gallery photos={photos} sequence/><div className="archive-end"><Link className="text-button" href="/series">Back to series <ArrowUpRight size={18} aria-hidden="true"/></Link></div></Shell>;
}
export async function getServerSideProps({ params, res }) {
  const { readState } = await import('../../lib/server/storage.mjs');
  const { publicCatalog } = await import('../../lib/server/model.mjs');
  const catalog = publicCatalog((await readState()).state);
  const series = catalog.series.find(s => s.slug === params.slug);
  res.setHeader('Cache-Control', 'private, no-store');
  if (!series) return { notFound: true };
  return { props: { series, photos: series.photoIds.map(id => catalog.photos.find(p => p.id === id)) } };
}
