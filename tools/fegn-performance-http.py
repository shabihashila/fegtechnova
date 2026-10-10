"""Repeatable localhost navigation measurements, no website dependencies."""
import json, time, statistics, urllib.request, pathlib, sys
base = 'http://localhost/fegtechnova/'
results = {}
for slug in ['', 'website/', 'saas-development/', 'contact/', 'about-us/', 'web-design/']:
    samples = []
    for _ in range(3):
        start = time.perf_counter()
        with urllib.request.urlopen(base + slug, timeout=45) as response:
            first = time.perf_counter()
            body = response.read()
            samples.append({'ttfb_ms': round((first-start)*1000, 2), 'total_ms': round((time.perf_counter()-start)*1000,2), 'status': response.status, 'bytes': len(body)})
    results[slug or 'home'] = {'median_ttfb_ms': statistics.median(s['ttfb_ms'] for s in samples), 'samples': samples}
    print(slug or 'home', results[slug or 'home']['median_ttfb_ms'], flush=True)
output = pathlib.Path(sys.argv[1])
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(results, indent=2))
print(output)
