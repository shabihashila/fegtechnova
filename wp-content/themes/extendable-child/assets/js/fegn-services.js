/* Scoped service interactions. No dependencies, network calls, or collected data. */
(function () {
 'use strict';
 var root = document.querySelector('.svc-page');
 if (!root) return;
 var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 var reveal = Array.prototype.slice.call(root.querySelectorAll('[data-svc-reveal]'));
 if (!reduced.matches && 'IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function (entries) {
   entries.forEach(function (entry) {
    if (entry.isIntersecting) {
     entry.target.classList.remove('svc-reveal-pending');
     observer.unobserve(entry.target);
    }
   });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  reveal.forEach(function (el) {
   if (el.getBoundingClientRect().top > window.innerHeight) {
    el.classList.add('svc-reveal-pending');
    observer.observe(el);
   }
  });
  var showAll = function () {
   if (reduced.matches) {
    reveal.forEach(function (el) { el.classList.remove('svc-reveal-pending'); });
    observer.disconnect();
   }
  };
  if (reduced.addEventListener) reduced.addEventListener('change', showAll);
 }
 var portals = {
  portal: {label:'YOUR CUSTOMER, CONNECTED',title:'A useful front door to your business.',copy:'Give customers a clear place to manage requests, documents, and account activity.',node:'Customer',tags:['Secure access','Clear status','Self-service']},
  operations: {label:'YOUR TEAM, IN SYNC',title:'Better tools for the work behind the scenes.',copy:'Bring approvals, tasks, and shared information into a focused internal workspace.',node:'Your team',tags:['Approval paths','Shared context','Role-based views']},
  commerce: {label:'YOUR BUSINESS, CONNECTED',title:'A platform for the whole transaction.',copy:'Connect catalogue, orders, and customer journeys with the systems that run your business.',node:'Buyer',tags:['Order workflows','API connections','Account journeys']}
 };
 root.querySelectorAll('[data-svc-option]').forEach(function (button) {
  button.addEventListener('click',function () {
   var state=portals[button.dataset.svcOption];
   if (!state) return;
   var showcase=button.closest('.svc-portal-showcase');
   showcase.querySelectorAll('[data-svc-option]').forEach(function (peer) {
    var active=peer===button;
    peer.classList.toggle('is-active',active);
    peer.setAttribute('aria-pressed',String(active));
   });
   ['label','title','copy','node'].forEach(function (key) {showcase.querySelector('[data-svc-'+key+']').textContent=state[key];});
   showcase.querySelectorAll('.svc-tags span').forEach(function (tag,index) {tag.textContent=state.tags[index];});
  });
 });
 var conversations={
  services:{question:'What services can you help with?',answer:'We can help you explore web apps, mobile experiences, and business systems. What are you planning?',source:'Example response · approved service information'},
  lead:{question:'I have a project idea. Where do I start?',answer:'Start with the problem you want to solve and the people who will use it. Our team can discuss your goals through the contact page.',source:'Example response · guided project inquiry'},
  handoff:{question:'Can I speak with your team?',answer:'Of course. Use the project inquiry page to reach the team. A person can help with scope, integration questions, and the next steps.',source:'Example response · human handoff'}
 };
 root.querySelectorAll('[data-chat-scenario]').forEach(function (button) {
  button.addEventListener('click',function () {
   var state=conversations[button.dataset.chatScenario];
   if (!state) return;
   var chat=button.closest('.svc-chat-window');
   chat.querySelectorAll('[data-chat-scenario]').forEach(function (peer) {
    var active=peer===button;
    peer.classList.toggle('is-active',active);
    peer.setAttribute('aria-pressed',String(active));
   });
   ['question','answer','source'].forEach(function (key) {chat.querySelector('[data-chat-'+key+']').textContent=state[key];});
  });
 });
})();
