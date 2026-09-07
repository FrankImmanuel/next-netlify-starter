# snabb.studio — visual prototype

## Run

Run `npm install`, optionally `node scripts/seed-local.mjs`, and `SNABB_LOCAL_CMS=1 npm run dev -- --hostname 127.0.0.1 --port 3100`, then open http://127.0.0.1:3100.
Dependencies are now installed separately in this checkout.
The isolated checkout was copied from /Users/sam/repos/next-netlify-starter. Changes are not deployed.

## Preview routes

- `/`: photograph archive, asymmetrical automatic layout, load older photographs.
- `/series`: series index.
- `/series/ordinary-days`: example scrollable sequence with large photograph viewer.
- `/about`: draft artist introduction and contact.

Photographs, sequence, title and text are temporary editorial fixtures. The original array in lib/photos.json is used only by the optional local seed and About image. Public galleries now read persisted CMS data and uploaded images use real upload timestamps. Public pages deliberately carry noindex during the prototype stage. Remove this before the real launch.

## Approved product brief

The site is an artistic photography gallery, supporting the development of bodies of work toward an eventual exhibition. The home page shows all published photographs, newest uploads first, without captions. Its spacious automatic composition is inspired by the Codrops Infinite Scroll GSAP Gallery, but uses normal finite scrolling and retains image proportions.

Series are a visible navigation destination. A series has a name, optional introduction, a chosen cover and manually controlled image order. Series may remain private drafts independently of published photographs. A photograph can belong to several series, with independent ordering in each. The series index order is curated.

Selection and photographic editing take place outside the site. A single private administrator uploads optimized web copies from desktop or from iPhone Photos through an Apple Shortcut named snabb.studio. The upload flow includes an optional series selection, a preview and explicit publication. Original photographs remain in the owner's photo archive. Unpublishing a photograph globally and removing it from a single series are separate reversible actions.

The public site is English, branded snabb.studio, with an About page identifying the photographer and providing contact. Existing Netlify hosting and snabb.studio domain are retained as the starting point, with low ongoing costs. The local backend, image pipeline, private admin and Netlify adapters are implemented. Netlify account configuration, online authentication/storage verification and real-device Shortcut testing remain. See CMS.md.

## Verification

Production build; desktop and 390px mobile browser inspection; viewer next/previous and Escape; restored focus; archive expansion from 12 to 20 photos; series navigation; no browser errors during those flows.

## Motion and icons update

The archive now uses individual bounded parallax offsets on photograph buttons, measured from static figure positions. Desktop wheel scrolling uses the already installed Lenis with its default interpolation. Native touch momentum is preserved and mobile parallax is scaled to 35%. Series retain their stationary sequence while the page scrolls smoothly. Reduced-motion preference switches both smooth scrolling and parallax off, including changes during the session. The native photograph dialog pauses Lenis until dismissed. UI arrows and close controls use the existing Phosphor React library.

Typeface direction: neutral neo-grotesque sans serif, following the owner’s preference for Geist and Helvetica Neue. Helvetica Neue is first in the system font stack, followed by Helvetica and Arial; headings use the same family with no serif or italic treatment. Rendering depends on locally available fonts.

## Studio implementation

Open `/admin` for image upload, preview, publication, series ordering/covers/drafts, image memberships and device keys. Nine automated tests pass; browser verification covered a real local upload, separate series publication, image unpublication and a 390px admin view. Test records were removed. Production Netlify configuration and physical iPhone validation remain outstanding.
