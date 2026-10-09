/* Browser QA: existing pages/chrome, every concept switcher, form and QR crops. */
const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const out=path.join(process.env.TEMP,'fegn-portfolio-review'),base='http://localhost/fegtechnova';
const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json')));
const theme='wp-content/themes/extendable-child';
const slugs=['website','domain-hosting','web-design','ecommerce','shopify','whatsapp-marketing','email-marketing','sms-voice-marketing','seo','telemarketing','social-media-management','paid-advertising','2d-3d-animation','business-profile','graphic-design','corporate-video','contact'];
// Core adds smart punctuation/decoding in block pages and current-page state.
const normalize=s=>(s||'').replace(/svc-reveal-pending|erp-reveal-pending|is-in/g,'').replace(/ aria-current="page"| decoding="async"/g,'').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(),results=[];const check=(name,condition)=>{assert(condition,name);results.push(name)};
 for(const [file,expected]of Object.entries(baseline.files)){const actual=file==='contact-backend'?'wp-content/plugins/feg-technova-core/includes/contact-form.php':file==='contact-script'?theme+'/assets/js/fegn-contact-form.js':theme+'/'+file;check('Unchanged file: '+file,hash(actual)===expected)}
 for(const [slug,expected]of Object.entries(baseline.pages)){
  await page.goto(base+'/'+(slug==='home'?'':slug+'/'),{waitUntil:'networkidle'});
  const actual=await page.evaluate(()=>({main:document.querySelector('main')?.outerHTML,header:document.querySelector('.fegn-site-header')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML}));
  for(const part of ['main','header','footer'])check('Preserved '+slug+' '+part,normalize(actual[part])===normalize(expected[part]));
  check('New assets excluded: '+slug,await page.locator('link[href*="fegn-portfolio.css"]').count()===0);
 }
 for(const slug of slugs){
  await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
  const chrome=await page.evaluate(()=>({header:document.querySelector('.fegn-site-header')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML}));
  for(const part of ['header','footer'])check('Shared '+slug+' '+part,normalize(chrome[part])===normalize(baseline.pages.home[part]));
  const badLinks=await page.evaluate(()=>[...document.querySelectorAll('.ft-page a')].filter(a=>!a.getAttribute('href')||a.getAttribute('href')==='#').map(a=>a.textContent));check('Concrete links '+slug,badLinks.length===0);
  const groups=page.locator('.ft-interactive');
  for(let i=0;i<await groups.count();i++){const group=groups.nth(i),buttons=group.locator('[data-ft-choice]');for(let j=0;j<await buttons.count();j++){await buttons.nth(j).click();check(`Switcher ${slug} ${i}/${j}`,await group.locator('[data-ft-panel]:visible').count()===1&&await buttons.nth(j).getAttribute('aria-pressed')==='true');}await buttons.first().click()}
 }
 await page.goto(base+'/contact/?service=marketing#project-inquiry',{waitUntil:'networkidle'});
 check('CTA selects Marketing',await page.locator('#fegn-service').inputValue()==='marketing');
 await page.locator('[data-ft-service="website"]').click();check('Contact interest selector',await page.locator('#fegn-service').inputValue()==='website');
 await page.locator('#fegn-form-submit-btn').click();check('Required-name validation',await page.locator('#fegn-form-status').innerText()==='Please enter your full name.'&&await page.locator('#fegn-name').evaluate(e=>e===document.activeElement));
 await page.locator('#fegn-name').fill('Local UI Review');await page.locator('#fegn-email').fill('invalid');await page.locator('#fegn-form-submit-btn').click();check('Email validation',/valid email/.test(await page.locator('#fegn-form-status').innerText()));
 await page.locator('#fegn-email').fill('ui-review@example.com');await page.locator('#fegn-phone').fill('01886800991');await page.locator('#fegn-message').fill('Localhost interface verification. No external delivery requested.');
 const responsePromise=page.waitForResponse(r=>r.url().includes('admin-ajax.php')&&r.request().method()==='POST');await page.locator('#fegn-form-submit-btn').click();const response=await responsePromise;const json=await response.json();check('Existing local submission succeeds',response.ok()&&json.success===true);await page.waitForFunction(()=>document.querySelector('#fegn-form-submit-btn').disabled===false);check('Form resets after success',await page.locator('#fegn-name').inputValue()===''&&await page.locator('#fegn-form-status').getAttribute('class').then(c=>c.includes('is-success')));
 const invalid=await page.evaluate(async()=>{const r=await fetch(FegnContactForm.ajaxUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({action:FegnContactForm.action,nonce:FegnContactForm.nonce,full_name:'Review',email:'invalid',phone:'123',service:'website',message:'Validation review'}).toString()});return {status:r.status,body:await r.json()}});check('Server rejects invalid email',invalid.status===422&&invalid.body.success===false);
 const badNonce=await page.evaluate(async()=>{const r=await fetch(FegnContactForm.ajaxUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'action=fegn_submit_inquiry&nonce=invalid'});return r.status});check('Server rejects invalid nonce',badNonce===403);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/contact/',{waitUntil:'networkidle'});await page.locator('.ft-qr-image img').scrollIntoViewIfNeeded();await page.locator('.ft-qr-image img').screenshot({path:path.join(out,`qr-${width}.png`)});check('QR exact destination '+width,await page.locator('.ft-qr-image').getAttribute('href')==='https://linktr.ee/fegtechnova');
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const slug of slugs){await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});await page.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));const issues=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.querySelectorAll('main img')].filter(i=>!i.complete||!i.naturalWidth).length}));check('Dark layout '+slug,!issues.overflow&&!issues.broken);await page.screenshot({path:path.join(out,slug+'-dark.png'),fullPage:true});}
 await context.close();const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const plain=await noJS.newPage();await plain.goto(base+'/graphic-design/',{waitUntil:'networkidle'});check('No-JS content visible',await plain.locator('h1').isVisible()&&await plain.locator('.ft-panel').first().isVisible());await noJS.close();
 const normal=await browser.newContext({viewport:{width:1440,height:1000}}),motion=await normal.newPage();await motion.goto(base+'/2d-3d-animation/',{waitUntil:'networkidle'});check('Purposeful motion enabled',await motion.locator('.ft-motion-shape').first().evaluate(e=>getComputedStyle(e).animationName)==='ft-drift');await motion.emulateMedia({reducedMotion:'reduce'});check('Reduced motion disables animation',await motion.locator('.ft-motion-shape').first().evaluate(e=>getComputedStyle(e).animationName)==='none');await normal.close();
 fs.writeFileSync(path.join(out,'final-checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,out},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
