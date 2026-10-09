const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'), path=require('path'), assert=require('assert');
const out=path.join(process.env.TEMP,'fegn-services-review');
const base='http://localhost/fegtechnova';
const slugs=['saas-development','web-application-development','mobile-app-development','crm','ui-ux-design','ai-automation','ai-chatbot'];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const checks=[];
 const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json')));
 for(const slug of ['erp-development','', 'contact','about-us']){
  await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
  const actual=await page.evaluate(()=>({main:document.querySelector('main')?.outerHTML,header:document.querySelector('.fegn-site-header')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML,serviceAssets:!!document.querySelector('link[href*="fegn-services.css"]')}));
  assert(!actual.serviceAssets,'Service styles leaked to '+slug);
  for(const part of ['main','header','footer'])assert.equal(actual[part],baseline[slug||'home'][part],`Changed ${part} on ${slug}`);
  checks.push({page:slug||'home',unchanged:true});
 }
 const context=await browser.newContext({reducedMotion:'reduce'});
 const reduced=await context.newPage();
 for(const slug of slugs){
  await reduced.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
  const state=await reduced.evaluate(()=>({pending:document.querySelectorAll('.svc-reveal-pending').length,durations:[...document.querySelectorAll('.svc-page [data-svc-reveal],.svc-page a')].map(e=>getComputedStyle(e).transitionDuration),links:[...document.querySelectorAll('.svc-page a[href]')].map(e=>e.href)}));
  assert.equal(state.pending,0);assert(state.durations.every(d=>d==='0s'));
  await reduced.locator('.svc-faq summary').first().focus();await reduced.keyboard.press('Enter');
  assert(await reduced.locator('.svc-faq details').first().getAttribute('open')!==null,'Keyboard FAQ failed '+slug);
  assert(state.links.every(l=>l.includes('/contact/')||l.includes('#fegn-features')),'Unexpected CTA');
  checks.push({page:slug,reducedMotion:true,keyboardFaq:true});
 }
 await page.goto(base+'/web-application-development/',{waitUntil:'networkidle'});
 await page.locator('[data-svc-option="operations"]').focus();await page.keyboard.press('Space');
 assert.equal(await page.locator('[data-svc-option="operations"]').getAttribute('aria-pressed'),'true');
 assert((await page.locator('[data-svc-copy]').innerText()).includes('approvals'));
 await page.locator('[data-svc-option="commerce"]').click();
 assert.equal(await page.locator('[data-svc-node]').innerText(),'Buyer');
 checks.push({portalSelector:true,keyboard:true});
 await page.goto(base+'/ai-chatbot/',{waitUntil:'networkidle'});
 await page.locator('[data-chat-scenario="handoff"]').focus();await page.keyboard.press('Space');
 assert.equal(await page.locator('[data-chat-scenario="handoff"]').getAttribute('aria-pressed'),'true');
 assert((await page.locator('[data-chat-answer]').innerText()).includes('person'));
 await page.locator('[data-chat-scenario="lead"]').click();
 assert((await page.locator('[data-chat-question]').innerText()).includes('project idea'));
 checks.push({chatbotPreview:true,keyboard:true});
 // Actual menu inventory and destinations, including the preserved ERP page.
 await page.locator('[aria-controls="fegn-mega-services"]').click();
 const menuLinks=await page.locator('#fegn-mega-services a').evaluateAll(es=>es.map(e=>e.href));
 assert.equal(menuLinks.length,8);
 for(const url of [...new Set([...menuLinks,base+'/contact/'])])assert.equal((await page.request.get(url)).status(),200,url);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('[aria-controls="fegn-mega-services"]').getAttribute('aria-expanded'),'false');
 checks.push({menuDestinations:menuLinks.length,contactCTA:true,escapeClosesMenu:true});
 await page.setViewportSize({width:390,height:844});
 await page.locator('.fegn-nav-toggle').click();
 await page.locator('[aria-controls="fegn-mega-services"]').click();
 await page.locator('#fegn-mega-services a[href*="saas-development"]').click();
 await page.waitForURL('**/saas-development/');
 assert(await page.locator('.svc-saas').count());
 checks.push({mobileNavigation:true});
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const staticPage=await nojs.newPage();
 for(const slug of slugs){
  await staticPage.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
  assert.equal(await staticPage.locator('.svc-reveal-pending').count(),0);
  assert(await staticPage.locator('.svc-page h1').isVisible());
  checks.push({page:slug,noJsVisible:true});
 }
 // Dark-mode coverage for every page at desktop and mobile widths.
 await page.addInitScript(()=>localStorage.setItem('fegn-theme','dark'));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const slug of slugs){
   await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
   await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,90))}scrollTo({top:0,behavior:'instant'})});
   await page.waitForTimeout(600);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:path.join(out,`${slug}-dark-${width}.png`),fullPage:true});
  }
 }
 fs.writeFileSync(path.join(out,'interaction-results.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify({passed:checks.length,checks,out},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
