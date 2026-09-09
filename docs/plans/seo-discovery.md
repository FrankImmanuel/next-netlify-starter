# SEO och upptäckt av snabb.studio

Status: planeringen är klar och planen bekräftad av användaren 2026-09-09 (”7. ja”). Implementation är utförd lokalt för granskning. Se [verifieringsrapporten](../verification/seo-images.md) för resultat och återstående produktionskontroller.

## Utgångspunkt

Arbetsrepo: `/Users/sam/repos/next-netlify-starter`. Användaren anger `main` som den aktuella deployade versionens källa. Lokal granskning 2026-09-09 på commit `9b9b980`; ingen ny hämtning eller verifiering av remote/deploy gjordes. Historiska statusavsnitt i PROTOTYPE.md och CMS.md ska läsas med detta i åtanke.

## Bekräftade beslut — 2026-09-09

- Konstnärlig riktning enligt produktbriefen kvarstår.
- Primär publik: kuratorer, gallerister och fotointresserade som söker nya fotografer.
- Sverige och Norden prioriteras; publikt språk förblir engelska.
- Framgång avser relevanta kontakter och intresse för serierna.
- About och korta serieintroduktioner får utvecklas endast när granskningen visar ett konkret behov. Användaren faktagranskar nya texter. Ingen generell textutökning ingår som självändamål.

Besluten bekräftades av användaren med ”1. korrekt”, ”2. korrekt” och ”4. Om det krävs” i planeringssamtalet. Se även [ordlistan](../../CONTEXT.md).

## Verifierade kodfynd

- `components/GallerySite.js`: gemensam metabeskrivning; canonical, Open Graph och strukturerad data saknas i den aktuella sidmallen.
- `next.config.js`: produktion (`CONTEXT=production`) aktiverar indexering; preview har noindex. Ingen aktuell livekontroll kunde genomföras med webbverktyget. CMS.md dokumenterar tidigare lyckad produktionskontroll.
- Sitemap och robots-rutter hittades inte i repot.
- Startsidan visar först 12 bilder; resten läggs till via knapp, utan crawlbara pagineringslänkar.
- `/index-old` och `/style` finns kvar som publika legacy-rutter. Den gamla startsidan innehåller inaktuella metadata.
- Bildbeskrivningar är valfria i admin. Serieintroduktioner stöds redan.

## Arbetsordning

1. Verifiera aktuell produktion: statuskoder, indexerbarhet, canonical/domän, renderat språk och tillgång till Search Console-data.
2. Kartlägg relevanta sökintentioner mot faktiskt fotografiskt innehåll och prioriterad publik. Bekräfta konstnärlig beskrivning och geografiska fakta innan copy skrivs.
3. Planera sidunika metadata, delningsbilder, korrekt strukturerad data, sitemap, robots och hantering av legacy-rutter.
4. Åtgärda upptäckbarhet för äldre fotografier och bristande bildbeskrivningar. Föreslå ändringar i About och serieintroduktioner bara där befintligt innehåll inte räcker; motivera behovet och låt användaren faktagranska texterna.
5. Verifiera renderat HTML, interna länkar och metadata. Följ därefter indexering, relevanta sökningar och kontakter över tid; ranking är inget leveranslöfte.

## Leverans och acceptans

- Produktionssidor går att indexera och har avsedd canonical samt engelskt dokumentspråk. Preview och admin behåller avsedd indexeringsspärr.
- Startsida, About, serieindex och publicerade serier får relevanta, sidunika metadata. Delningsbilder och strukturerad data ska motsvara faktiskt innehåll.
- Sitemap omfattar relevanta publika URL:er, inte utkast eller interna/äldre provsidor. Legacy-rutter får en motiverad åtgärd efter kontroll av eventuella externa länkar.
- Äldre publicerade fotografier kan upptäckas utan att en crawler måste klicka på en JavaScript-knapp. Välj minsta lämpliga lösning efter kontroll av serier och arkiv; individuella fotosidor är inte förbestämda.
- Varje föreslagen synlig textändring har ett konstaterat behov. Fotografens plats, meriter eller motiv hittas inte på för sökordens skull.
- Verifiering omfattar renderat HTML, metadata, länkar, sitemap och draft/public-gränser. Resultat och kvarstående externa beroenden dokumenteras.

## Bekräftad uppföljning — 2026-09-09

Använd Search Console för indexering, sökfrågor, exponeringar och klick när behörig åtkomst finns; användaren noterar manuellt relevanta inkommande kontakter. Inga nya besökarspårningsverktyg införs i denna första etapp. Serieintresse får tills vidare kvalitativa belägg från kontakter; sökklick är inte bevis för engagemang i serien.

Baslinje före ändring, sedan jämförelse efter 4–8 veckor när data finns. Detta är en kontrollpunkt för utvärdering, inte en schemalagd automation eller garanti om SEO-resultat. Kvantitativt tillväxtmål bestäms först om baslinjen ger stöd för det.

## Fakta att ta fram under arbetet

Aktuell liveindexering, Search Console-åtkomst och sökdata, publicerade seriers innehåll samt eventuell geografisk hemvist som behöver nämnas. Efterfråga bara saknade författarfakta som behövs för konkret copy; målgruppens geografi är inte fotografens hemvist.

## Spårbarhet

Utgångskällor: PROTOTYPE.md, CMS.md, components/GallerySite.js, next.config.js, pages/index.js, pages/about.js, pages/series/[slug].js. Beslut om uppföljning och de två planerna bekräftades med ”7. ja”. Bildarbetets cacheavvägning finns i [ADR 0001](../adr/0001-bounded-cache-after-unpublication.md).

## Sökintentioner i första implementationen

Prioriterade innehållsteman utifrån befintligt verk och målgrupp: fotografens namn + photography, snabb.studio, photographic series, everyday life photography och den faktiskt publicerade serien Food and drinks. Dessa är redaktionella hypoteser, inte uppmätta sökvolymer eller verifierade sökfrågor. Search Console-data ska avgöra senare prioritering. Inga påståenden om svensk hemvist eller lokal fotografservice tillförs eftersom de inte är verifierade och uppdragsförsäljning inte är huvudmålet.

Den tekniska grunden kräver inte mer synlig About-text. De 21 bilderna utan alt-text har däremot ett konkret tillgänglighets- och innehållsbehov; se [beskrivningsutkasten](../editorial/photo-descriptions.md), som ägaren ska granska innan CMS uppdateras.
