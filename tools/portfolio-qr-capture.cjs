const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({reducedMotion:'reduce'});
 for(const theme of ['light','dark'])for(const width of [1440,768,390,320]){
  await p.setViewportSize({width,height:1000});await p.goto('http://localhost/fegtechnova/contact/',{waitUntil:'networkidle'});await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  const qr=p.locator('.ft-qr-image img');await qr.scrollIntoViewIfNeeded();await p.waitForFunction(()=>{const i=document.querySelector('.ft-qr-image img');return i.complete&&i.naturalWidth>0});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
  await qr.screenshot({path:path.join(process.env.TEMP,'fegn-portfolio-review',`qr-${theme==='dark'?'dark-':''}${width}.png`)});
 }await b.close();console.log('Captured eight fully loaded QR images.');})().catch(e=>{console.error(e);process.exit(1)});
