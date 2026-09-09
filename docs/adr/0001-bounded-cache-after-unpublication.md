---
status: accepted
---

# Acceptera högst fem minuters kvarvarande åtkomst efter avpublicering

Den tidigare modellen kontrollerar publiceringsstatus vid varje bildhämtning utan cache för att avpublicering ska slå igenom direkt. Den 2026-09-09 accepterade ägaren att en tidigare publicerad bild kan fortsätta hämtas via sin direkta URL i högst fem minuter efter avpublicering, om cachning ger mätbar prestandanytta. Aldrig publicerade utkast ska fortsatt vara privata. Avvägningen möjliggör färre upprepade funktion-/lagringsanrop men ger upp kravet på omedelbar spärr för redan publicerade bilder.

## Konsekvenser

Detta beslutar toleransen, inte en viss cachearkitektur och inte att cachning redan är införd. Den totala tidsgränsen måste gälla genom alla cachelager, inklusive eventuell stale-serving. Kopior som besökare redan har laddat ned kan inte återkallas. Publika galleri- och serielistor ska fortsatt återspegla avpublicering; deras cachning omfattas inte automatiskt av denna tillåtelse.

Teknisk implementation ska verifiera utkast, publicering och avpublicering med både kalla och varma cachelager. CMS.md uppdateras när beteendet faktiskt ändras. Den nya implementationen använder begränsad cache för lyckade publika bildsvar och explicit no-store för privata svar och fel. Den är verifierad lokalt; kontroll av Netlifys cachelager och verkliga utgångstider återstår vid deploy.

## Spårbarhet

Tidigare motiv: CMS.md, avsnittet Publication model. Nytt beslut: ägarens ”5. ja” till förslaget att acceptera upp till fem minuter för tidigare publicerade bilder om mätningen visar tydlig nytta. Se [bildplanen](../plans/image-performance.md).
