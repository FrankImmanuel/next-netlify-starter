# SEO and image implementation — 2026-09-09

Implemented against local main `9b9b980`, as requested by the owner. This report describes local implementation and validation; production is not deployed by this task.

## Delivered

- Route-specific titles/descriptions, canonical and social metadata, photographer/site/page JSON-LD and `lang=en`. No extra visible About/series copy was necessary for the technical foundation.
- Production robots and a published-only sitemap with image URLs, including older archive pages. Preview indexing remains disabled. Old gallery URLs redirect to the current gallery; the starter style page returns 404. No internal references to these legacy routes were found; external link data was unavailable, so the gallery redirect preserves bookmarks and incoming links.
- Crawlable archive pagination, progressively enhanced to append photographs; initial props contain only the first 12 photos. Series index props contain covers rather than the entire photo archive.
- Accurate image candidate widths for new and legacy uploads, sizes for each layout, priority for the first gallery/cover image, and lazy offscreen covers.
- Public-only, bounded five-minute browser/CDN cache policy. Explicit no-store on private responses, errors and public page/catalog responses.
- Owner-selected underline B on paper behind the image. No visibility gate, delay, fade, animation library or placeholder network request. Error/retry state in the viewer. The two-option study remains development-only.
- Admin guidance and missing-description count. The live catalog has 21 photographs with empty alt descriptions; owner-review drafts are available in [photo-descriptions.md](../editorial/photo-descriptions.md), rather than filling the CMS with generic text.

## Comparable local measurement

Both production builds used the same 21 public web copies downloaded from snabb.studio into an isolated temporary fixture. No production state was changed. Chromium viewport widths 390 and 1440, height 900, DPR 1, no CPU throttling. Three cold-cache and three immediate warm-cache navigations per viewport; no scrolling before measurement. CDP network configuration requested 40 ms latency and 20 Mbit/s throughput, but these are localhost lab results, not simulated physical-device or production response-time guarantees. Transfer sizes include resource timing overhead. `before.json` and `after.json` contain the individual observations.

| Initial viewport | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Mobile, cold image bytes | 123,022 | 123,022 | Same image data/quality at first visit |
| Desktop, cold image bytes | 626,678 | 230,438 | 63.2% less image data |
| Mobile and desktop, warm image bytes | 123,022 / 626,678 | 0 / 0 | No repeat image transfer within freshness window |
| Initial serialized Next page data (characters) | 6,734 | 4,264 | 36.7% less initial page data |
| Mobile LCP, cold median | 152 ms | 156 ms | No demonstrated improvement; minor lab variation |
| Mobile LCP, warm median | 132 ms | 84 ms | Faster local return visit |
| Desktop LCP, cold median | 196 ms | 176 ms | Modest local improvement |
| Desktop LCP, warm median | 204 ms | 100 ms | Faster local return visit |
| CLS | 0 | 0 | No observed initial layout shifts |

First-load JavaScript increased by about 2 kB (Next build report), for metadata, pagination and image state handling. No new dependency was installed. Mobile with a high-density screen may correctly choose a larger image than the old inaccurate descriptors; image sharpness takes precedence over claiming a universal byte reduction.

Live before-only observations showed indexable HTML without a document language, all image loads re-transferred on repeat visits, and highly variable LCP (roughly 0.7–14 s in sampled runs). They must not be compared directly with localhost after values. No field INP or Search Console baseline was available.

## Validation

- 18 automated tests pass: existing CMS checks plus sitemap/draft exclusion, pagination input bounds, JSON-LD escaping, actual variant widths, legacy metadata and cache/auth boundaries.
- Production build succeeds.
- Browser: append from 12 to 21 photographs; direct page 2 renders 9 photos; out-of-range/invalid pages 404; canonical page 2 is distinct. No-JavaScript navigation follows the same older-page link and photographs remain visible.
- Browser: viewer next/previous/Escape and focus restoration; failed image request followed by successful retry; reduced-motion images have no animation or transition.
- HTTP: sitemap, robots and all public routes respond correctly; legacy gallery 308; retired style and production loading-study 404; preview noindex/disallow-all retained.
- Initial-viewport CLS measured at zero in both viewport sizes; image aspect ratios are preserved and no loading layer hides ready images.

## Deployment and editorial follow-up

1. Review changes and deploy through the normal workflow. No push, merge or production deployment was performed here.
2. On Netlify, verify cold/hit/expired cache behavior, `Age` propagation, both image sizes and fresh anonymous access after unpublication. The code deducts origin processing time from the freshness budget and does not allow stale serving, but local tests do not verify Netlify infrastructure. Previously downloaded copies cannot be recalled.
3. Optionally run the dimension backfill in the intended store before launch to remove legacy metadata reads on cold workers. Runtime fallback is present for unbackfilled uploads.
4. Obtain authorized Search Console access, submit/verify the sitemap and establish query/indexing baseline. Evaluate after 4–8 weeks when data exists, with manually noted relevant contacts. No automation or new visitor tracker was installed.
5. Review the 21 prepared description drafts and apply approved descriptions using admin. Existing About and series copy is retained; draft any further visible copy only where search-intent/content review establishes a need and the owner can fact-check it.

Sources consulted: [Netlify caching](https://docs.netlify.com/build/caching/caching-overview/), [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [Google image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).
