import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpRight, Plus, UploadSimple, X, Check, DeviceMobile } from 'phosphor-react';
import { prepareImage } from '../lib/client-upload';

async function request(url, body, method = 'POST') {
  const response = await fetch(url, body === undefined ? {} : {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Servern kunde inte slutföra förfrågan. Försök igen om en stund.'); }
  if (!response.ok) throw new Error(data.error || 'Förfrågan misslyckades.');
  return data;
}
const thumbnail = p => p.thumbnail || `/api/media/${p.id}?size=640`;

export default function Admin() {
  const [session, setSession] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [tab, setTab] = useState('photos');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [upload, setUpload] = useState(null);
  const [uploadSeries, setUploadSeries] = useState('');
  const [alt, setAlt] = useState('');
  const [editing, setEditing] = useState(null);
  const [series, setSeries] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [token, setToken] = useState('');
  const [callback, setCallback] = useState(null);
  const fileRef = useRef(null);
  const dialog = useRef(null);
  const uploadRef = useRef(null);

  const refresh = async () => {
    const result = await request('/api/admin/catalog');
    setCatalog(result); return result;
  };
  const run = async fn => {
    setBusy(true); setError(''); setNotice('');
    try { await fn(); } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const action = async data => {
    const updated = await request('/api/admin/catalog', { ...data, revision: catalog.revision });
    setCatalog(updated); return updated;
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const info = await request('/api/admin/session');
        if (cancelled) return;
        setSession(info);
        if (!info.local) {
          const identity = await import('@netlify/identity');
          const result = await identity.handleAuthCallback();
          if (result?.type === 'invite' || result?.type === 'recovery') setCallback(result);
          await identity.getUser();
        }
        const updatedSession = await request('/api/admin/session');
        if (cancelled) return;
        setSession(updatedSession);
        if (updatedSession.authenticated) {
          const data = await refresh();
          const id = new URLSearchParams(window.location.search).get('photo');
          const photo = data.photos.find(p => p.id === id);
          if (photo) setEditing({ ...photo, seriesIds: data.series.filter(s => s.photoIds.includes(id)).map(s => s.id) });
        }
      } catch (e) { if (!cancelled) setError(e.message); }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (editing && !dialog.current?.open) dialog.current?.showModal();
    if (!editing) dialog.current?.close();
  }, [editing]);
  useEffect(() => { uploadRef.current = upload; }, [upload]);
  useEffect(() => () => { if (uploadRef.current) URL.revokeObjectURL(uploadRef.current.preview); }, []);

  const chooseFile = file => run(async () => {
    const prepared = await prepareImage(file);
    if (upload) URL.revokeObjectURL(upload.preview);
    setUpload(prepared); setAlt('');
  });
  const clearUpload = () => {
    if (upload) URL.revokeObjectURL(upload.preview);
    setUpload(null); setAlt(''); if (fileRef.current) fileRef.current.value = '';
  };
  const publishUpload = status => run(async () => {
    const { photo } = await request('/api/admin/upload', { image: upload.image, requestId: upload.requestId, seriesId: uploadSeries || null, alt });
    const current = await refresh();
    if (status === 'published') {
      const result = await request('/api/admin/catalog', { type: 'photo.update', id: photo.id, status, revision: current.revision });
      setCatalog(result);
    }
    clearUpload(); setNotice(status === 'published' ? 'Bilden är publicerad på startsidan.' : 'Bilden är sparad som utkast.');
  });
  const createSeries = () => run(async () => {
    const result = await action({ type: 'series.create', title: newTitle });
    const created = result.series[result.series.length - 1];
    setNewTitle(''); setUploadSeries(created.id);
    if (tab === 'series') setSeries(structuredClone(created));
    setNotice('Serien är skapad som utkast.');
  });
  const move = (list, index, delta) => {
    const next = [...list]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; return next;
  };

  async function login(event) {
    event.preventDefault(); const fields = new FormData(event.currentTarget);
    await run(async () => {
      const identity = await import('@netlify/identity');
      if (callback?.type === 'invite') await identity.acceptInvite(callback.token, fields.get('password'));
      else if (callback?.type === 'recovery') await identity.updateUser({ password: fields.get('password') });
      else await identity.login(fields.get('email'), fields.get('password'));
      setCallback(null); setSession(await request('/api/admin/session')); await refresh();
    });
  }

  return <div className="admin" data-lenis-prevent>
    <Head><title>Studio — snabb.studio</title><meta name="robots" content="noindex,nofollow"/></Head>
    <header className="admin-header"><Link className="wordmark" href="/">snabb.studio</Link><div><span className="admin-badge">{session?.local ? 'Lokal studio' : 'Studio'}</span><Link href="/">Visa galleri <ArrowUpRight size={17}/></Link>{session?.authenticated && !session.local && <button onClick={() => run(async () => { const identity = await import('@netlify/identity'); await identity.logout(); setCatalog(null); setSession({ ...session, authenticated: false }); })}>Logga ut</button>}</div></header>
    {error && <div role="alert" className="admin-message error">{error}<button disabled={busy} onClick={() => run(async () => { await refresh(); setSeries(null); setEditing(null); })}>Ladda om innehåll</button></div>}
    {notice && <div role="status" className="admin-message"><Check size={18}/>{notice}</div>}
    {!session ? <p className="admin-loading">Öppnar din studio…</p> : (!session.authenticated || callback) ? <section className="admin-login"><span className="eyebrow">Ditt fotografiska arbete</span><h1>{callback ? 'Välj ditt lösenord' : 'Välkommen tillbaka.'}</h1><p>Logga in för att publicera bilder och arbeta med serier.</p>{session.identityUrl ? <form onSubmit={login}>{!callback && <label>E-post<input name="email" type="email" autoComplete="username" required/></label>}<label>Lösenord<input name="password" type="password" autoComplete={callback ? 'new-password' : 'current-password'} minLength={callback ? 12 : undefined} required/></label><button className="admin-primary" disabled={busy}>{busy ? 'Ett ögonblick…' : callback ? 'Spara lösenord' : 'Logga in'}</button>{!callback && <button type="button" onClick={e => { const email = e.currentTarget.form.elements.email.value; run(async () => { if (!email) throw new Error('Fyll i din e-postadress först.'); const identity = await import('@netlify/identity'); await identity.requestPasswordRecovery(email); setNotice('Kontrollera din e-post för återställningslänken.'); }); }}>Glömt lösenord?</button>}</form> : <p>Netlify-inloggningen behöver aktiveras innan denna studio kan öppnas online.</p>}</section> : catalog && <>
      <div className="admin-intro"><div><span className="eyebrow">En bild åt gången</span><h1>Din studio.</h1></div><p>{catalog.photos.filter(p => p.status === 'published').length} publicerade bilder<br/>{catalog.series.length} serier</p></div>
      <nav className="admin-tabs" aria-label="Studio"><button aria-current={tab === 'photos' ? 'page' : undefined} onClick={() => setTab('photos')}>Bilder</button><button aria-current={tab === 'series' ? 'page' : undefined} onClick={() => setTab('series')}>Serier</button><button aria-current={tab === 'iphone' ? 'page' : undefined} onClick={() => setTab('iphone')}><DeviceMobile size={17}/>iPhone</button></nav>
      {tab === 'photos' && <>
        <section className="upload-panel"><div><h2>Nästa fotografi.</h2><p>Välj din färdigredigerade bild.<br/>Vi gör en webbkopia och behåller originalet orört.</p><input ref={fileRef} id="upload" disabled={busy} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={e => { if (e.target.files[0]) chooseFile(e.target.files[0]); }}/><label className="admin-primary upload-label" htmlFor="upload"><UploadSimple size={19}/>Välj bild</label></div>{upload ? <div className="upload-preview"><img src={upload.preview} alt="Förhandsvisning av vald bild"/><label>Serie<select value={uploadSeries} onChange={e => setUploadSeries(e.target.value)}><option value="">Ingen serie</option>{catalog.series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label>Bildbeskrivning <span>(valfritt, för tillgänglighet)</span><input value={alt} maxLength={500} onChange={e => setAlt(e.target.value)}/></label><div className="admin-actions"><button disabled={busy} className="admin-primary" onClick={() => publishUpload('published')}>{busy ? 'Bearbetar…' : 'Publicera'}</button><button disabled={busy} onClick={() => publishUpload('draft')}>Spara utkast</button><button disabled={busy} onClick={clearUpload}>Avbryt</button></div><p className="admin-hint">Bilden visas på startsidan när du publicerar. En serie kan fortfarande vara ett utkast.</p><div className="inline-create"><input aria-label="Namn på ny serie" placeholder="Ny serie…" value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={120}/><button disabled={busy || !newTitle.trim()} onClick={createSeries}><Plus size={18}/>Skapa</button></div></div> : <div className="upload-placeholder"><Plus size={32} weight="light"/><span>{busy ? 'Förbereder bilden…' : 'JPEG, PNG, WebP eller en bild från Bilder'}</span></div>}</section>
        <div className="admin-section-title"><h2>Bildarkivet</h2><span>Senaste uppladdningen först</span></div>
        {!catalog.photos.length && <p className="admin-empty">Här börjar ditt nya urval. Ladda upp det första fotografiet.</p>}
        <div className="admin-photo-grid">{[...catalog.photos].sort((a,b) => b.uploadedAt.localeCompare(a.uploadedAt)).map(p => <button className="admin-photo" key={p.id} onClick={() => setEditing({ ...p, seriesIds: catalog.series.filter(s => s.photoIds.includes(p.id)).map(s => s.id) })}><img src={thumbnail(p)} alt={p.alt || 'Fotografi'} loading="lazy"/><span>{p.status === 'published' ? 'Publicerad' : 'Utkast'}<span>{new Date(p.uploadedAt).toLocaleDateString('sv-SE')}</span></span></button>)}</div>
      </>}
      {tab === 'series' && <div className="admin-series-layout"><section><div className="inline-create"><input aria-label="Namn på ny serie" placeholder="Namn på ny serie" value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={120}/><button className="admin-primary" disabled={busy || !newTitle.trim()} onClick={createSeries}><Plus size={18}/>Skapa</button></div>{catalog.series.map((s,i) => <div className="admin-series-row" key={s.id}><button onClick={() => setSeries(structuredClone(s))}><strong>{s.title}</strong><span>{s.photoIds.length} bilder · {s.status === 'published' ? 'Publicerad' : 'Utkast'}</span></button><div><button aria-label={`Flytta ${s.title} uppåt`} disabled={busy || i === 0} onClick={() => run(() => action({ type:'series.reorder', ids:move(catalog.series.map(x=>x.id),i,-1) }))}><ArrowUp size={18}/></button><button aria-label={`Flytta ${s.title} nedåt`} disabled={busy || i === catalog.series.length-1} onClick={() => run(() => action({ type:'series.reorder', ids:move(catalog.series.map(x=>x.id),i,1) }))}><ArrowDown size={18}/></button></div></div>)}</section>
      {series ? <section className="series-editor"><span className="eyebrow">Redigera serie</span><label>Namn<input value={series.title} maxLength={120} onChange={e=>setSeries({...series,title:e.target.value})}/></label><label>Introduktion<textarea value={series.description} maxLength={4000} rows={4} onChange={e=>setSeries({...series,description:e.target.value})}/></label><p className="admin-hint">Ordna bilderna med pilarna. Välj ett omslag. Utkast till bilder blir inte offentliga när serien publiceras.</p>{series.photoIds.map((id,i)=>{const p=catalog.photos.find(p=>p.id===id);return p&&<div className="sequence-editor-row" key={id}><img src={thumbnail(p)} alt={p.alt||'Fotografi'}/><label className="cover-choice"><input type="radio" name="cover" checked={series.coverId===id} onChange={()=>setSeries({...series,coverId:id})}/>Omslag {p.status==='draft'&&<span>· Utkast</span>}</label><button disabled={i===0} aria-label={`Flytta bild ${i+1} uppåt`} onClick={()=>setSeries({...series,photoIds:move(series.photoIds,i,-1)})}><ArrowUp size={18}/></button><button disabled={i===series.photoIds.length-1} aria-label={`Flytta bild ${i+1} nedåt`} onClick={()=>setSeries({...series,photoIds:move(series.photoIds,i,1)})}><ArrowDown size={18}/></button><button aria-label={`Ta bild ${i+1} ur serien`} onClick={()=>setSeries({...series,photoIds:series.photoIds.filter(x=>x!==id),coverId:series.coverId===id?null:series.coverId})}><X size={18}/></button></div>;})}<label>Lägg till bild<select value="" onChange={e=>{if(e.target.value)setSeries({...series,photoIds:[...series.photoIds,e.target.value]});}}><option value="">Välj från arkivet</option>{catalog.photos.filter(p=>!series.photoIds.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.alt||`Bild ${p.id.slice(0,8)}`} {p.status==='draft'?'(utkast)':''}</option>)}</select></label><div className="admin-actions"><button className="admin-primary" disabled={busy} onClick={()=>run(async()=>{await action({type:'series.update',...series});setNotice('Serien är sparad.');})}>Spara ändringar</button><button disabled={busy} onClick={()=>run(async()=>{const status=series.status==='published'?'draft':'published';await action({type:'series.update',...series,status});setSeries({...series,status});setNotice(status==='published'?'Serien är publicerad.':'Serien är nu ett privat utkast.');})}>{series.status==='published'?'Avpublicera serien':'Publicera serien'}</button></div></section>:<p className="admin-empty">Välj en serie eller skapa ditt nästa arbete.</p>}</div>}
      {tab === 'iphone' && <section className="device-panel"><DeviceMobile size={32} weight="light"/><h2>Från Bilder till ditt galleri.</h2><p>Dela en bild till genvägen snabb.studio, välj serie och öppna förhandsvisningen. Publicera när allt känns rätt.</p><ol><li>Skapa en personlig uppladdningsnyckel nedan.</li><li><a href="/snabb-studio-live.shortcut">Installera genvägen</a> på din iPhone och klistra in nyckeln.</li><li>Logga in i admin i Safari. Välj sedan en bild i Bilder → Dela → snabb.studio.</li></ol>{catalog.local&&<p className="admin-hint">Den här versionen kör lokalt. iPhone-flödet behöver först en publicerad HTTPS-adress och aktiverad inloggning.</p>}<button className="admin-primary" disabled={busy} onClick={()=>run(async()=>{const result=await request('/api/admin/devices',{});setToken(result.token);await refresh();})}>Skapa uppladdningsnyckel</button>{token&&<div className="token-box"><label>Visas bara nu. Spara nyckeln i din privata genväg.<textarea readOnly value={token} rows={3}/></label><button onClick={()=>run(async()=>{await navigator.clipboard.writeText(token);setNotice('Nyckeln är kopierad.');})}>Kopiera nyckel</button></div>}{catalog.devices.filter(d=>!d.revokedAt).map(d=><div className="device-row" key={d.id}><span>iPhone · {new Date(d.createdAt).toLocaleDateString('sv-SE')}</span><button disabled={busy} onClick={()=>run(async()=>{await request('/api/admin/devices',{id:d.id},'DELETE');setToken('');await refresh();setNotice('Nyckeln är återkallad.');})}>Återkalla</button></div>)}</section>}
      <dialog className="admin-dialog" ref={dialog} onCancel={()=>setEditing(null)}>{editing&&<><header><h2>Fotografi</h2><button aria-label="Stäng bildredigering" onClick={()=>setEditing(null)}><X size={22}/></button></header><img className="edit-photo" src={editing.src||`/api/media/${editing.id}?size=1600`} alt={editing.alt||'Förhandsvisning'}/><label>Bildbeskrivning<input value={editing.alt} maxLength={500} onChange={e=>setEditing({...editing,alt:e.target.value})}/></label><label>Anteckningsrubrik <span>(valfritt, visas med handstil)</span><input value={editing.noteTitle||''} maxLength={160} onChange={e=>setEditing({...editing,noteTitle:e.target.value})}/></label><label>Anteckning <span>(visas i serie och detaljvy)</span><textarea value={editing.noteBody||''} maxLength={4000} rows={5} onChange={e=>setEditing({...editing,noteBody:e.target.value})}/></label><p className="admin-hint">Rubriken visas på startsidan. Placering och pilar väljs automatiskt. Spara uppdaterar direkt en redan publicerad bild.</p><fieldset><legend>Serier</legend>{catalog.series.map(s=><label className="checkbox-row" key={s.id}><input type="checkbox" checked={editing.seriesIds.includes(s.id)} onChange={e=>setEditing({...editing,seriesIds:e.target.checked?[...editing.seriesIds,s.id]:editing.seriesIds.filter(id=>id!==s.id)})}/>{s.title}{s.status==='draft'&&<span>Utkast</span>}</label>)}</fieldset>{error&&<p role="alert" className="error">{error}</p>}<div className="admin-actions"><button disabled={busy} className="admin-primary" onClick={()=>run(async()=>{await action({type:'photo.update',id:editing.id,alt:editing.alt,noteTitle:editing.noteTitle||'',noteBody:editing.noteBody||'',seriesIds:editing.seriesIds});setEditing(null);setNotice('Bilden är sparad.');})}>Spara</button><button disabled={busy} onClick={()=>run(async()=>{const status=editing.status==='published'?'draft':'published';await action({type:'photo.update',id:editing.id,alt:editing.alt,noteTitle:editing.noteTitle||'',noteBody:editing.noteBody||'',seriesIds:editing.seriesIds,status});setEditing(null);setNotice(status==='published'?'Bilden är publicerad.':'Bilden är avpublicerad från hela webbplatsen.');})}>{editing.status==='published'?'Avpublicera bild':'Publicera bild'}</button></div><p className="admin-hint">Avpublicering döljer bilden på hela webbplatsen. Bilden behålls här och kan publiceras igen.</p></>}</dialog>
    </>}
  </div>;
}
