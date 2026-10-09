const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const out=path.join(process.env.TEMP,'fegn-navigation-review');fs.mkdirSync(out,{recursive:true});
const base='http://localhost/fegtechnova',theme='wp-content/themes/extendable-child';
const pages=['','erp-development','graphic-design','contact','shopify'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const normalize=s=>(s||'').replace(/svc-reveal-pending|erp-reveal-pending|is-in/g,'').replace(/\s+/g,' ');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
if(process.argv.includes('baseline')){
 const protectedFiles=[];for(const dir of ['templates','landing','assets/css','assets/js'])for(const file of fs.readdirSync(theme+'/'+dir)){const p=theme+'/'+dir+'/'+file;if(fs.statSync(p).isFile()&&!file.includes('header'))protectedFiles.push(p)}protectedFiles.push(theme+'/parts/footer.html');
 const rendered={};for(const slug of pages){await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});rendered[slug||'home']=await page.evaluate(()=>({main:document.querySelector('main')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML}));}
 const menu=await page.locator('.fegn-site-header a').evaluateAll(as=>as.map(a=>({href:a.getAttribute('href'),text:a.textContent.trim(),img:a.querySelector('img')?.getAttribute('src')})));
 fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify({rendered,menu,files:Object.fromEntries(protectedFiles.map(p=>[p,hash(p)]))},null,2));console.log('Navigation baseline saved.');await browser.close();return;
}
const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json'))),checks=[];const check=(name,state)=>{assert(state,name);checks.push(name)};
for(const [file,expected]of Object.entries(baseline.files))check('Unchanged '+file,hash(file)===expected);
for(const slug of pages){await page.goto(base+'/'+slug+'/',{waitUntil:'networkidle'});const actual=await page.evaluate(()=>({main:document.querySelector('main')?.outerHTML,footer:document.querySelector('.fegn-site-footer')?.outerHTML}));for(const part of ['main','footer'])check('Preserved '+slug+' '+part,normalize(actual[part])===normalize(baseline.rendered[slug||'home'][part]));}
await page.goto(base+'/erp-development/',{waitUntil:'networkidle'});
const links=await page.locator('.fegn-site-header a').evaluateAll(as=>as.map(a=>({href:a.getAttribute('href'),img:a.querySelector('img')?.getAttribute('src')})));
check('Every original header link and logo preserved',JSON.stringify(links)===JSON.stringify(baseline.menu.map(({href,img})=>({href,img}))));
check('Current submenu link',await page.locator('#fegn-mega-services a[aria-current="page"]').count()===1);check('Current parent',await page.locator('[aria-controls="fegn-mega-services"]').getAttribute('data-current')==='true');
for(const width of [1440,1024,900,782,768,390,320])for(const color of ['light','dark']){
 await page.setViewportSize({width,height:900});await page.goto(base+'/erp-development/',{waitUntil:'networkidle'});await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),color);
 check(`No page overflow ${width}/${color}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const mobile=width<900;
 if(mobile){await page.locator('.fegn-nav-toggle').click();check(`Drawer opens ${width}/${color}`,await page.locator('.fegn-nav-toggle').getAttribute('aria-expanded')==='true');check(`Body locked ${width}/${color}`,await page.evaluate(()=>document.body.style.overflow==='hidden'));const drawerBounds=await page.locator('#fegn-primary-nav').boundingBox();check(`Drawer fixed to viewport ${width}/${color}`,Math.abs(drawerBounds.y)<1&&Math.abs(drawerBounds.height-900)<1);}
 for(const menu of ['about','services','website','marketing']){
  const trigger=page.locator('[aria-controls="fegn-mega-'+menu+'"]');await trigger.click();const panel=page.locator('#fegn-mega-'+menu);await page.waitForTimeout(100);
  check(`Panel opens ${menu}/${width}/${color}`,await trigger.getAttribute('aria-expanded')==='true'&&await panel.isVisible());
  const bounds=await panel.boundingBox();check(`Panel within viewport ${menu}/${width}/${color}`,bounds.x>=-1&&bounds.x+bounds.width<=width+1);
  for(const a of await panel.locator('a').all())check(`Visible link ${await a.getAttribute('href')}/${width}/${color}`,await a.isVisible());
  if(menu==='marketing'&&(width===1440||width===390||width===320))await page.screenshot({path:path.join(out,`navigation-${width}-${color}.png`)});
  if(mobile){const headBounds=await page.locator('.fegn-drawer-head').boundingBox();check(`Pinned drawer controls ${menu}/${width}/${color}`,headBounds.y>=0&&headBounds.y<5);const last=panel.locator('a').last();await last.scrollIntoViewIfNeeded();const lastBounds=await last.boundingBox(),footerBounds=await page.locator('.fegn-drawer-cta-wrap').boundingBox();check(`Last link clear of CTA ${menu}/${width}/${color}`,lastBounds.y>=headBounds.y+headBounds.height-1&&lastBounds.y+lastBounds.height<=footerBounds.y+1);}
  await page.keyboard.press('Escape');check(`Escape closes ${menu}/${width}/${color}`,await trigger.getAttribute('aria-expanded')==='false');
 }
 if(mobile){await page.keyboard.press('Escape');check(`Drawer closes ${width}/${color}`,await page.locator('.fegn-nav-toggle').getAttribute('aria-expanded')==='false');check(`Body unlocks ${width}/${color}`,await page.evaluate(()=>document.body.style.overflow===''));}
}
await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/website/',{waitUntil:'networkidle'});const trigger=page.locator('[aria-controls="fegn-mega-website"]');await trigger.focus();await page.keyboard.press('ArrowDown');check('ArrowDown enters menu',await page.locator('#fegn-mega-website a').first().evaluate(e=>e===document.activeElement));await page.keyboard.press('Escape');check('Escape returns focus to trigger',await trigger.evaluate(e=>e===document.activeElement));await trigger.click();await page.mouse.click(10,850);check('Outside click closes',await trigger.getAttribute('aria-expanded')==='false');
await page.locator('.fegn-header-inner > [data-fegn-theme-toggle]').click();const selected=await page.locator('html').getAttribute('data-theme');await page.reload({waitUntil:'networkidle'});check('Theme persists',await page.locator('html').getAttribute('data-theme')===selected);
await page.setViewportSize({width:390,height:900});await page.locator('.fegn-nav-toggle').click();await page.locator('.fegn-theme-toggle--drawer').focus();await page.keyboard.press('Shift+Tab');check('Mobile focus trap',await page.locator('.fegn-drawer-cta').evaluate(e=>e===document.activeElement));await page.keyboard.press('Tab');check('Focus wraps forward',await page.locator('.fegn-theme-toggle--drawer').evaluate(e=>e===document.activeElement));await page.locator('[data-fegn-close]').click();
await page.locator('.fegn-nav-toggle').click();await page.locator('[aria-controls="fegn-mega-website"]').click();await page.locator('#fegn-mega-website a').first().click();await page.waitForURL('**/domain-hosting/');check('Mobile navigation reaches correct page',await page.locator('.ft--domain-hosting').count()===1);
await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));await page.evaluate(()=>scrollTo({top:800,behavior:'instant'}));check('Header stays visible when scrolling',await page.locator('.fegn-site-header').evaluate(e=>e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().top<5));
check('No runtime errors',errors.length===0);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors,out},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
