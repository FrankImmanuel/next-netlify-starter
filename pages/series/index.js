import Link from 'next/link';
import { ArrowUpRight } from 'phosphor-react';
import { Shell, Photo } from '../../components/GallerySite';

export default function Series({ series, photos }) {
  return <Shell active="series" title="Series"><section className="page-intro"><span className="eyebrow">Photographic works</span><h1>Series</h1><p>Images that find their meaning together.</p></section><section className="series-list">{series.map(s => <Link key={s.id} className="series-card" href={`/series/${s.slug}`}><Photo photo={photos.find(p => p.id === s.coverId)} eager/><div className="series-label"><h2>{s.title}</h2><span>{s.photoIds.length} photographs <ArrowUpRight size={18} aria-hidden="true"/></span></div></Link>)}{!series.length && <p className="sample-note">New work is taking shape.</p>}</section></Shell>;
}
export async function getServerSideProps({ res }) {
  const { readState } = await import('../../lib/server/storage.mjs');
  const { publicCatalog } = await import('../../lib/server/model.mjs');
  res.setHeader('Cache-Control', 'private, no-store');
  return { props: publicCatalog((await readState()).state) };
}
