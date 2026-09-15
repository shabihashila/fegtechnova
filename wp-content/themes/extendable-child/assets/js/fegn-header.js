(function () {
	'use strict';

	function onReady(fn) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn, { once: true });
		} else {
			fn();
		}
	}

	onReady(init);

	function init() {
		/* -----------------------------------------------------------
		 * Mega dropdowns (About Us / Services / Website / Marketing)
		 * Desktop: hover + click floating card.
		 * Mobile (<=781px): smooth vertical accordion inside drawer.
		 * --------------------------------------------------------- */
		var megaEls = Array.prototype.slice.call(document.querySelectorAll('[data-fegn-mega]'));
		var desktopMq = window.matchMedia('(min-width: 782px)');
		var mobileMq = window.matchMedia('(max-width: 781px)');
		var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
		var HOVER_CLOSE_DELAY = 300;
		var closeTimer = null;

		function isMobile() {
			return mobileMq.matches;
		}

		function megaTrigger(root) {
			return root.querySelector('.fegn-mega-trigger');
		}
		function megaPanel(root) {
			return root.querySelector('.fegn-mega-panel');
		}
		function isOpen(root) {
			var t = megaTrigger(root);
			return t && t.getAttribute('aria-expanded') === 'true';
		}
		function focusables(root) {
			var panel = megaPanel(root);
			if (!panel) { return []; }
			return Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled])'));
		}

		/* Mobile accordion animation: animate via scrollHeight so long
		 * sub-menus (Marketing: 11 links) expand fully without clipping.
		 * Panels are position:static in normal flow, so expanding pushes
		 * lower items + CTA footer down instead of overlapping. */
		function setPanelHeight(root, open) {
			var panel = megaPanel(root);
			if (!panel) { return; }
			if (!isMobile()) {
				panel.style.maxHeight = '';
				panel.style.overflow = '';
				return;
			}
			/* Clip during the animation; released to visible on
			 * transitionend once fully open. */
			panel.style.overflow = 'hidden';
			if (open) {
				panel.style.maxHeight = 'none';
				var full = panel.scrollHeight;
				panel.style.maxHeight = '0px';
				/* Force reflow so the transition plays from 0 -> full. */
				void panel.offsetHeight; // eslint-disable-line no-unused-expressions
				panel.style.maxHeight = full + 'px';
			} else {
				/* Collapse from current height for a smooth close. */
				if (panel.style.maxHeight === 'none' || !panel.style.maxHeight) {
					panel.style.maxHeight = panel.scrollHeight + 'px';
					void panel.offsetHeight; // eslint-disable-line no-unused-expressions
				}
				panel.style.maxHeight = '0px';
			}
		}

		/* Re-measure an open panel after layout settles (fonts/images/
		 * rotation) so the drawer height stays correct dynamically. */
		function refreshPanelHeight(root) {
			if (!isMobile() || !isOpen(root)) { return; }
			var panel = megaPanel(root);
			if (!panel || panel.style.maxHeight === 'none') { return; }
			panel.style.maxHeight = panel.scrollHeight + 'px';
		}

		function scrollOpenIntoView(root) {
			if (!isMobile()) { return; }
			var list = drawerList();
			var head = root.querySelector('.fegn-mega-head');
			if (!list || !head) { return; }
			try {
				var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				var listRect = list.getBoundingClientRect();
				var headRect = head.getBoundingClientRect();
				if (headRect.top < listRect.top || headRect.bottom > listRect.bottom) {
					if (typeof head.scrollIntoView === 'function') {
						head.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
					} else {
						list.scrollTop += headRect.top - listRect.top - 8;
					}
				}
			} catch (err) { /* scroll assist is best-effort */ }
		}

		function drawerList() {
			var nav = document.getElementById('fegn-primary-nav');
			return nav ? nav.querySelector('.fegn-nav-list') : null;
		}

		function clearPanelHeight(root) {
			var panel = megaPanel(root);
			if (panel && !isMobile()) {
				panel.style.maxHeight = '';
				panel.style.overflow = '';
			}
		}

		function closeAllMega(except) {
			megaEls.forEach(function (root) {
				if (root === except) { return; }
				var t = megaTrigger(root);
				root.classList.remove('is-open');
				if (t) { t.setAttribute('aria-expanded', 'false'); }
				if (isMobile()) {
					var p = megaPanel(root);
					if (p) {
						p.style.maxHeight = '0px';
						p.style.overflow = 'hidden';
					}
				} else {
					clearPanelHeight(root);
				}
			});
		}

		function openMega(root) {
			window.clearTimeout(closeTimer);
			closeAllMega(root);
			root.classList.add('is-open');
			megaTrigger(root).setAttribute('aria-expanded', 'true');
			setPanelHeight(root, true);
			/* Dynamic height: re-measure next frame in case webfonts or
			 * images shift layout mid-transition. */
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(function () { refreshPanelHeight(root); });
			});
			/* Watchdog: if the max-height transition never runs to
			 * completion (frozen timers, odd webviews, tap-emulating
			 * environments), force the open panel visible so a tap can
			 * never leave it stuck at height 0. */
			window.setTimeout(function () {
				if (!isOpen(root) || !isMobile()) { return; }
				var p = megaPanel(root);
				if (p && p.getBoundingClientRect().height <= 1) {
					p.style.maxHeight = 'none';
					p.style.overflow = 'visible';
				}
			}, 450);
		}

		function closeMega(root, refocus) {
			root.classList.remove('is-open');
			var t = megaTrigger(root);
			if (t) {
				t.setAttribute('aria-expanded', 'false');
				if (refocus) { t.focus(); }
			}
			setPanelHeight(root, false);
			if (!isMobile()) {
				clearPanelHeight(root);
			}
		}

		megaEls.forEach(function (root) {
			var trigger = megaTrigger(root);
			var panel = megaPanel(root);
			if (!trigger || !panel) { return; }

			/* Start collapsed on mobile so the drawer opens clean. */
			if (isMobile()) {
				panel.style.maxHeight = '0px';
			}

			trigger.addEventListener('click', function (event) {
				event.stopPropagation();
				event.preventDefault();
				/* Rapid-tap guard: some emulators/webviews dispatch the
				 * same tap twice within milliseconds, which would toggle
				 * open->shut instantly and look like "nothing happens". */
				var now = Date.now();
				if (trigger._fegnLastTap && now - trigger._fegnLastTap < 350) { return; }
				trigger._fegnLastTap = now;
				if (isOpen(root)) {
					closeMega(root, false);
				} else {
					openMega(root);
				}
			});

			/* After the open transition, release to `none`/visible so later
			 * font loads never clip the last link; the static-flow panel
			 * keeps pushing lower items + CTA down. */
			panel.addEventListener('transitionend', function (event) {
				if (event.propertyName !== 'max-height') { return; }
				if (isMobile() && isOpen(root)) {
					panel.style.maxHeight = 'none';
					panel.style.overflow = 'visible';
					scrollOpenIntoView(root);
				}
			});

			root.addEventListener('keydown', function (event) {
				if (event.key === 'Escape' && isOpen(root)) {
					event.stopPropagation();
					closeMega(root, true);
					return;
				}
				if (event.key === 'ArrowDown' && (event.target === trigger || (event.target.classList && event.target.classList.contains('fegn-mega-link')))) {
					event.preventDefault();
					openMega(root);
					var first = focusables(root)[0];
					if (first) { first.focus(); }
					return;
				}
				if (event.key === 'Tab' && isOpen(root) && !isMobile()) {
					var items = focusables(root);
					var index = items.indexOf(document.activeElement);
					if (!event.shiftKey && (index === -1 || index === items.length - 1)) {
						closeMega(root, false);
					} else if (event.shiftKey && index === 0 && document.activeElement !== trigger) {
						closeMega(root, false);
						trigger.focus();
						event.preventDefault();
					}
				}
			});

			root.addEventListener('mouseenter', function () {
				if (desktopMq.matches && hoverMq.matches) { openMega(root); }
			});
			root.addEventListener('mouseleave', function () {
				if (desktopMq.matches && hoverMq.matches && isOpen(root)) {
					closeTimer = window.setTimeout(function () { closeMega(root, false); }, HOVER_CLOSE_DELAY);
				}
			});
			root.addEventListener('focusin', function () {
				window.clearTimeout(closeTimer);
			});
		});

		document.addEventListener('click', function (event) {
			megaEls.forEach(function (root) {
				if (isOpen(root) && !root.contains(event.target)) { closeMega(root, false); }
			});
		});

		function syncPanelsOnViewportChange() {
			if (isMobile()) {
				/* Entering mobile: collapse everything, clear desktop floats. */
				megaEls.forEach(function (root) {
					root.classList.remove('is-open');
					var t = megaTrigger(root);
					if (t) { t.setAttribute('aria-expanded', 'false'); }
					var p = megaPanel(root);
					if (p) { p.style.maxHeight = '0px'; }
				});
			} else {
				/* Entering desktop: release inline accordion heights. */
				megaEls.forEach(function (root) {
					root.classList.remove('is-open');
					var t = megaTrigger(root);
					if (t) { t.setAttribute('aria-expanded', 'false'); }
					clearPanelHeight(root);
				});
			}
		}

		function bindMq(mq, handler) {
			if (typeof mq.addEventListener === 'function') {
				mq.addEventListener('change', handler);
			} else if (typeof mq.addListener === 'function') {
				mq.addListener(handler);
			}
		}
		bindMq(desktopMq, syncPanelsOnViewportChange);
		bindMq(mobileMq, syncPanelsOnViewportChange);

		/* Keep open accordion heights correct on rotation / resize / font load. */
		var resizeTimer = null;
		function refreshAllOpenPanels() {
			if (!isMobile()) { return; }
			megaEls.forEach(function (root) { refreshPanelHeight(root); });
		}
		window.addEventListener('resize', function () {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(refreshAllOpenPanels, 150);
		});
		window.addEventListener('load', refreshAllOpenPanels);
		if (document.fonts && typeof document.fonts.ready.then === 'function') {
			document.fonts.ready.then(refreshAllOpenPanels);
		}

		/* -----------------------------------------------------------
		 * Mobile drawer toggle + scrim + in-drawer close button
		 * --------------------------------------------------------- */
		var header = document.querySelector('.fegn-site-header');
		var toggle = document.querySelector('.fegn-nav-toggle');
		var drawer = document.getElementById('fegn-primary-nav');

		if (header && toggle && drawer) {
			var scrim = document.querySelector('.fegn-nav-scrim');
			if (!scrim) {
				scrim = document.createElement('div');
				scrim.className = 'fegn-nav-scrim';
				scrim.setAttribute('hidden', '');
				document.body.appendChild(scrim);
			}
			var closeBtn = drawer.querySelector('[data-fegn-close], .fegn-drawer-close');

			function lockScroll(lock) {
				document.body.style.overflow = lock ? 'hidden' : '';
				document.documentElement.style.overflow = lock ? 'hidden' : '';
			}

			function openDrawer() {
				window.clearTimeout(closeTimer);
				/* Fresh accordion state every time the drawer opens. */
				closeAllMega(null);
				drawer.classList.add('is-open');
				header.classList.add('is-drawer-open');
				drawer.setAttribute('aria-hidden', 'false');
				toggle.setAttribute('aria-expanded', 'true');
				toggle.setAttribute('aria-label', 'Close navigation menu');
				scrim.setAttribute('aria-hidden', 'true');
				scrim.classList.add('is-visible');
				scrim.removeAttribute('hidden');
				lockScroll(true);
				/* Scrollable body is .fegn-nav-list on mobile (drawer shell
				 * is overflow:hidden with fixed header/footer). */
				var list = drawer.querySelector('.fegn-nav-list');
				if (list) { list.scrollTop = 0; }
				drawer.scrollTop = 0;
				var target = closeBtn || drawer.querySelector('a, button');
				if (target) { target.focus({ preventScroll: true }); }
			}

			function closeDrawer(refocusToggle) {
				if (!drawer.classList.contains('is-open')) { return; }
				drawer.classList.remove('is-open');
				header.classList.remove('is-drawer-open');
				drawer.setAttribute('aria-hidden', 'true');
				toggle.setAttribute('aria-expanded', 'false');
				toggle.setAttribute('aria-label', 'Open navigation menu');
				scrim.classList.remove('is-visible');
				scrim.setAttribute('hidden', '');
				lockScroll(false);
				/* Collapse accordions so next open starts clean. */
				closeAllMega(null);
				if (refocusToggle) { toggle.focus(); }
			}

			function isDrawerOpen() {
				return drawer.classList.contains('is-open');
			}

			/* Initial a11y state: hidden from AT until opened on mobile. */
			if (isMobile()) {
				drawer.setAttribute('aria-hidden', 'true');
			} else {
				drawer.removeAttribute('aria-hidden');
			}

			toggle.addEventListener('click', function (event) {
				event.stopPropagation();
				if (isDrawerOpen()) { closeDrawer(true); } else { openDrawer(); }
			});

			if (closeBtn) {
				closeBtn.addEventListener('click', function (event) {
					event.stopPropagation();
					closeDrawer(true);
				});
			}

			scrim.addEventListener('click', function () { closeDrawer(false); });

			/* Any real navigation link inside the drawer closes it.
			 * Chevron triggers are <button>, so accordions stay open. */
			drawer.addEventListener('click', function (event) {
				var link = event.target.closest ? event.target.closest('a[href]') : null;
				if (link && drawer.contains(link)) {
					closeDrawer(false);
				}
			});

			document.addEventListener('keydown', function (event) {
				if (event.key !== 'Escape' || !isDrawerOpen()) { return; }
				/* Let an open accordion consume the first Escape. */
				var openMegaEl = null;
				megaEls.forEach(function (root) {
					if (isOpen(root)) { openMegaEl = root; }
				});
				if (openMegaEl) {
					closeMega(openMegaEl, true);
					event.stopPropagation();
					return;
				}
				closeDrawer(true);
			});

			window.addEventListener('resize', function () {
				if (window.innerWidth >= 782 && isDrawerOpen()) {
					closeDrawer(false);
				}
				if (window.innerWidth >= 782) {
					drawer.removeAttribute('aria-hidden');
				} else if (!isDrawerOpen()) {
					drawer.setAttribute('aria-hidden', 'true');
				}
			});
		}
	}
})();
