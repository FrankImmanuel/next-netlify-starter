# Snabb Hand — review 0.1

First font traced from Samuel’s supplied handstil.jpg. Includes uppercase, lowercase, Swedish letters, digits, punctuation and typographic quote aliases. Font source remains outside public/. No production styles or CMS fields changed.

Outputs: SnabbHand-Regular.ttf, SnabbHand-Regular.woff2, preview.html, specimen.png and glyph-review.png.

Generator: build.py SOURCE_IMAGE. Requires Python with Pillow, numpy, opencv-python-headless, fonttools and brotli. Coordinates are specific to the supplied sheet. Retains hand-drawn stroke contours, normalizes cap/x heights and separates dots and diacritics from neighboring strokes. Additional characters outside the mapped set require fallback.

Review limitations: one selected form per character, no contextual alternates or pair kerning yet. Accent positioning and spacing need review at the intended headline sizes. The sample uses a dot background solely for comparison. No handwritten body text is proposed.
