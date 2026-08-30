/* ============================================================
   FEG TechNova - Event Countdown Timer
   Counts down to Tech Conference 2027 (May 14, Barcelona).
   ============================================================ */

(function () {
  'use strict';

  var el = {
    d: document.getElementById('feg-cd-days'),
    h: document.getElementById('feg-cd-hours'),
    m: document.getElementById('feg-cd-mins'),
    s: document.getElementById('feg-cd-secs')
  };

  if (!el.d || !el.h || !el.m || !el.s) { return; }

  var target = new Date('2027-05-14T09:00:00');

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff < 0) { diff = 0; }

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    el.d.textContent = pad(d);
    el.h.textContent = pad(h);
    el.m.textContent = pad(m);
    el.s.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();