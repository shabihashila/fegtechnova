# FEG TechNova — Landing Pages Task (IN PROGRESS)

## Context
Child theme: `C:\xampp\htdocs\fegtechnova\wp-content\themes\extendable-child\`
Site URL: `http://localhost/fegtechnova` (XAMPP, MySQL `fegtechnova`, prefix `wpj9_`, PHP 8.2 CLI at `C:\xampp\php`)
Block theme (extendable child). Pages render post_content via `.entry-content.wp-block-post-content`.
Design system tokens live in `theme.json`; component CSS in `assets/css/fegn.css`.

## DONE (previous session)
1. Header rebuilt in `parts/header.html`:
   - Logo far-left; desktop "Start a Project" CTA removed.
   - Nav order: Logo · Services(mega) · Website · AI Chatbot · Bulk SMS · Products · Marketing · About · Contact.
   - Case Studies removed from header.
   - Chevrons on Services/Website/Products/Marketing.
   - Accent underline + color shift on hover/focus; pill on mega triggers.
   - Mobile off-canvas drawer (toggle, scrim, ESC, focus return) with "Start a Project" CTA preserved.
   - `fegn.css` updated; `fegn-header.js` rewritten for multiple megas + drawer (verified JS syntax OK).
2. Created 5 placeholder pages (IDs): website=90, ai-chatbot=91, bulk-sms=92, products=93, marketing=94.
   - ALL nav targets verified HTTP 200.

## TODO (this task)
Build two high-converting landing pages and map nav:

### Page 1 — Website Services (/website/, ID 90)
- Hero: "Enterprise-Grade Web & Web App Development" + lead + "Request a Quote" CTA.
- Capabilities grid: Domain & Hosting, Custom Web Apps, E-Commerce Platforms, Corporate Websites, Performance & Security Optimization.
- Process stepper: Discovery -> UI/UX Architecture -> Development -> QA & Deployment.
- FAQ accordion (reuse `.fegn-faq-item` details/summary styles) + CTA band.

### Page 2 — AI Chatbot Solutions (/ai-chatbot/, ID 91)
- Hero: "Next-Gen Custom AI Chatbots & Automation Tools" + value prop + "Schedule a Demo" CTA.
- Features grid: 24/7 Support, Multi-Channel (Web/WhatsApp/Messenger), CRM & DB Sync, Custom Trained LLM Models.
- ROI / Use Cases: Customer Service Automation, Lead Generation, E-Commerce Sales Assistance.
- Security & Privacy note + Contact CTA.

### Design
- Glassmorphism cards, brand accents, modern type, clean spacing, micro-hover, WCAG contrast.
- Add landing-page CSS to `fegn.css` (or new `assets/css/fegn-landing.css` and enqueue in `functions.php`).
- Use core blocks + fegn classes; FAQ = `<details class="fegn-faq-item">` (matches existing fegn.css).

### Mapping & verify
- Header already links Website->/website/, AI Chatbot->/ai-chatbot/. Confirm + keep.
- Update post_content of IDs 90 & 91 via a wp-cli/PHP script using `wp_update_post`.
- `flush_rewrite_rules()` (or visit Settings > Permalinks).
- Verify both pages 200 and content renders (curl + grep for headings).

## Notes / decisions
- Header "Website"/"AI Chatbot" dropdown sub-items currently point to parent page + anchors (e.g. /website/#web-design); swap for real URLs when child pages exist.
- Theme page wrapper: `.fegn-page-header` (soft-surface bg) + `.fegn-section` available for reuse.
- Root-relative link fix in functions.php rewrites `/x/` -> `/fegtechnova/x/`, so write links as `/website/` etc.
