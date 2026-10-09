"""Enhance existing navigation markup without changing its links or labels."""
from pathlib import Path
import re
p=Path('wp-content/themes/extendable-child/parts/header.html')
s=p.read_text(encoding='utf-8')
assert 'fegn-nav-premium' not in s, 'Header is already enhanced; edit it directly.'
s=s.replace('fegn-site-header','fegn-site-header fegn-nav-premium')
arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>'
icons={
'company':'<path d="M3 21h18M5 21V5l7-2 7 2v16M9 8h1m4 0h1M9 12h1m4 0h1M10 21v-5h4v5"/>',
'spark':'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
'grid':'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
'cloud':'<path d="M6 18h12a4 4 0 0 0 1-7.8A7 7 0 0 0 5.5 9 4.5 4.5 0 0 0 6 18Z"/>',
'code':'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
'phone':'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M10 5h4"/>',
'people':'<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m0-16a3 3 0 0 1 0 6m3 4a5 5 0 0 1 3 4v2"/>',
'pen':'<path d="m15 4 5 5M4 20l4-1L21 6l-4-4L4 15Z"/>',
'bot':'<rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4m-4 6h.1m7.9 0h.1M9 17h6M1 12v4m22-4v4"/>',
'chat':'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z"/><path d="M7 9h10M7 13h7"/>',
'globe':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
'screen':'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4M2 7h20"/>',
'bag':'<path d="M5 7h14l1 14H4ZM8 7V6a4 4 0 0 1 8 0v1"/>',
'mail':'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>',
'search':'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
'call':'<path d="M7 3 3 7c1 7 7 13 14 14l4-4-5-4-3 3a13 13 0 0 1-5-5l3-3Z"/>',
'megaphone':'<path d="m3 9 13-5v16L3 15Zm13-5 5-2v20l-5-2M6 16l1 5h4l-2-4"/>',
'film':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18m10-18v18M3 8h4m10 0h4M3 16h4m10 0h4m-10-7 4 3-4 3Z"/>',
'pin':'<path d="M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2"/>'}
data={
'about-us':('company','Meet the people behind the work'), 'why-choose-us':('spark','Our approach and what matters'),
'erp-development':('grid','Connect your business operations'), 'saas-development':('cloud','Build your next software platform'), 'web-application-development':('code','Purpose-built digital experiences'), 'mobile-app-development':('phone','Products made for life on the move'), 'crm':('people','Bring customer relationships together'), 'ui-ux-design':('pen','Clarity, character and thoughtful journeys'), 'ai-automation':('spark','Make everyday workflows smarter'), 'ai-chatbot':('bot','Helpful, connected conversations'),
'domain-hosting':('globe','A strong foundation for your website'), 'web-design':('screen','Your best first impression, online'), 'ecommerce':('bag','A considered shopping experience'), 'shopify':('bag','A storefront shaped around your brand'),
'whatsapp-marketing':('chat','Relevant messages, closer conversations'), 'email-marketing':('mail','Create an inbox moment worth opening'), 'sms-voice-marketing':('phone','Short messages with a clear purpose'), 'seo':('search','Useful content, clearer discovery'), 'telemarketing':('call','A human voice and thoughtful follow-up'), 'social-media-management':('people','A recognisable brand across channels'), 'paid-advertising':('megaphone','Audience, creative and campaign direction'), '2d-3d-animation':('film','Bring ideas and stories into motion'), 'business-profile':('pin','Represent your business consistently'), 'graphic-design':('pen','A distinctive visual language'), 'corporate-video':('film','Frame your next brand story')}
def enhance(m):
    href,label=m.group(2),m.group(3); key=href.strip('/');icon,desc=data[key]
    return m.group(1)+f'<span class="fegn-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24">{icons[icon]}</svg></span><span class="fegn-menu-copy"><strong>{label}</strong><small>{desc}</small></span>'+arrow.replace('<svg ','<svg class="fegn-menu-arrow" ')+m.group(4)
s,count=re.subn(r'(<li><a href="([^"]+)">)([^<]*)(</a></li>)',enhance,s)
assert count==25,count
intros={'about':('THE COMPANY','Good people.<br>Thoughtful work.','Get to know FEG TechNova and the way we approach your next project.'),'services':('TECHNOLOGY & DESIGN','Build what’s<br>next.','From connected business systems to useful digital products.'),'website':('YOUR DIGITAL PRESENCE','A better home.<br>For your brand.','From the first domain to the next beautifully considered storefront.'),'marketing':('STRATEGY & CREATIVE','Make your<br>mark.','Clear ideas. Distinctive creative. A coherent brand experience.')}
art='<svg viewBox="0 0 200 95" fill="none" aria-hidden="true"><path d="M20 65h160M48 65V35m52 30V15m52 50V35" stroke="currentColor" stroke-opacity=".3"/><rect x="28" y="30" width="40" height="35" rx="11" stroke="currentColor"/><rect x="77" y="8" width="46" height="57" rx="14" fill="currentColor" fill-opacity=".12" stroke="currentColor"/><rect x="132" y="30" width="40" height="35" rx="11" stroke="currentColor"/><path d="m92 38 7 7 12-16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
for key,(eyebrow,title,desc) in intros.items():
    pattern=r'(<div id="fegn-mega-'+key+r'" class="fegn-mega-panel">\s*<div class="fegn-mega-cols[^"]*">)'
    intro=f'<aside class="fegn-menu-intro"><p class="fegn-menu-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{desc}</p><div class="fegn-menu-art">{art}</div></aside>'
    s,n=re.subn(pattern,lambda m:m.group(1)+'\n'+intro,s);assert n==1,key
s=s.replace('<a class="fegn-nav-link" href="/contact/">Contact</a>','<a class="fegn-nav-link" href="/contact/">Contact<span class="fegn-contact-arrow" aria-hidden="true">'+arrow+'</span></a>')
s=re.sub(r'(<span class="fegn-arrow" aria-hidden="true">).*?(</span>)',lambda m:m.group(1)+arrow+m.group(2),s)
s=re.sub(r'(<span class="fegn-drawer-brand" aria-hidden="true">)<svg.*?</svg>',lambda m:m.group(1)+'<img src="/wp-content/themes/extendable-child/assets/images/feg-technova-logo.png" alt="" width="81" height="49">',s,flags=re.S)
p.write_text(s,encoding='utf-8')
print('Enhanced 25 submenu links, four editorial panels and Contact; all URLs preserved.')
