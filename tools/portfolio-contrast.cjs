const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path');
const slugs=['website','domain-hosting','web-design','ecommerce','shopify','whatsapp-marketing','email-marketing','sms-voice-marketing','seo','telemarketing','social-media-management','paid-advertising','2d-3d-animation','business-profile','graphic-design','corporate-video','contact'];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({reducedMotion:'reduce'});
 const issues=[];
 for(const theme of ['light','dark'])for(const slug of slugs){
  await page.goto('http://localhost/fegtechnova/'+slug+'/',{waitUntil:'networkidle'});
  await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  await page.waitForTimeout(500);
  const result=await page.evaluate(()=>{
   function color(s){const n=s?.match(/[\d.]+/g)?.map(Number);return n?.length>=3?[n[0],n[1],n[2],n[3]??1]:[0,0,0,0]}
   function blend(a,b){return a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3])).concat(1)}
   function bg(el){let c=el.parentElement?bg(el.parentElement):[255,255,255,1];const s=getComputedStyle(el);c=blend(color(s.backgroundColor),c);if(s.backgroundImage.startsWith('linear-gradient')){const cs=[...s.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m=>color(m[0]));if(cs.length){const average=[0,1,2,3].map(i=>cs.reduce((sum,x)=>sum+x[i],0)/cs.length);c=blend(average,c)}}return c}
   function lum(c){return c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0)}
   return [...document.querySelectorAll('.svc-page *')].filter(e=>e.getClientRects().length && !e.closest('[aria-hidden=true]') && [...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(e=>{
    const s=getComputedStyle(e), fg=color(s.color), background=bg(e), ls=[lum(fg),lum(background)].sort((a,b)=>b-a),ratio=(ls[0]+.05)/(ls[1]+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&parseInt(s.fontWeight)>=700),required=large?3:4.5;
    return ratio<required-.05?[{selector:e.tagName+'.'+e.className,parent:e.parentElement.className,text:e.textContent.trim().slice(0,65),fg:s.color,bg:background.map(x=>Math.round(x)),ratio:Math.round(ratio*100)/100,required}]:[];
   });
  });
  for(const issue of result)issues.push({theme,slug,...issue});
 }
 fs.writeFileSync(path.join(process.env.TEMP,'fegn-portfolio-review','contrast-results.json'),JSON.stringify(issues,null,2));
 const unique=[...new Map(issues.map(x=>[x.theme+x.selector+x.parent+x.fg, x])).values()];
 console.log(JSON.stringify({total:issues.length,unique},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


