/* Repeated uncached HTML timings using Node's built-in HTTP client. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
function request(url, headers = {}) {
 return new Promise((resolve, reject) => {
  const start = performance.now();
  const req = http.get(url, {headers}, response => {
   const first = performance.now(); let bytes = 0;
   response.on('data', chunk => bytes += chunk.length);
   response.on('end', () => resolve({ttfb_ms: +(first-start).toFixed(2),total_ms: +(performance.now()-start).toFixed(2),status: response.statusCode,bytes,headers:response.headers}));
  }).on('error', reject);
  req.setTimeout(45000, () => req.destroy(new Error('Request exceeded 45 seconds: '+url)));
 });
}
(async () => {
 const results = {};
 if (!process.argv[2]) throw new Error('Usage: node tools/fegn-performance-http.cjs output.json');
 for (const slug of ['', 'website/', 'saas-development/', 'contact/', 'about-us/', 'web-design/']) {
  const samples = [];
  for (let i=0;i<3;i++) samples.push(await request('http://localhost/fegtechnova/'+slug));
  results[slug || 'home'] = {median_ttfb_ms: samples.map(s=>s.ttfb_ms).sort((a,b)=>a-b)[1], samples};
  console.log(slug || 'home', results[slug || 'home'].median_ttfb_ms);
 }
 fs.mkdirSync(path.dirname(process.argv[2]), {recursive:true});
 fs.writeFileSync(process.argv[2], JSON.stringify(results,null,2));
})().catch(error => {console.error(error);process.exitCode=1});
