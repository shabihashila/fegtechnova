const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const out=path.join(process.env.TEMP,'fegn-portfolio-review');fs.mkdirSync(out,{recursive:true});
const base='http://localhost/fegtechnova';
const website=['website','domain-hosting','web-design','ecommerce','shopify'];
const marketing=['whatsapp-marketing','email-marketing','sms-voice-marketing','seo','telemarketing','social-media-management','paid-advertising','2d-3d-animation','business-profile','graphic-design','corporate-video'];
const targets=[...website,...marketing,'contact'];
const protectedPages=['erp-development','saas-development','web-application-development','mobile-app-development','crm','ui-ux-design','ai-automation','ai-chatbot','','about-us','why-choose-us','marketing'];
const theme='wp-content/themes/extendable-child';
const protectedFiles=['parts/header.html','parts/footer.html','templates/page-erp-development.html','assets/css/fegn-erp.css','assets/js/fegn-erp.js','assets/css/fegn-services.css','assets/js/fegn-services.js',...['saas','web-app','mobile-app','crm','uiux','ai-automation','ai-chatbot'].map(x=>'templates/page-'+x+'.html')];
const fileHash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const normalize=s=>(s||'').replace(/svc-reveal-pending|erp-reveal-pending|is-in/g,'').replace(/\s+/g,' ');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 if(process.argv.includes('baseline')){
  const pages={};for(const slug of protectedPages){await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});pages[slug||'home']=await page.evaluate(()=>({main:document.querySelector('main')?.outerHTML,header:document.querySelector('.fegn-site-header')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML}));}
  const files=Object.fromEntries(protectedFiles.map(p=>[p,fileHash(path.join(theme,p))]));
  files['contact-backend']=fileHash('wp-content/plugins/feg-technova-core/includes/contact-form.php');
  files['contact-script']=fileHash(path.join(theme,'assets/js/fegn-contact-form.js'));
  fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify({pages,files},null,2));
  console.log('Preservation baseline: '+out);await browser.close();return;
 }
 const widths=process.argv.filter(x=>/^\d+$/.test(x)).map(Number);
 const slugs=process.argv.includes('website')?website:process.argv.includes('marketing')?marketing:targets;
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of widths.length?widths:[1440,768,390,320]){await page.setViewportSize({width,height:1000});for(const slug of slugs){
  const response=await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,60))}scrollTo({top:0,behavior:'instant'})});
  const state=await page.evaluate(()=>({
   designed:!!document.querySelector('.ft-page'),h1:document.querySelectorAll('main h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1,
   broken:[...document.querySelectorAll('main img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
   sectionPadding:[...document.querySelectorAll('.ft-page>.svc-section')].map(e=>[getComputedStyle(e).paddingTop,getComputedStyle(e).paddingBottom]),
   missingAnchors:[...document.querySelectorAll('main a[href^="#"]')].filter(e=>!document.getElementById(e.hash.slice(1))).map(e=>e.hash),
   thirdPartyLibraries:[...document.scripts].map(s=>s.src).filter(s=>/tailwind|unpkg|lucide/.test(s)),
   aligned:[...document.querySelectorAll('.ft-page>.svc-section>.svc-wrap')].map(e=>Math.round(e.getBoundingClientRect().left))
  }));results.push({slug,width,status:response.status(),...state});
  if(width!==320)await page.screenshot({path:path.join(out,`${slug}-${width}.png`),fullPage:true});
 }}
 const failures=results.filter(r=>r.status!==200||!r.designed||r.h1!==1||r.overflow||r.broken.length||r.missingAnchors.length||r.thirdPartyLibraries.length||r.sectionPadding.some(p=>p[0]!=='42px'||p[1]!=='42px'));
 fs.writeFileSync(path.join(out,'layout-'+(process.argv.includes('website')?'website':process.argv.includes('marketing')?'marketing':'all')+'.json'),JSON.stringify({results,errors,failures},null,2));
 console.log(JSON.stringify({pages:slugs.length,layouts:results.length,failures,errors,out},null,2));
 await browser.close();if(failures.length||errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
