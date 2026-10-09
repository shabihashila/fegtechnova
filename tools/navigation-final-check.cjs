const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:1000}}),checks=[];
 await p.goto('http://localhost/fegtechnova/website/',{waitUntil:'networkidle'});
 const hrefs=await p.locator('.fegn-site-header a[href]').evaluateAll(as=>[...new Set(as.filter(a=>!a.getAttribute('href').startsWith('#')).map(a=>a.href))]);
 for(const href of hrefs){const r=await p.request.get(href);assert(r.status()===200,href);checks.push('Destination '+href)}
 // WordPress can prepend its own core skip link; reach the theme link naturally.
 for(let i=0;i<8&&!await p.locator('.fegn-skip-link').evaluate(e=>e===document.activeElement);i++)await p.keyboard.press('Tab');assert(await p.locator('.fegn-skip-link').evaluate(e=>e===document.activeElement));await p.keyboard.press('Enter');assert(await p.evaluate(()=>location.hash==='#fegn-main'));checks.push('Keyboard skip link');
 await p.setViewportSize({width:390,height:900});await p.goto('http://localhost/fegtechnova/website/',{waitUntil:'networkidle'});await p.locator('.fegn-nav-toggle').click();await p.locator('[aria-controls="fegn-mega-marketing"]').click();assert(await p.locator('#fegn-mega-marketing').evaluate(e=>e.getAnimations().length)>0);checks.push('Lightweight mobile reveal');
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('[data-fegn-close]').click();await p.locator('.fegn-nav-toggle').click();await p.locator('[aria-controls="fegn-mega-marketing"]').click();assert(await p.locator('#fegn-mega-marketing').evaluate(e=>e.getAnimations().length)===0);assert(await p.locator('#fegn-primary-nav').evaluate(e=>getComputedStyle(e).transitionDuration.split(',').every(x=>parseFloat(x)===0)));checks.push('Reduced motion honoured');
 await p.locator('[data-fegn-close]').click();await p.locator('.fegn-nav-toggle').click();await p.setViewportSize({width:1440,height:900});await p.waitForFunction(()=>document.querySelector('#fegn-primary-nav').parentElement.closest('.fegn-site-header')!==null);assert(await p.evaluate(()=>!document.querySelector('main').inert&&document.body.style.overflow===''));checks.push('Resize restores desktop navigation and page access');
 fs.writeFileSync(path.join(process.env.TEMP,'fegn-navigation-review','final-checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({passed:checks.length},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
