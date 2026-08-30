/* ============================================================
   FEG TechNova - 3D Globe (hero canvas)
   Pure canvas wireframe globe: rotating meridians, parallels,
   glowing city nodes and drag-to-rotate interaction.
   ============================================================ */

(function () {
  'use strict';

  var canvas = document.getElementById('feg-globe');
  if (!canvas || !canvas.getContext) { return; }
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0, R = 150;
  var rotY = 0, rotX = 0.35;
  var auto = true, drag = false, px = 0;

  function size() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    W = rect.width;
    H = rect.height;
    R = Math.min(W, H) * 0.36;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener('resize', size);

  function latLonToVec(lat, lon) {
    var phi = (90 - lat) * Math.PI / 180;
    var th = lon * Math.PI / 180;
    return [Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)];
  }

  function rotate(v) {
    var x = v[0] * Math.cos(rotY) + v[2] * Math.sin(rotY);
    var z = -v[0] * Math.sin(rotY) + v[2] * Math.cos(rotY);
    var y = v[1] * Math.cos(rotX) - z * Math.sin(rotX);
    var z2 = v[1] * Math.sin(rotX) + z * Math.cos(rotX);
    return [x, y, z2];
  }

  function project(v) {
    return [W / 2 + v[0] * R, H / 2 - v[1] * R, v[2]];
  }

  function drawLine(a, b, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }

  var cities = [];
  [
    [40.7, -74.0], [51.5, -0.1], [48.8, 2.35], [35.68, 139.65],
    [-33.8, 151.2], [28.6, 77.2], [1.35, 103.8], [-23.55, -46.6],
    [52.52, 13.4], [31.2, 121.5], [19.0, 72.8], [30.0, 31.2],
    [-1.29, 36.8], [55.75, 37.6], [41.9, 12.5], [43.7, -79.4]
  ].forEach(function (c) {
    cities.push(latLonToVec(c[0], c[1]));
  });

  function frame() {
    requestAnimationFrame(frame);
    if (auto && !drag) { rotY += 0.003; }
    ctx.clearRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2;

    // Ambient glow behind the sphere
    var glow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.2);
    glow.addColorStop(0, 'rgba(0, 210, 255, 0.10)');
    glow.addColorStop(1, 'rgba(0, 70, 184, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Sphere body
    var body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.2, cx, cy, R);
    body.addColorStop(0, 'rgba(30, 58, 95, 0.95)');
    body.addColorStop(0.6, 'rgba(10, 25, 47, 0.98)');
    body.addColorStop(1, 'rgba(6, 13, 26, 1)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    function visible(a, b) {
      return a[2] > -0.02 && b[2] > -0.02;
    }

    // Meridians (longitude lines)
    for (var m = 0; m < 12; m++) {
      var lon = m * 15;
      var pts = [];
      for (var a = -90; a <= 90; a += 6) {
        pts.push(project(rotate(latLonToVec(a, lon))));
      }
      for (var i = 1; i < pts.length; i++) {
        if (visible(pts[i - 1], pts[i])) {
          drawLine(pts[i - 1], pts[i], 'rgba(0, 210, 255, 0.20)', 1);
        }
      }
    }

    // Parallels (latitude lines)
    for (var la = -60; la <= 60; la += 30) {
      var pts2 = [];
      for (var a2 = 0; a2 <= 360; a2 += 6) {
        pts2.push(project(rotate(latLonToVec(la, a2))));
      }
      for (var j = 1; j < pts2.length; j++) {
        if (visible(pts2[j - 1], pts2[j])) {
          drawLine(pts2[j - 1], pts2[j], 'rgba(0, 210, 255, 0.16)', 1);
        }
      }
    }

    // Equator highlight
    var eq = [];
    for (var a3 = 0; a3 <= 360; a3 += 4) {
      eq.push(project(rotate(latLonToVec(0, a3))));
    }
    for (var k = 1; k < eq.length; k++) {
      if (visible(eq[k - 1], eq[k])) {
        drawLine(eq[k - 1], eq[k], 'rgba(0, 229, 255, 0.4)', 1.2);
      }
    }

    // City nodes (front hemisphere only)
    cities.forEach(function (c) {
      var v = rotate(c);
      if (v[2] < -0.02) { return; }
      var p = project(v);
      var a = Math.max(0, 1 - (v[2] + 1) * 0.55);

      var dot = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 8);
      dot.addColorStop(0, 'rgba(0, 229, 255, ' + (0.25 + a * 0.5) + ')');
      dot.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.beginPath();
      ctx.arc(p[0], p[1], 8, 0, Math.PI * 2);
      ctx.fillStyle = dot;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, ' + (0.35 + a * 0.65) + ')';
      ctx.fill();
    });

    // Rim
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  frame();

  // Drag to rotate
  canvas.addEventListener('mousedown', function (e) { drag = true; px = e.clientX; });
  window.addEventListener('mouseup', function () { drag = false; });
  window.addEventListener('mousemove', function (e) {
    if (!drag) { return; }
    var dx = e.clientX - px;
    px = e.clientX;
    rotY += dx * 0.005;
  });
  canvas.addEventListener('touchstart', function (e) { drag = true; px = e.touches[0].clientX; });
  canvas.addEventListener('touchmove', function (e) {
    if (!drag) { return; }
    var dx = e.touches[0].clientX - px;
    px = e.touches[0].clientX;
    rotY += dx * 0.005;
  });
})();