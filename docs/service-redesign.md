# Services redesign

Implemented directly in the XAMPP site at `http://localhost/fegtechnova/`, with matching source changes in this repository.

## Completed pages

| Page | URL | Template | Visual direction |
| --- | --- | --- | --- |
| SaaS Development | `/saas-development/` | `page-saas.html` | Cloud workspace, tenant architecture, product roadmap |
| Web Application Development | `/web-application-development/` | `page-web-app.html` | Interactive portal showcase, architectural layers |
| Mobile App Development | `/mobile-app-development/` | `page-mobile-app.html` | Device composition, editorial feature lanes, release checklist |
| CRM | `/crm/` | `page-crm.html` | Customer dossier, relationship journey, pipeline workspace |
| UI/UX Design | `/ui-ux-design/` | `page-uiux.html` | Studio artboard, wireframe-to-interface story, design deliverables |
| AI Automation | `/ai-automation/` | `page-ai-automation.html` | Control-room workflow, document processing, human review |
| AI Chatbot | `/ai-chatbot/` | `page-ai-chatbot.html` | Scripted conversation preview, knowledge architecture, human handoff |

These are all seven remaining destinations in the actual Services mega menu. The eighth destination is ERP Development, which was preserved.

## Runtime files

All theme paths below are relative to `wp-content/themes/extendable-child/`:

- The seven templates listed above in `templates/`.
- `assets/css/fegn-services.css`: shared design primitives, individual page compositions, responsive layouts, light/dark colour treatments, and reduced-motion rules. All selectors are scoped to the service templates. Every direct main section has exactly `42px` top and bottom padding at every breakpoint.
- `assets/js/fegn-services.js`: progressive scroll reveals, web-application type selector, and scripted chatbot scenarios. No external libraries, network requests, or collected visitor data.
- `functions.php`: conditional enqueue for the seven service URLs only. Existing ERP asset logic and global theme behaviour remain unchanged.
- `assets/images/service-mobile-hero.webp`: new locally served, optimized 1600 × 901 photograph (42,474 bytes).
- `assets/images/service-image-sources.json`: photo provenance. Other photos reuse existing local theme assets.

The new mobile photograph is by Kindel Media, from [Pexels](https://www.pexels.com/photo/a-laptop-and-a-smartphone-on-a-desk-7054521/), under the [Pexels licence](https://www.pexels.com/license/).

## Verification

- All seven pages return HTTP 200, with one H1 each.
- Responsive browser checks at 1440, 768, 390, and 320px: 28 page/viewport combinations; no horizontal overflow, broken main images, empty links, missing anchor targets, or JavaScript errors.
- Exact `42px` top and bottom padding measured for every main section across all 28 layouts.
- Light and dark desktop/mobile screenshots reviewed. Secondary labels and dark-mode CTA text refined after contrast checks.
- CSS text colour ratio review across all seven pages in both themes reported no remaining failures after those refinements. Photograph and translucent treatments were also inspected visually.
- All eight Services destinations and the Contact CTA destination return HTTP 200.
- Desktop menu Escape handling and mobile menu navigation verified.
- FAQs, application selector, and chatbot scenarios verified with keyboard interaction.
- All seven pages remain readable with JavaScript disabled and with `prefers-reduced-motion` enabled.
- ERP, homepage, Contact, and About rendered main content, header, and footer compared against pre-change baselines and matched exactly. Service assets do not load on those pages.
- PHP lint, JavaScript syntax check, and `git diff --check` passed.

## Review scripts

`tools/services-review.cjs`, `tools/services-final-check.cjs`, and `tools/services-contrast.cjs` use the pre-existing local Playwright installation and Microsoft Edge. They are verification tools, not website dependencies. They write screenshots and results to `%TEMP%/fegn-services-review/`.

`tools/services-preview.py` assembles the review screenshots into [desktop](services-preview-1440.jpg) and [mobile](services-preview-390.jpg) preview sheets using Pillow.

`services-review.cjs baseline` captures untouched-page snapshots. Run the baseline before subsequent changes, then run the review and final-check scripts. The contrast helper computes CSS colour ratios as a review aid; photo and translucent backgrounds also require visual inspection.

Local pre-change template and function backups are retained in `%TEMP%/fegn-services-before-20261009-125502/`.
