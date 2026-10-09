const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs');
const crypto=require('crypto');
const path=require('path');
const out=path.join(process.env.TEMP,'fegn-services-review');
fs.mkdirSync(out,{recursive:true});
const base='http://localhost/fegtechnova';
const slugs=['saas-development','web-application-development','mobile-app-development','crm','ui-ux-design','ai-automation','ai-chatbot'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 if(process.argv.includes('baseline')){
  const snapshots={};
  for(const slug of ['erp-development','', 'contact','about-us']){
   await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
   snapshots[slug||'home']=await page.evaluate(()=>({main:document.querySelector('main')?.outerHTML,header:document.querySelector('.fegn-site-header')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML}));
  }
  fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify(snapshots,null,2));
  await page.goto(base+'/erp-development/',{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(out,'erp-reference.png'),fullPage:true});
  console.log('Baseline saved: '+out); await browser.close(); return;
 }
 const errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const slug of slugs){
   const response=await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
   await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,90))}scrollTo({top:0,behavior:'instant'})});
   await page.waitForTimeout(650);
   const state=await page.evaluate(()=>({
    h1:[...document.querySelectorAll('main h1')].map(e=>e.textContent.trim()),
    redesigned:!!document.querySelector('.svc-page'),
    overflow:document.documentElement.scrollWidth>innerWidth+1,
    broken:[...document.querySelectorAll('main img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
    sections:[...document.querySelectorAll('.svc-page > section')].map(e=>({id:e.id,top:getComputedStyle(e).paddingTop,bottom:getComputedStyle(e).paddingBottom})),
    missingAnchors:[...document.querySelectorAll('main a[href^="#"]')].filter(e=>!document.getElementById(e.hash.slice(1))).map(e=>e.hash),
    emptyLinks:[...document.querySelectorAll('main a')].filter(e=>!e.getAttribute('href')||e.getAttribute('href')==='#').length,
    invisible:[...document.querySelectorAll('[data-svc-reveal]')].filter(e=>getComputedStyle(e).opacity==='0').length,
    contrastPanels:[...document.querySelectorAll('.svc-glass')].map(e=>getComputedStyle(e).backgroundColor)
   }));
   results.push({slug,width,status:response.status(),...state});
   if(width!==320)await page.screenshot({path:path.join(out,`${slug}-${width}.png`),fullPage:true});
  }
 }
 fs.writeFileSync(path.join(out,'layout-results.json'),JSON.stringify({results,errors},null,2));
 const fails=results.filter(r=>r.status!==200||!r.redesigned||r.h1.length!==1||r.overflow||r.broken.length||r.missingAnchors.length||r.emptyLinks||r.invisible||r.sections.some(s=>s.top!=='42px'||s.bottom!=='42px'));
 console.log(JSON.stringify({pages:slugs.length,layouts:results.length,failures:fails,errors,out},null,2));
 await browser.close(); if(fails.length||errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
