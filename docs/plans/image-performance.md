# Bildprestanda och identitetsbärande laddning

Status: planeringen är klar och planen bekräftad av användaren 2026-09-09 (”7. ja”). Implementation är utförd lokalt för granskning. Se [verifieringsrapporten](../verification/seo-images.md) för resultat och återstående produktionskontroller.

## Bekräftade beslut — 2026-09-09

- Bildladdningen ska kännas stillsam och bära snabb.studios identitet.
- Absolut ingen extra väntetid för att visa en effekt. Användarens formulering: ”Absolut ingen extra väntetid, men vore bra med något unikt och id bärande”.
- En färdig bild får aldrig hållas tillbaka för en loader, en minimitid eller en köad animation. Den tidigare idén om toning måste prövas mot detta hårdare krav.
- Tidigare publicerade bilder får kunna hämtas via direkt URL i högst fem minuter efter avpublicering om cachning ger mätbar nytta. Utkast förblir privata. Se [ADR 0001](../adr/0001-bounded-cache-after-unpublication.md).
- Den visuella riktningen är sajtens befintliga papper, punktmönster och ett diskret handritat pennmärke. Användaren valde B, liten understrykning, efter jämförelse i den lokala designstudien.

De sista två besluten bekräftades med ”5. ja” och ”6. ja”.

## Verifierat nuläge

Granskat i `/Users/sam/repos/next-netlify-starter`, lokal `main`, commit `9b9b980` den 2026-09-09. Aktuell liveprestanda är inte uppmätt; fynden är kandidater till förbättring, inte bevisade flaskhalsar.

- Upload skapar WebP i bounding boxes 640 och 1600 pixlar, kvalitet 80/85. Befintlig Photo anger dimensioner, srcSet, sizes, async decoding och native lazy loading.
- srcSet anger alltid 640w/1600w fast porträtt och små original kan ha mindre verklig bredd. Variantbredder och sizes behöver bli korrekta för respektive användning.
- De första två galleribilderna och samtliga serieomslag är eager. Faktisk första viewport och LCP måste avgöra prioriteringen.
- Bilder, offentliga sidor och katalog använder private/no-store. CMS.md dokumenterar omedelbar avpublicering som skäl. Bildanrop passerar en funktion och läser katalog samt blob.
- Startsidan skickar hela publika katalogen som siddata trots att endast de första 12 bilderna visas.
- Ingen laddningstillståndsstyrd platshållare eller bildövergång finns i Photo.
- Identiteten innehåller pappersyta, punktmönster, egen Snabb Hand-typografi och handritade pennstreck/pilar. Befintlig motion respekterar reducerad rörelse och native touch.

## Arbetsordning

1. Mät produktionens första besök och återbesök på mobil/desktop: bildbytes, begäranden, svarstider, LCP och layoutstabilitet. Separera labbmätning från eventuell verklig användardata.
2. Rätta responsiva bilddimensioner och välj sizes per bildsammanhang. Anpassa prioritet efter vad som faktiskt syns först.
3. Utred och inför cachning där mätning motiverar det, inom det accepterade femminuterstaket efter avpublicering. Räkna in alla cachelager och undvik oavsiktligt förlängd stale-serving. Behåll nuvarande modell om nytta eller korrekt synlighetsgräns inte kan visas.
4. Ta fram två små visuella varianter inom den valda riktningen papper/pennmärke för användarens jämförelse. Fotografiet visas direkt när det är redo; den valda platshållaren ska kunna försvinna omedelbart.
5. Verifiera långsam anslutning, varm cache, bildfel, snabb scroll, bildvisarens navigation, JavaScript avstängt och reducerad rörelse.

## Designgränser att verifiera

- Identiteten finns i den verkliga väntans platshållare eller runt bilden, utan att skymma en färdig bild.
- Ingen artificiell väntan, fördröjd scroll-reveal eller stagger som håller tillbaka innehåll.
- Redan tillgängliga bilder visas direkt utan att laddningseffekten spelas upp igen.
- Ingen extra bildhämtning eller väntan på specialfont för att kunna visa platshållaren.
- Bildproportioner reserveras; fotografiets färger och utsnitt bevaras.
- Prestandavinst redovisas separat från den visuella upplevelsen och bedöms mot samma förutsättningar före/efter.

## Leverans och acceptans

- Före/efter-redovisning för mobil och desktop med samma bilder och testförhållanden: kall/varm cache, överförda bildbytes, antal anrop, LCP och layoutstabilitet. Upprepade jämförbara mätningar används för att skilja förbättring från brus.
- srcSet-deskriptorer stämmer med faktisk variantbredd även för porträtt och små original. sizes motsvarar galleriet, serieomslagen, About och bildvisaren.
- Synliga startbilder prioriteras utifrån mätning. Bilder längre ned laddas vid behov. Fotografiernas kvalitet och utsnitt jämförs visuellt.
- Ingen bild får fördröjd synlighet för att invänta effekt, scroll eller font. Cacheträffar visar inte en påtvingad loader. Platshållaren tillför ingen separat nätverksbegäran.
- Bildfel lämnar ett begripligt återhämtningsbart läge. Snabb scroll och upprepad bildvisarnavigation ska inte visa fel fotografi eller fastna i ett laddningstillstånd.
- Inga nya layoutskiften orsakas av laddningsuttrycket. Reducerad rörelse och användning utan JavaScript behåller tillgång till fotografierna.
- Om cachning införs: verifiera aldrig publicerat utkast, publicering, avpublicering, direkt URL med varm cache, ny klient, båda bildstorlekarna och den totala tidsgränsen på fem minuter. Privata/adminsvar får inte hamna i publik cache.
- Kostnad och funktionsanrop redovisas där data finns. Ingen infrastrukturflytt eller nytt animationsbibliotek är förutbestämt.

## Återstående arbete inom implementationen

Baslinjemätning avgör vilka flaskhalsar som ska åtgärdas och vilka prestandavinster som kan lovas. Användaren har valt den lilla understrykningen (B). Detta är planerade kontrollpunkter, inte dolda designbeslut.

## Verktyg och spårbarhet

Föreslagna befintliga skills: emil-design-eng för bedömning och animate för implementation. Användarens nollväntetidskrav går före generella animationsråd. Taste Skill och awesome-design-md är utvärderade som möjliga referenser, inte installerade eller valda som ny designgrund.

Källor: components/GallerySite.js, lib/server/upload.mjs, pages/api/media/[id].js, lib/server/auth.mjs, pages/index.js, pages/series/index.js, styles/gallery.css, CMS.md, typography/snabb-hand/README.md.

Extern teknisk referens: https://web.dev/articles/browser-level-image-lazy-loading — prioritera bilder i första vyn och reservera bilddimensioner.

Produktavvägningen för cache är dokumenterad i ADR 0001. Teknisk cachelösning återstår att verifiera. Övriga reversibla visuella val dokumenteras här.
