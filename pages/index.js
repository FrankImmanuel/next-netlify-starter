import { useState } from 'react';
import { ArrowDown } from 'phosphor-react';
import { Shell, Gallery } from '../components/GallerySite';

export default function Home({ photos }) {
  const [count, setCount] = useState(12);
  return <Shell><h1 className="sr-only">Photographs</h1><Gallery photos={photos.slice(0, count)}/><div className="archive-end"><span className="eyebrow">An ongoing collection</span>{count < photos.length ? <button className="text-button" onClick={() => setCount(count + 12)}>View older photographs <ArrowDown size={18} aria-hidden="true"/></button> : <p>{photos.length ? 'You have reached the beginning.' : 'A new collection is taking shape.'}</p>}</div></Shell>;
}
export async function getServerSideProps({ res }) {
  const { readState } = await import('../lib/server/storage.mjs');
  const { publicCatalog } = await import('../lib/server/model.mjs');
  res.setHeader('Cache-Control', 'private, no-store');
  return { props: { photos: publicCatalog((await readState()).state).photos } };
}
