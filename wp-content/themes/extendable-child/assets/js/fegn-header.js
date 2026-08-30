(function () {
	'use strict';

	/* ---------------------------------------------------------------
	 * Mega dropdowns (Services / Website / Products / Marketing)
	 * ------------------------------------------------------------- */
	var megaEls = Array.prototype.slice.call(document.querySelectorAll('[data-fegn-mega]'));
	var desktopMq = window.matchMedia('(min-width: 782px)');
	var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
	var HOVER_CLOSE_DELAY = 180;
	var closeTimer = null;

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
		return Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled])'));
	}
	function closeAllMega(except) {
		megaEls.forEach(function (root) {
			if (root === except) { return; }
			var t = megaTrigger(root);
			root.classList.remove('is-open');
			if (t) { t.setAttribute('aria-expanded', 'false'); }
		});
	}
	function openMega(root) {
		window.clearTimeout(closeTimer);
		closeAllMega(root);
		root.classList.add('is-open');
		megaTrigger(root).setAttribute('aria-expanded', 'true');
	}
	function closeMega(root, refocus) {
		root.classList.remove('is-open');
		var t = megaTrigger(root);
		t.setAttribute('aria-expanded', 'false');
		if (refocus) { t.focus(); }
	}

	megaEls.forEach(function (root) {
		var trigger = megaTrigger(root);
		var panel = megaPanel(root);
		if (!trigger || !panel) { return; }

		trigger.addEventListener('click', function (event) {
			event.stopPropagation();
			if (isOpen(root)) { closeMega(root, false); } else { openMega(root); }
		});

		root.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && isOpen(root)) {
				event.stopPropagation();
				closeMega(root, true);
				return;
			}
			if (event.target === trigger && event.key === 'ArrowDown') {
				event.preventDefault();
				openMega(root);
				var first = focusables(root)[0];
				if (first) { first.focus(); }
				return;
			}
			if (event.key === 'Tab' && isOpen(root)) {
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

	function onViewportChange() {
		if (!desktopMq.matches) {
			megaEls.forEach(function (root) { closeMega(root, false); });
		}
	}
	if (typeof desktopMq.addEventListener === 'function') {
		desktopMq.addEventListener('change', onViewportChange);
	} else if (typeof desktopMq.addListener === 'function') {
		desktopMq.addListener(onViewportChange);
	}

	/* ---------------------------------------------------------------
	 * Mobile drawer toggle + scrim
	 * ------------------------------------------------------------- */
	var header = document.querySelector('.fegn-site-header');
	var toggle = document.querySelector('.fegn-nav-toggle');
	var drawer = document.getElementById('fegn-primary-nav');

	if (header && toggle && drawer) {
		var scrim = document.createElement('div');
		scrim.className = 'fegn-nav-scrim';
		scrim.setAttribute('hidden', '');
		document.body.appendChild(scrim);

		function openDrawer() {
			window.clearTimeout(closeTimer);
			drawer.classList.add('is-open');
			header.classList.add('is-drawer-open');
			toggle.setAttribute('aria-expanded', 'true');
			toggle.setAttribute('aria-label', 'Close navigation menu');
			scrim.setAttribute('aria-hidden', 'true');
			scrim.classList.add('is-visible');
			scrim.removeAttribute('hidden');
			document.body.style.overflow = 'hidden';
			var firstLink = drawer.querySelector('a, button');
			if (firstLink) { firstLink.focus(); }
		}
		function closeDrawer(refocusToggle) {
			drawer.classList.remove('is-open');
			header.classList.remove('is-drawer-open');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.setAttribute('aria-label', 'Open navigation menu');
			scrim.classList.remove('is-visible');
			scrim.setAttribute('hidden', '');
			document.body.style.overflow = '';
			if (refocusToggle) { toggle.focus(); }
		}

		toggle.addEventListener('click', function (event) {
			event.stopPropagation();
			if (drawer.classList.contains('is-open')) { closeDrawer(true); } else { openDrawer(); }
		});

		scrim.addEventListener('click', function () { closeDrawer(false); });

		drawer.addEventListener('click', function (event) {
			if (event.target.closest('a')) {
				closeDrawer(false);
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
				closeDrawer(true);
			}
		});

		window.addEventListener('resize', function () {
			if (window.innerWidth >= 782 && drawer.classList.contains('is-open')) {
				closeDrawer(false);
			}
		});
	}
})();
