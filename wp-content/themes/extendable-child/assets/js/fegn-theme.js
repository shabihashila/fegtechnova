/* FEG TechNova visitor theme switch (light / dark).
 * - Initial theme resolves: saved choice > OS preference > light.
 * - A tiny head guard (see functions.php) sets data-theme pre-paint;
 *   this script wires the toggles, persists, and keeps them in sync.
 * - Respects reduced motion via CSS (no animation), never force-toggles. */
(function () {
	'use strict';

	var STORAGE_KEY = 'fegn-theme';
	var root = document.documentElement;

	function systemPrefersDark() {
		return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	function currentTheme() {
		return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
	}

	function paintToggle(btn, theme) {
		var dark = theme === 'dark';
		btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
		btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
	}

	function syncToggles() {
		var theme = currentTheme();
		Array.prototype.forEach.call(
			document.querySelectorAll('[data-fegn-theme-toggle]'),
			function (btn) { paintToggle(btn, theme); }
		);
		var meta = document.querySelector('meta[name="theme-color"]');
		if (meta) {
			meta.setAttribute('content', theme === 'dark' ? '#0B1220' : '#FFFFFF');
		}
	}

	function applyTheme(theme, persist) {
		root.setAttribute('data-theme', theme);
		try {
			if (persist) {
				window.localStorage.setItem(STORAGE_KEY, theme);
			}
		} catch (err) { /* private mode: theme simply won't persist */ }
		syncToggles();
	}

	function init() {
		/* Guard ran earlier; ensure attribute + toggles agree. */
		if (!root.getAttribute('data-theme')) {
			applyTheme(systemPrefersDark() ? 'dark' : 'light', false);
		} else {
			syncToggles();
		}

		Array.prototype.forEach.call(
			document.querySelectorAll('[data-fegn-theme-toggle]'),
			function (btn) {
				btn.addEventListener('click', function (event) {
					event.stopPropagation();
					applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
				});
			}
		);

		/* Follow OS changes only while the visitor never chose manually. */
		if (window.matchMedia) {
			var mq = window.matchMedia('(prefers-color-scheme: dark)');
			var onChange = function (event) {
				var saved = null;
				try {
					saved = window.localStorage.getItem(STORAGE_KEY);
				} catch (err) { /* ignore */ }
				if (!saved) {
					applyTheme(event.matches ? 'dark' : 'light', false);
				}
			};
			if (typeof mq.addEventListener === 'function') {
				mq.addEventListener('change', onChange);
			} else if (typeof mq.addListener === 'function') {
				mq.addListener(onChange);
			}
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();
