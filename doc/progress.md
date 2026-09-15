# FEG TechNova — Project Progress Log

Site: local `http://localhost/fegtechnova` (XAMPP) + live `https://fegtechnova.com` (Namecheap).
Repo: `https://github.com/shabihashila/fegtechnova.git` (branch `main`).
Theme: `wp-content/themes/extendable-child` (child of `extendable` — never delete the parent).
Key plugin: `wp-content/plugins/feg-technova-core` (CPTs + contact-form handler).
Local DB: `fegtechnova`, prefix `wpj9_`. Local admin user: `admin`.

> Note: local-only credentials and one-off passwords are intentionally NOT
> recorded here. See chat history for the 2026-09-07 local admin reset.

---

## 1. Menu alignment (done)
**Problem:** nav items spread across the header (`justify-content: space-between`
+ `width: 100%`) with uneven gaps; plain links and mega triggers had
different paddings (different heights).
**Fix (`assets/css/fegn.css`):** right-aligned nav (`justify-content: flex-end`,
tight `0.25rem` gap), unified metrics for links/triggers
(`0.65rem 0.8rem`, 44px, `0.95rem`), non-shrinking items, matching
1024px/tablet rules, chevron `flex-shrink: 0`.

## 2. Missing logo (done)
**Problem:** no logo rendered — `custom_logo` unset, media library empty.
Also fixed invalid nested `<a>` brand markup.
**Fix:** SVG `FT` fallback in `parts/header.html` (auto-hides via
`:has(.wp-block-site-logo)`); brand flex CSS + logo sizing.
Compared 4 supplied logos — chose **2D Transparent PNG** (flat, crisp,
transparent; 3D bevel aliases small, JPGs bake in white boxes). Trimmed
empty canvas `4167×4167 → 2923×1911`, imported to Media Library
(`feg-technova-logo-2d.png`), set as `custom_logo` + `site_icon`.
Header shows logo at 48px (40px mobile); duplicate site-title text hides
when the logo exists. Originals untouched under `All Companies Logo/`.

## 3. Mega-menu hover + top-level links (done)
**Problem:** dropdowns vanished before the mouse arrived (panel centered on
the header with a ~20px dead gap); top-level items were `<button>`s with
no destination; **every submenu URL 404'd** (only 2 pages existed in DB).
**Fix:**
- Panels anchor under their own trigger (`position: relative` item) with a
  transparent 12px hover bridge; edge menus (About/Marketing) align inward;
  close delay 180 → 300ms; keyboard support from text links too.
- Split triggers: text `<a>` navigates (About→`/about-us/`,
  Services→`/services/`, Website→`/website/`, Marketing→`/marketing/`),
  chevron `<button>` toggles. Fixed stale slugs
  (`web-design-dev→web-design`, `shopify-dev→shopify`).
- Created all **29 missing pages** (IDs 7–35) with correct templates
  (12 block templates, 2 hub pages with link lists + CTAs, 15 static
  landing pages wired to `page-landing-*.php`).
- Restored the empty `.htaccess` with subdirectory rewrite rules
  (pretty permalinks were 404ing for that reason too).

## 4. Publishing to Namecheap (done, documented flow)
- Full UpdraftPlus set built locally (`D:\feg-technova backup\
  LOCAL-REDESIGN_upload-to-namecheap\`, nonce `cdae36ed8776`, verified:
  12 tables, `wpj9_`, 29 pages, logo) — enabled `php_zip` for 10x speed.
- **DB diff verdict (measured, not guessed):** live DB is 2.3MB/30 tables
  (pages incl. Booking/Portfolio + active drafts, 2 users, WPForms data,
  1,542 TranslatePress strings, bookings, nav, styles) vs local 93KB/12
  tables. **Do NOT restore local DB over live** — it would wipe all of
  that and deactivate every plugin. Agreed path: files + selective page
  export/import, keep live DB. Same `wpj9_` prefix both sides, so no
  `wp-config.php` edit is ever needed.
- Resolved import slug collisions (`services-2`, `contact-2`,
  `sample-page-2`): trashed superseded old pages, renamed to clean slugs,
  re-templated 4 pre-existing landing pages, fixed footer links
  (`/about/→/about-us/`, Case Studies→`/portfolio/`).
- No-cPanel constraints: WP File Manager uploads; when its extractor
  refused the zip (Windows backslash paths), rebuilt archives with PHP
  ZipArchive (forward slashes); final fallback = WP's native
  Theme/Plugin uploader with replace flow.

## 5. Responsive pass (done, measured with headless Chrome)
- Stats grid 4→2 tablet step; closed the 769–781px dead band (header
  rules 768→781px); case-study metrics wrap; tables scroll in-figure;
  media/form overflow guards; landing batch (metrics wrap, CTA padding
  scale, hero padding) across all 15 files.
- Dark-section mobile gutter bug (content at x=0): sections carry 1rem
  side padding on phones (backgrounds stay edge-to-edge).
- Drawer row alignment bug (dropdown text ~110px right of Home/Contact):
  desktop `justify-content: center` leaked into drawer links — forced
  `flex-start` there; verified all rows at identical x.
- Caught and reverted a wrong turn (forced centered mobile heroes) back
  to laptop-parity left alignment per feedback.

## 6. Sticky menu (done, measured)
`position: sticky` on the header alone can never work — its template-part
wrapper is exactly header-height. Fix: the wrapper
(`.wp-block-template-part:has(> .fegn-site-header)`) sticks instead.
Landing pages rendered the header with NO wrapper at all
(`block_template_part()`), so `fegn_landing_template_part()` in
`functions.php` now emits the identical wrapper. Verified scrolled to
900px on `/`, `/services/`, `/ecommerce/`, `/seo/`: header top `0`
(pinned) on all page types. Also switched the global overflow guard to `overflow-x: clip`
(`hidden` risks breaking sticky).

## 7. Contact form mail (analyzed + verified locally)
Handler (`feg-technova-core/includes/contact-form.php`): nonce + honeypot
+ validation, HTML mail via `wp_mail()` to `info@fegtechnova.com`.
Local end-to-end test passes (`200 {"success":true}`; no real mail leaves
XAMPP by design). Fixed the dev bypass to also cover LAN IPs
(`192.168.x.x`, etc.) and activated the plugin locally (it was off).
Live checklist given: plugin active + Contact template assigned + real
`info@` mailbox + SPF/DKIM (SMTP plugin recommended) + live test submit.

## 8. Seamless header + spacing uniformity (done)
- No divider line under nav (site-wide), homepage hero melts into header
  background, all heroes join at 2.5rem top / 3rem bottom (was 6rem+).
- All first sections share the menu background; AI heroes got an explicit
  light band (page body stays dark) with re-inked text/controls.
- Hero copy pinned to the cards' left edge (was offset ~230px by centered
  constrained column); CTA banners stay centered by design.

## 9. Scroll-reveal animations (done)
New `assets/js/fegn-reveal.js` (enqueued, filemtime-versioned): cards,
titles, ledes, badges, steps fade + rise once on entry, 70ms sibling
stagger (capped). JS-gated (no-JS sees everything), honors
`prefers-reduced-motion`, skips header/drawer/dropdowns/footer.
Verified: 18 tagged / 4 in-fold on homepage.

## 10. Visitor dark/light switch (done)
Toggle buttons (menu bar + drawer), `fegn-theme.js` (persist choice,
follow OS until chosen, sync both buttons, theme-color meta), pre-paint
guard in `wp_head` (no white flash). Full dark palette in `fegn.css`
(menu == body `#0B1220`, dark cards/forms/FAQ/chat, ink-background
surfaces re-darkened, CTA bands dark with brand pills, footer text
kept legible). Landing pages get a dark wash via the PHP wrapper.
Measured dark renders (home, chatbot, services CTA, footer) for
backgrounds + contrast. Known rule: white pills/text survive ONLY on
colored gradients; near-white `#F1F5F9` text is intentional (contrast).

## 11. Git record (this repo)
- `51718110` menu/nav/logo work → `cf961852` server-side batch (pulled,
  reviewed: mobile drawer v2, landing wrapper, contact form, footer,
  page-website/page-marketing templates) → `1a619487` responsive batch →
  `788d2d08` dark mode / reveals / seamless / sticky.
- Never committed: `wp-config.php`, `.htaccess`, uploads, Updraft data
  (git-ignored), `All Companies Logo/` source binaries, local passwords,
  temp probe scripts (always removed after use).

## 12. Standing notes / watch-outs
- Live file uploads go through WP Admin (File Manager / theme uploader);
  always purge caches + hard-refresh emulators (stale frames caused two
  false alarms). CSS/JS auto-version via `filemtime`.
- Emulator caution: verify surprising renders against real Chrome or the
  `scrollWidth == innerWidth` console check before treating as bugs.
- Open threads for owner: Booking/Portfolio pages have no menu slot;
  SMTP/DNS for contact mail deliverability; empty Trash after grace week.
