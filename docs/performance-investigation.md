# Localhost page-load performance

The October 10 investigation found TranslatePress loading 190,873 English gettext rows during every WordPress bootstrap. None has a translated value, and English is the only configured translation language. One measured join took 4,739 ms; bootstrap used approximately 292 MB peak memory. Database connections took under 2 ms and static files responded in approximately 15–30 ms.

`wp-content/mu-plugins/fegn-local-performance.php` applies TranslatePress's supported `disable_translation_for_gettext_strings` setting at runtime for ordinary requests when the configured home URL is localhost and the only translation language is the default language. Stored settings and translation tables are untouched. Admin, AJAX, cron, CLI and translation-editor requests retain the existing setting. Configuring another language or a production home URL automatically removes the override. Remove the file to roll back.

After the change, bootstrap measured 1,792 ms, total query time 47 ms, and peak memory approximately 80 MB. The slow gettext join was absent.

## Repeated HTTP measurements

Three samples per page, median time to first byte, local Apache/PHP/MySQL. These measure server response time rather than complete browser load or production performance.

| Page | Before | After |
| --- | ---: | ---: |
| Home | 8,222 ms | 1,776 ms |
| Website | 6,391 ms | 1,278 ms |
| SaaS | 6,580 ms | 1,412 ms |

The other optimized pages measured Contact 1,248 ms, About 1,425 ms and Web Design 1,429 ms. All 18 optimized requests returned HTTP 200. Raw samples are in `performance-after.json`. The first three page groups in `performance-baseline.json` were fully measured before the change; later groups overlap installation and should not be used for before/after comparisons.

## Verification and limitations

PHP lint, Node syntax and whitespace checks pass. A separate Contact capture with the optimization temporarily removed was compared against the optimized response for visible text, links, images and form controls using `tools/fegn-performance-content.php`. The optimization was restored immediately after the baseline capture. Existing theme and contact backend files were not edited. Browser layout and external email delivery were not retested for this server-only change.

The temporary localhost-only probe remains at `tools/fegn-performance-probe.php` for follow-up diagnostics. PHP OPcache is currently disabled; changing machine-level PHP configuration was outside this change. No deployment or Git push was performed.
