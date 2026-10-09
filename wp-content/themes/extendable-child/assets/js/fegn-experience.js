/* Two-page polish: finite entrances, one-time reveals, existing pause support. */
(function(){'use strict';
function init(){
 var main=document.querySelector('main');if(!main)return;
 var home=document.body.classList.contains('home'),contact=main.classList.contains('ft--contact');if(!home&&!contact)return;
 main.dataset.experience=home?'home':'contact';
 var motion=matchMedia('(prefers-reduced-motion:reduce)'),animations=[],observer;
 function animate(el,delay,distance,duration){if(!el||motion.matches||!el.animate)return;var a=el.animate([{opacity:0,translate:'0 '+distance+'px'},{opacity:1,translate:'0 0'}],{duration:duration||650,delay:delay||0,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});animations.push(a);a.addEventListener('finish',function(){animations=animations.filter(function(item){return item!==a})},{once:true})}
 var hero=main.querySelector(home?'.fegn-hero--bg':'.ft-hero--contact');
 if(hero){var entrance=home?['.fegn-eyebrow','h1','.fegn-lead','.fegn-hero-actions','.fegn-hero-panel']:['.svc-kicker','h1','.ft-lead','.svc-actions','.ft-hero-chips'];entrance.forEach(function(selector,i){animate(hero.querySelector(selector),i*75,i===4?14:18,780)})}
 // Existing Contact service reveal owns its form/intro. New observer covers only
 // independent elements, with no transform or opacity on the QR card or image.
 var selectors=home?'.fegn-capabilities__header,.fegn-capabilities__card,.fegn-home-process .fegn-section-title,.fegn-home-process .fegn-step,.ft-selected-work__header,.ft-selected-work__card':'.ft-contact-links>a,.ft-contact-links>div,.ft-contact-details>div:first-child>h2';
 var elements=Array.from(main.querySelectorAll(selectors));
 if(!motion.matches&&'IntersectionObserver'in window){
  observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;var el=entry.target;el.removeAttribute('data-xp-pending');el.setAttribute('data-xp-seen','');var index=Array.from(el.parentElement.children).indexOf(el);animate(el,Math.min(index*55,165),el.matches('article,.fegn-step')?18:12,650);observer.unobserve(el)})},{threshold:.08,rootMargin:'0px 0px -16px 0px'});
  elements.forEach(function(el){if(el.getBoundingClientRect().top>innerHeight){el.setAttribute('data-xp-pending','');observer.observe(el)}else el.setAttribute('data-xp-seen','')});
 }
 if(home&&hero&&'IntersectionObserver'in window){var visibility=new IntersectionObserver(function(entries){hero.classList.toggle('fegn-motion-outside',!entries[0].isIntersecting)},{threshold:.01});visibility.observe(hero)}
 if(contact){var status=main.querySelector('#fegn-form-status');if(status&&'MutationObserver'in window){var feedback=new MutationObserver(function(){if(!status.hidden)animate(status,0,6,320)});feedback.observe(status,{attributes:true,attributeFilter:['hidden','class'],childList:true})}}
 function reduce(){if(!motion.matches)return;animations.forEach(function(a){a.cancel()});animations=[];elements.forEach(function(el){el.removeAttribute('data-xp-pending');el.setAttribute('data-xp-seen','')});if(observer)observer.disconnect()}
 if(motion.addEventListener)motion.addEventListener('change',reduce);else motion.addListener(reduce);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
