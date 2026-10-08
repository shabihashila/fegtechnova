/* ERP-only interactions. Native links and workflow disclosures need no JS. */
(function () {
	'use strict';
	var page = document.querySelector('.fegn-erp-page');
	if (!page) { return; }
	var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var connections = {
		accounting: 'Invoices → approved entries → ledger.',
		commerce: 'Online order → stock check → fulfilment.',
		customer: 'Customer enquiry → quote → sales order.',
		tools: 'Business records → shared data → reporting.'
	};
	var map = page.querySelector('.erp-connection-map');
	var detail = page.querySelector('.erp-map-detail');
	if (map && detail) {
		// Upgrade static diagram nodes to native buttons only when JS is available.
		map.querySelectorAll('[data-erp-connection]').forEach(function (node) {
			var button = document.createElement('button');
			button.type = 'button';
			button.className = node.className;
			button.dataset.erpConnection = node.dataset.erpConnection;
			button.innerHTML = node.innerHTML;
			button.setAttribute('aria-pressed', 'false');
			button.setAttribute('aria-controls', 'erp-connection-detail');
			button.addEventListener('click', function () {
				map.querySelectorAll('button').forEach(function (item) {
					item.setAttribute('aria-pressed', String(item === button));
				});
				detail.textContent = connections[button.dataset.erpConnection];
			});
			node.replaceWith(button);
		});
		detail.id = 'erp-connection-detail';
	}
	if (motion.matches || !('IntersectionObserver' in window)) { return; }
	var observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.remove('erp-reveal-pending');
				entry.target.classList.add('erp-in-view');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.08 });
	var elements = page.querySelectorAll('[data-erp-reveal], .erp-dashboard-figure');
	elements.forEach(function (element) {
		if (element.getBoundingClientRect().top < window.innerHeight) {
			element.classList.add('erp-in-view');
			return;
		}
		element.classList.add('erp-reveal-pending');
		observer.observe(element);
	});
	// Honour a motion preference changed while the page is open.
	function releaseMotion(event) {
		if (!event.matches) { return; }
		observer.disconnect();
		elements.forEach(function (element) { element.classList.remove('erp-reveal-pending'); });
	}
	if (motion.addEventListener) { motion.addEventListener('change', releaseMotion); }
})();
