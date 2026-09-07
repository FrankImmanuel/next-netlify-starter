# Studio: operating the gallery

## Local review

- `npm install`
- `node scripts/seed-local.mjs` optionally creates the existing preview images once, without overwriting an existing catalog. Seed dates are illustrative.
- `SNABB_LOCAL_CMS=1 npm run dev -- --hostname 127.0.0.1 --port 3100`
- Open `/admin`. The local studio is deliberately limited to a loopback host AND socket, with same-origin checks on mutations. It is disabled whenever Netlify is detected. Do not use this mode for a public server.
- Data persists in gitignored `.data/catalog.json` and `.data/images`. Back up this directory to retain local uploads. The site reads published data on every request; publishing needs no rebuild.
- Local preview seed photos remain public static sample assets. They are not private originals. Actual uploads use authenticated media endpoints until publication.

## Netlify activation — still needs account configuration and online verification

Use the existing Next.js Netlify site. No Supabase account is needed for this implementation.

1. Use Node 22.12 or newer; `.nvmrc` pins Node 22.
2. Enable Netlify Identity, set registration to invite-only, and invite only the owner. Set the invitation/recovery destination to `/admin` (or use the root callback forwarding in this app).
3. Set the environment variables shown in `.env.example`. SNABB_ADMIN_EMAIL is enforced on the server after verifying the Identity access token against its trusted /user endpoint. Merely having an Identity account is insufficient.
4. Set SNABB_STORAGE=netlify. Site-wide Blobs stores are isolated by CONTEXT by default, so deploy previews do not access production images or device tokens. If overriding SNABB_STORE_NAME, choose a distinct value per context.
5. A deploy preview needs its own SNABB_SITE_URL (for same-origin checks). Identity on a preview may need separate configuration; verify it before sharing the preview for admin testing.
6. Run the production build and deploy to a reviewable HTTPS environment. Verify invitation acceptance, password recovery, session refresh, unauthorized requests, image persistence across deployments, and two-session edit conflicts.
7. Import the owner's NEW selection through admin. The old seed/images are preview material; remove unused static sample assets before the final launch. Keep original photographs in the owner's separate archive.
8. Activate production only after the owner reviews the concrete deployment. Remove the prototype noindex on public pages when launching; retain it on admin.

Account inspection on 2026-09-06 confirmed the existing project `melodious-beignet-b32d4c` in team `s-sjoblom`, serving `https://snabb.studio` from `FrankImmanuel/next-netlify-starter` on production branch `main`. The team uses Starter Legacy ($0 base plan). With explicit owner approval, Identity is now enabled with invite-only registration and required email confirmation. An invitation was sent to s.sjoblom@gmail.com and the user entry was verified in Netlify. No production deployment has been changed. The four SNABB environment variables from .env.example are configured in Netlify for Production only, with s.sjoblom@gmail.com as the owner. Preview configuration, online deployment verification, invitation acceptance, and real iPhone verification remain outstanding. The invitation points at the existing live site; the new admin callback is not deployed yet.

## Publication model

Images are draft or published. An upload is always a draft until explicitly published. The home feed is sorted by immutable upload time, latest first. Re-publication does not move an old image to the top. Series are draft or published independently, with an ordered list of image IDs and optional cover. A photograph can belong to several series. Public series contain only published images and never leak draft series links. A series with no public images is omitted from the index and returns 404.

Unpublishing changes visibility immediately. Uploaded media is served without CDN caching so earlier public URLs are rechecked. A visitor who already downloaded an image still has their copy. This deliberately simple approach increases function requests; image traffic and existing Netlify plan must be measured before estimating cost or introducing a cache.

## Storage and edit conflicts

The catalog is one JSON document protected by Blobs ETag conditional writes and strong reads. Edits include the revision the UI loaded; stale edits return 409 rather than silently overwriting changes. Local writes use atomic file rename and a process-local queue: run only one local server against a given .data directory. Remote mutations retry on unrelated concurrent writes; the small single-editor catalog is not intended as a large multi-user database.

Images are decoded server-side with Sharp, bounded to 40 MP and 3 MB input, auto-oriented, stripped of source metadata, and converted to 640/1600-pixel bounding-box WebP copies. Originals are never stored. Desktop input is resized before upload. HEIC support depends on the browser; export to JPEG if unsupported. iPhone Shortcut converts to JPEG explicitly.

Failed catalog commits may leave orphaned image blobs. They are not public and are safe to clean up later after comparing blob keys with catalog IDs. No permanent deletion is exposed in the studio.

## iPhone

`public/shortcut-guide.txt` documents the exact flow and payload. GET /api/shortcut returns only series IDs/titles; POST stages a draft. Both require a scoped device key. Keys are generated by the signed-in owner, returned once, stored only as SHA-256 hashes and revocable. They cannot publish, edit the catalog or fetch private media. The returned previewPath opens `/admin?photo=...`, requiring normal owner login before publication. Identical Shortcut uploads are deduplicated by image hash; desktop retries use a stable request UUID.

A signed installable review Shortcut is available at /snabb-studio-v3.shortcut. Its credential-free source generator is scripts/build-shortcut.py; run it and sign shortcuts/snabb-studio-unsigned.shortcut with Apple’s shortcuts sign command to regenerate. Installation asks for the site origin and a scoped upload key. Physical-device testing is still required. GET /api/shortcut also returns a choices dictionary for the native series picker.

## Verification

`npm test` runs domain, visibility, input-validation, local authorization and persistence tests. Browser smoke coverage includes mobile admin layout, series creation/editing, image upload and explicit publication, and gallery navigation. Netlify runtime and physical-device behavior must be verified online.

## HTTPS review deployment — 2026-09-06

Draft: https://studio-review--melodious-beignet-b32d4c.netlify.app (admin at /admin). Deploy ID: 6a9d36091646dc2fadc01e9d. Built with Next 15.5.25 and Netlify Next Runtime 5.15.13 using the CLI; production was not replaced.

Deploy-only variables use SNABB_STORE_NAME=snabb-cms-studio-review and the review origin for SNABB_SITE_URL. Identity verification uses the existing https://snabb.studio/.netlify/identity service and the approved owner email. Production variables remain scoped to Production. Verified the rendered login page, public empty catalog HTTP 200, and unauthenticated admin catalog HTTP 401. Nine local tests pass. Authenticated upload, invitation acceptance, session refresh, persistence across redeploys and iPhone verification still need an owner session. The original invitation targets the production site, whose admin callback is not deployed. For testing, the owner can replace only the origin of the invitation landing URL with the review origin, preserving its path and fragment, without sharing the token.

For a CLI build on macOS, install the matching Linux Sharp optional binaries before deploying: `npm install --no-save --force @img/sharp-linux-x64@0.35.4 @img/sharp-libvips-linux-x64@1.3.3`. Next tracing explicitly includes them for both upload routes. The first online upload revealed missing Linux binaries; local tests alone did not cover this platform difference. On Linux CI, normal optional dependency installation should supply them.

Online verification on 2026-09-06: owner login succeeds; upload stages a WebP draft in Blobs; anonymous draft media returns 401; publishing displays the photo on the review home page; unpublishing removes it. Test image e72fa012-efd3-4f46-86c4-5fe4c99946c9 remains an explicitly labelled draft in the isolated review store. Latest review includes session refresh initialization for already-authenticated owners and readable handling of non-JSON server errors. The signed Shortcut contains no credentials; actual iPhone execution remains unverified.

Review deploy 6a9d39560e61c4435e0dcb06 includes the signed Shortcut. Verified the labelled test draft remains in the Blobs catalog after this redeployment.

Shortcut v2 fixes the required WFImage input for Resize Image and omits height to preserve aspect ratio. The original used WFInput and the invalid numeric value Auto. Signed v2 needs another iPhone run; Apple signing does not validate action execution.

Shortcut v3: the iPhone screenshot pinpointed a blank If condition. Both error guards now serialize WFInput using the Type=Variable / Variable=WFTextTokenAttachment wrapper rather than a bare attachment. Static inspection verifies both guards. Another physical-device run is required; v2 did not fix this particular failure.

## Production launch

Owner explicitly requested replacement of the live site. Production uses store snabb-cms-production, owner s.sjoblom@gmail.com, and https://snabb.studio for both the site origin and Identity. No review photos or device tokens are imported. The production Shortcut at /snabb-studio-live.shortcut defaults to https://snabb.studio and requires a new production upload key. About uses the latest published production photo instead of a static fixture. Public search indexing is enabled only for production builds. Previous production deploy for rollback: 69d7c32aceb40500089d9806.

Production deploy 6a9d3cc8dd659025bef7a198 is live. Verified home HTTP 200 with expected gallery and no noindex tag; session HTTP 200 with production Identity URL; unauthenticated admin HTTP 401; empty public catalog HTTP 200; signed production Shortcut HTTP 200 with exact file-byte match. Deployed via CLI from the local working tree; GitHub has not been updated.
