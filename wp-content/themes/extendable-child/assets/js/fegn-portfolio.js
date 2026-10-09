/* Tiny, local concept switchers. No network requests or fabricated metrics. */
(function(){'use strict';
 function ready(){
  var root=document.querySelector('.ft-page');if(!root)return;
  root.querySelectorAll('.ft-interactive').forEach(function(group){
   var buttons=group.querySelectorAll('[data-ft-choice]');
   buttons.forEach(function(button){button.addEventListener('click',function(){
    buttons.forEach(function(other){other.setAttribute('aria-pressed',String(other===button));});
    group.querySelectorAll('[data-ft-panel]').forEach(function(panel){panel.hidden=panel.dataset.ftPanel!==button.dataset.ftChoice;});
   });});
  });
  var select=root.querySelector('#fegn-service');
  if(select){
   var requested=new URLSearchParams(location.search).get('service');
   if(Array.from(select.options).some(function(option){return option.value===requested;}))select.value=requested;
   root.querySelectorAll('[data-ft-service]').forEach(function(button){button.addEventListener('click',function(){select.value=button.dataset.ftService;select.dispatchEvent(new Event('change',{bubbles:true}));select.focus({preventScroll:true});select.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
