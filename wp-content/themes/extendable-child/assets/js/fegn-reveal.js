/* FEG TechNova scroll-reveal: fade + rise page content once on entry.
 * JS-gated (no-JS visitors see everything), staggered per sibling group,
 * disabled entirely under prefers-reduced-motion or without
 * IntersectionObserver. Header/drawer/footer chrome is never animated. */
(function () {
	'use strict';

	document.documentElement.classList.add('fegn-js');

	function onReady(fn) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn, { once: true });
		} else {
			fn();
		}
	}

	onReady(init);

	function init() {
		var SELECTORS = [
			'.fegn-hero-badge',
			'.fegn-eyebrow',
			'.fegn-hero h1',
			'.fegn-services-title',
			'.fegn-sec-title',
			'.fegn-erp-title',
			'.fegn-ai-title',
			'.fegn-contact-title',
			'.fegn-company-title',
			'.fegn-wcu-title',
			'.fegn-section-title',
			'.fegn-lead',
			'.fegn-ai-lead',
			'.fegn-hero-actions',
			'.fegn-card',
			'.fegn-service-card',
			'.fegn-module-card',
			'.fegn-feature-card',
			'.fegn-glass-card',
			'.fegn-step',
			'.fegn-step-card',
			'.fegn-timeline-card',
			'.fegn-security-card',
			'.fegn-compare-card',
			'.fegn-promise-card',
			'.fegn-testimonial',
			'.fegn-contact-card',
			'.fegn-services-cta-title',
			'.fegn-sec-cta-title',
			'.fegn-erp-cta-title',
			'.fegn-ai-cta-title',
			'.fegn-company-cta-title',
			'.fegn-wcu-cta-title'
		].join(',');

		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		var els = Array.prototype.slice.call(document.querySelectorAll(SELECTORS)).filter(function (el) {
			/* Never animate chrome, dropdowns, or already-tagged nodes. */
			if (el.classList.contains('fegn-reveal')) { return false; }
			if (el.closest('.fegn-site-header, .fegn-mega-panel, .fegn-site-footer')) { return false; }
			return true;
		});

		if (!els.length) { return; }

		/* Stagger siblings sharing a parent (70ms steps, capped). */
		var counters = [];
		els.forEach(function (el) {
			var parent = el.parentElement;
			var slot = null;
			for (var i = 0; i < counters.length; i++) {
				if (counters[i].parent === parent) { slot = counters[i]; break; }
			}
			if (!slot) {
				slot = { parent: parent, step: 0 };
				counters.push(slot);
			}
			el.style.setProperty('--fegn-d', Math.min(slot.step * 70, 350) + 'ms');
			slot.step += 1;
			el.classList.add('fegn-reveal');
		});

		if (reduceMotion || !('IntersectionObserver' in window)) {
			els.forEach(function (el) { el.classList.add('is-in'); });
			return;
		}

		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

		els.forEach(function (el) { io.observe(el); });
	}
})();
