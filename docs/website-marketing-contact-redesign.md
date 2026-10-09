# Website, Marketing & Contact redesign

Implemented in the child theme and installed at **http://localhost/fegtechnova/**.

## Completed pages

The actual Website menu contains four services and a linked overview. All five are included:

| Page | URL |
|---|---|
| Website overview | `/website/` |
| Domain & Hosting | `/domain-hosting/` |
| Web Design & Development | `/web-design/` |
| Ecommerce Website | `/ecommerce/` |
| Shopify Development | `/shopify/` |

All eleven links in the Marketing mega menu are included:

| Page | URL |
|---|---|
| WhatsApp Marketing | `/whatsapp-marketing/` |
| Email Marketing | `/email-marketing/` |
| SMS & Voice Marketing | `/sms-voice-marketing/` |
| SEO | `/seo/` |
| Telemarketing | `/telemarketing/` |
| Social Media Management | `/social-media-management/` |
| Paid Advertising | `/paid-advertising/` |
| 2D & 3D Animation | `/2d-3d-animation/` |
| Business Profile Setup | `/business-profile/` |
| Creative Graphic Design | `/graphic-design/` |
| Corporate Video / OVC | `/corporate-video/` |

The seventeenth page is the complete Contact redesign at `/contact/`.
The unlinked `/marketing/` overview remains unchanged.

## Visual implementation

Photo-led glass heroes and service-specific visual concepts: infrastructure orbits, responsive browser layouts, sculpted storefronts, a Shopify theme atelier, communication previews, search-intent layouts, social content, campaign planning, motion direction, profile presentation, graphic identity and film storyboards. Supporting layouts include editorial spreads, shopping journeys, content calendars, communication principles, a site map, a campaign board and a frame sequence.

All examples are labelled as illustrative concepts. Preview controls change the visible composition locally. They do not send campaigns, initiate calls, sell products or display invented results.

Shared container/typography/button/reveal primitives come from the existing Services assets **without editing those files**. New CSS is scoped to `.ft-page`; the conditional asset hook runs only on these seventeen pages. Every direct main section uses exactly **42px top and bottom padding**, including mobile. Light/dark themes, keyboard focus and reduced motion are supported. Eight local WebP photos total approximately 615 KB; source and license links are recorded in `assets/images/portfolio/sources.json`.

## Contact and official QR

Preserved office: Green Satmahal, 4th Floor, Outer Circular Road, Dhaka 1217.
Preserved phone: 01886800991. Preserved email: info@fegtechnova.com.

The inquiry form retains all original IDs, names, required fields, service values, honeypot, live status region and submit control. The existing frontend validation/AJAX script and backend nonce, sanitisation and submission handler are unchanged. Service-page CTAs select the relevant existing inquiry category.

The supplied QR was copied byte-for-byte to `assets/images/feg-technova-official-qr.png`.
SHA-256: `d801d73412e270406955761457140966ea4b0339900de87e70a2f36c08be4124`.
Decoded destination: **https://linktr.ee/fegtechnova**. The label identifies Linktree only.
The actual image sits on solid white, with no filters, opacity, distortion or overlays.
ZXing decoded the original asset and eight fully loaded browser crops: 1440, 768, 390 and 320px viewports, in light and dark themes.

Localhost's pre-existing backend intentionally returns success without sending email. Local submission and validation were tested; production SMTP delivery was not tested or changed.

## Files changed in this batch

Under `wp-content/themes/extendable-child/`:

- `functions.php`: conditional collection asset enqueue.
- `landing/`: the fifteen Website/Marketing service HTML files listed above.
- `templates/page-website.html` and `templates/page-contact.html`.
- New `assets/css/fegn-portfolio.css` and `assets/js/fegn-portfolio.js`.
- New `assets/images/portfolio/` WebP assets and provenance JSON.
- New `assets/images/feg-technova-official-qr.png`.

Content source and tooling:

- `tools/build-portfolio-pages.py`: rebuilds only the explicit seventeen targets.
- `tools/portfolio-assets.py`: image download, optimisation and provenance.
- `tools/portfolio-review.cjs`, `portfolio-final-check.cjs`, `portfolio-navigation.cjs`, `portfolio-contrast.cjs`: browser QA.
- `tools/portfolio-qr-capture.cjs`, `portfolio-qr-check.py`: rendered QR capture and decoding.
- `tools/portfolio-preview.py`: desktop/mobile review sheets in `docs/`.

## Verification

- 68 responsive layouts: seventeen pages at 1440, 768, 390 and 320px.
- One main H1, working images/anchors, 42px section padding and no document horizontal overflow.
- 184 preservation, interaction, Contact, dark-theme, no-JavaScript and reduced-motion checks.
- Every Website/Marketing menu URL responds successfully; actual overview navigation and service-to-Contact CTA tested.
- Keyboard preview activation, focus indicator, scroll reveal and mobile menu checked.
- Modeled text contrast audit reports zero issues in light and dark mode.
- Original QR and eight responsive/theme crops decode to the same destination.
- ERP, the seven completed Services pages, shared header/footer, original Contact scripts and backend retain their baseline file hashes. Protected pages retain their rendered content; new assets are excluded from them.
- No browser page errors in the layout review. PHP syntax and `git diff --check` pass.

Review sheets: `website-preview-1440.jpg`, `website-preview-390.jpg`, `marketing-preview-1440.jpg`, `marketing-preview-390.jpg`. Full Contact previews: `contact-preview-1440.jpg`, `contact-preview-390.jpg`.
Raw browser QA JSON and screenshots are in `%TEMP%/fegn-portfolio-review/`.

No production changes or publishing were performed.
