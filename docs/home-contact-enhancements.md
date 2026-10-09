# Homepage and Contact enhancements

Implemented on localhost with page-specific assets. Existing page content, URLs, images, form markup, QR image, and other page assets remain unchanged.

- Homepage: staggered hero entrances, gentle background image motion that respects the existing pause control, offscreen animation suspension, one-time section reveals, numbered engagement highlights, and refined card/button interactions.
- Contact: a brief hero image entrance, refined glass form styling, clearer input focus states, subtle contact-link reveals, and animated form status feedback. The QR image and surrounding card remain stationary with an opaque white scanning surface.
- Accessibility: reduced-motion support, progressively enhanced reveals, and visible content without JavaScript. No new dependencies or continuous JavaScript animation loops.

## Runtime files

- `wp-content/themes/extendable-child/functions.php`: load the new assets only on Homepage and Contact; replace the older Homepage reveal handler on that page.
- `wp-content/themes/extendable-child/assets/css/fegn-experience.css`: scoped visual styling and lightweight CSS animations.
- `wp-content/themes/extendable-child/assets/js/fegn-experience.js`: entrance/reveal observers, motion preference handling, and status feedback.

The navigation stylesheet also received a reduced-motion specificity correction while finishing the previous navigation work.

## Verification

`tools/experience-review.cjs` passed 190 checks across 1440, 768, 390, and 320px widths in light and dark themes. Checks cover unchanged content/links/form markup, protected file hashes, image loading, overflow, Contact section padding, required-field validation, local form submission, service preselection, background pause/resume, reveals, reduced motion, and content visibility without JavaScript. No browser page errors were reported.

QR verification decoded the original image plus eight rendered desktop/tablet/mobile crops to `https://linktr.ee/fegtechnova`. The original QR file hash is preserved. Local form submission was tested against the existing localhost handler; external mail delivery was not exercised.

The previous navigation final check also passed all 33 checks following the reduced-motion correction.
