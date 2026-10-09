/* Accessible navigation. Local state, no dependencies or scroll handlers. */
(function(){'use strict';
function init(){
 var header=document.querySelector('.fegn-nav-premium');if(!header)return;
 var nav=header.querySelector('#fegn-primary-nav'),toggle=header.querySelector('.fegn-nav-toggle');
 // Portal the mobile drawer outside the filtered header: backdrop-filter
 // otherwise becomes its fixed-position containing block and can scroll it.
 var home=document.createComment('Navigation home');nav.parentNode.insertBefore(home,nav);
 var shell=document.createElement('div');shell.className='fegn-nav-premium fegn-mobile-shell';document.body.appendChild(shell);
 var groups=Array.from(nav.querySelectorAll('[data-fegn-mega]'));
 var mobile=matchMedia('(max-width:899px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 var scrim=document.createElement('div');scrim.className='fegn-nav-scrim';scrim.hidden=true;scrim.setAttribute('aria-hidden','true');document.body.appendChild(scrim);
 var originalOverflow=null,inerted=[];
 function trigger(g){return g.querySelector('.fegn-mega-trigger')}
 function panel(g){return g.querySelector('.fegn-mega-panel')}
 function opened(g){return trigger(g).getAttribute('aria-expanded')==='true'}
 function closeGroup(g,focus){g.classList.remove('is-open');trigger(g).setAttribute('aria-expanded','false');panel(g).hidden=true;if(focus)trigger(g).focus()}
 function closeGroups(except){groups.forEach(function(g){if(g!==except)closeGroup(g,false)})}
 function showGroup(g){closeGroups(g);var p=panel(g);p.hidden=false;void p.offsetWidth;g.classList.add('is-open');trigger(g).setAttribute('aria-expanded','true');if(mobile.matches){var list=nav.querySelector('.fegn-nav-list');list.scrollTo({top:list.scrollTop+g.getBoundingClientRect().top-list.getBoundingClientRect().top-4,behavior:reduce.matches?'instant':'smooth'});if(!reduce.matches&&p.animate)p.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:170,easing:'ease-out'})}}
 function controls(){return Array.from(nav.querySelectorAll('a[href],button:not([disabled])')).filter(function(el){return el.getClientRects().length&&!el.closest('[hidden]')})}
 function isolate(enable){
  if(enable){originalOverflow=[document.body.style.overflow,document.documentElement.style.overflow];document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';document.querySelectorAll('main,.fegn-site-footer').forEach(function(el){inerted.push([el,el.inert]);el.inert=true})}
  else{if(originalOverflow){document.body.style.overflow=originalOverflow[0];document.documentElement.style.overflow=originalOverflow[1];originalOverflow=null}inerted.forEach(function(item){item[0].inert=item[1]});inerted=[]}
 }
 function openDrawer(){if(!mobile.matches||nav.classList.contains('is-open'))return;closeGroups();nav.inert=false;nav.removeAttribute('aria-hidden');nav.classList.add('is-open');header.classList.add('is-drawer-open');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close navigation menu');scrim.hidden=false;scrim.classList.add('is-visible');isolate(true);nav.querySelector('.fegn-nav-list').scrollTop=0;nav.querySelector('[data-fegn-close]').focus({preventScroll:true})}
 function closeDrawer(focus){if(!nav.classList.contains('is-open'))return;closeGroups();nav.classList.remove('is-open');header.classList.remove('is-drawer-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation menu');scrim.classList.remove('is-visible');scrim.hidden=true;isolate(false);if(mobile.matches){nav.inert=true;nav.setAttribute('aria-hidden','true')}if(focus)toggle.focus({preventScroll:true})}
 function sync(){closeDrawer(false);closeGroups();if(mobile.matches)shell.appendChild(nav);else home.parentNode.insertBefore(nav,home.nextSibling);nav.inert=mobile.matches;if(mobile.matches)nav.setAttribute('aria-hidden','true');else nav.removeAttribute('aria-hidden')}
 var clean=function(path){return path.replace(/\/+$/,'')||'/'};
 nav.querySelectorAll('a[href]').forEach(function(link){if(clean(new URL(link.href,location.href).pathname)===clean(location.pathname)){link.setAttribute('aria-current','page');var g=link.closest('[data-fegn-mega]');if(g)trigger(g).setAttribute('data-current','true')}else link.removeAttribute('aria-current')});
 groups.forEach(function(g){var t=trigger(g),p=panel(g);p.hidden=true;t.addEventListener('click',function(){if(opened(g))closeGroup(g,false);else showGroup(g)});g.addEventListener('keydown',function(e){if(e.key==='Escape'&&opened(g)){e.preventDefault();e.stopPropagation();closeGroup(g,true)}if(e.key==='ArrowDown'&&e.target===t){e.preventDefault();showGroup(g);p.querySelector('a[href]').focus()}});g.addEventListener('focusout',function(){if(!mobile.matches)setTimeout(function(){if(!g.contains(document.activeElement))closeGroup(g,false)},0)})});
 toggle.addEventListener('click',function(){if(nav.classList.contains('is-open'))closeDrawer(true);else openDrawer()});nav.querySelector('[data-fegn-close]').addEventListener('click',function(){closeDrawer(true)});scrim.addEventListener('click',function(){closeDrawer(true)});
 nav.addEventListener('click',function(e){if(mobile.matches&&e.target.closest('a[href]'))closeDrawer(false)});document.addEventListener('click',function(e){if(!e.target.closest('[data-fegn-mega]'))closeGroups()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'){var g=groups.find(opened);if(g){e.preventDefault();closeGroup(g,true)}else if(nav.classList.contains('is-open')){e.preventDefault();closeDrawer(true)}}if(e.key==='Tab'&&mobile.matches&&nav.classList.contains('is-open')){var items=controls(),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 if(mobile.addEventListener)mobile.addEventListener('change',sync);else mobile.addListener(sync);sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
