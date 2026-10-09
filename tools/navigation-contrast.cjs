const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),issues=[];
for(const theme of ['light','dark'])for(const menu of ['about','services','website','marketing']){
 await p.goto('http://localhost/fegtechnova/erp-development/',{waitUntil:'networkidle'});await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);await p.locator('[aria-controls="fegn-mega-'+menu+'"]').click();
 const result=await p.evaluate(()=>{
 const color=s=>{const n=s?.match(/[\d.]+/g)?.map(Number);return n?.length>=3?[n[0],n[1],n[2],n[3]??1]:[0,0,0,0]};
 const blend=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3])).concat(1);
 function bg(e){let c=e.parentElement?bg(e.parentElement):[255,255,255,1],s=getComputedStyle(e);c=blend(color(s.backgroundColor),c);if(s.backgroundImage.startsWith('linear-gradient')){let cs=[...s.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m=>color(m[0]));if(cs.length)c=blend([0,1,2,3].map(i=>cs.reduce((sum,x)=>sum+x[i],0)/cs.length),c)}return c}
 const lum=c=>c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);
 return [...document.querySelectorAll('.fegn-nav-premium *')].filter(e=>e.getClientRects().length&&!e.closest('[hidden],[aria-hidden=true]')&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(e=>{let s=getComputedStyle(e),fg=color(s.color),background=bg(e),ls=[lum(fg),lum(background)].sort((a,b)=>b-a),ratio=(ls[0]+.05)/(ls[1]+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&parseInt(s.fontWeight)>=700),required=large?3:4.5;return ratio<required-.05?[{selector:e.tagName+'.'+e.className,text:e.textContent.trim().slice(0,70),fg:s.color,bg:background,ratio,required}]:[]});
 });issues.push(...result.map(r=>({theme,menu,...r})));
}
fs.writeFileSync(path.join(process.env.TEMP,'fegn-navigation-review','contrast.json'),JSON.stringify(issues,null,2));console.log(JSON.stringify({issues},null,2));await b.close();if(issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
