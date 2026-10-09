const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),base='http://localhost/fegtechnova',checks=[];
 await page.goto(base+'/website/',{waitUntil:'networkidle'});
 for(const menu of ['website','marketing']){
  const trigger=page.locator('[aria-controls="fegn-mega-'+menu+'"]');await trigger.click();
  assert(await trigger.getAttribute('aria-expanded')==='true');
  const hrefs=await page.locator('#fegn-mega-'+menu+' a[href]').evaluateAll(links=>links.map(a=>a.href));
  for(const href of [...new Set(hrefs)]){const response=await page.request.get(href);assert(response.status()===200,href);checks.push(href)}
  await page.keyboard.press('Escape');
 }
 await page.locator('.ft-index-card').first().click();await page.waitForURL('**/domain-hosting/');assert(await page.locator('.ft--domain-hosting').count());checks.push('Website index navigation');
 await page.locator('.ft-hero-copy .svc-button--primary').click();await page.waitForURL('**/contact/?service=website#project-inquiry');assert(await page.locator('#fegn-service').inputValue()==='website');checks.push('Service CTA to preselected Contact form');
 await page.goto(base+'/social-media-management/',{waitUntil:'networkidle'});
 const reveal=page.locator('#features [data-svc-reveal]').first();await reveal.scrollIntoViewIfNeeded();await page.waitForTimeout(600);assert(await reveal.evaluate(e=>getComputedStyle(e).opacity)==='1');checks.push('Scroll reveal completes');
 const option=page.locator('[data-ft-choice="1"]').first();await option.focus();await page.keyboard.press('Enter');assert(await option.getAttribute('aria-pressed')==='true');assert(await option.evaluate(e=>getComputedStyle(e).outlineStyle)!=='none');checks.push('Keyboard preview control and focus indicator');
 await page.setViewportSize({width:390,height:900});await page.goto(base+'/contact/',{waitUntil:'networkidle'});
 const toggle=page.locator('.fegn-nav-toggle');await toggle.click();assert(await toggle.getAttribute('aria-expanded')==='true');assert(await page.locator('#fegn-primary-nav').isVisible());checks.push('Mobile menu opens');await page.locator('[data-fegn-close]').click();assert(await toggle.getAttribute('aria-expanded')==='false');checks.push('Mobile menu closes');
 fs.writeFileSync(path.join(process.env.TEMP,'fegn-portfolio-review','navigation-checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({passed:checks.length,checks},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
