const {chromium}=require(process.env.TEMP+'/zrc-browser-review/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({reducedMotion:'reduce'}),out=path.join(process.env.TEMP,'fegn-navigation-review');
for(const theme of ['light','dark'])for(const width of [1440,390]){await p.setViewportSize({width,height:900});await p.goto('http://localhost/fegtechnova/website/',{waitUntil:'networkidle'});await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);if(width<900)await p.locator('.fegn-nav-toggle').click();await p.locator('[aria-controls="fegn-mega-marketing"]').click();await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:path.join(out,`navigation-final-${width}-${theme}.png`)});}
fs.mkdirSync('docs',{recursive:true});await b.close();console.log('Final navigation previews captured.');})().catch(e=>{console.error(e);process.exit(1)});
