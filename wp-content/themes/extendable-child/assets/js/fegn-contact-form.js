(function () {
	'use strict';

	function onReady(fn) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn, { once: true });
		} else {
			fn();
		}
	}

	onReady(function () {
		var form = document.getElementById('fegn-contact-form');
		if (!form) { return; }

		var status = document.getElementById('fegn-form-status');
		var submitBtn = document.getElementById('fegn-form-submit-btn');
		var defaultLabel = submitBtn ? submitBtn.textContent : '';

		function showStatus(type, text) {
			if (!status) { return; }
			status.hidden = false;
			status.textContent = text;
			status.classList.remove('is-success', 'is-error', 'is-info');
			status.classList.add(type === 'success' ? 'is-success' : type === 'error' ? 'is-error' : 'is-info');
		}

		function setBusy(busy) {
			if (!submitBtn) { return; }
			submitBtn.disabled = busy;
			submitBtn.textContent = busy ? 'Sending...' : defaultLabel;
			submitBtn.setAttribute('aria-busy', busy ? 'true' : 'false');
		}

		function field(name) {
			var el = form.querySelector('[name="' + name + '"]');
			return el ? el.value.trim() : '';
		}

		form.addEventListener('submit', function (event) {
			event.preventDefault();

			var fullName = field('full_name');
			var email = field('email');
			var phone = field('phone');
			var service = field('service');
			var message = field('message');

			if (!fullName) {
				showStatus('error', 'Please enter your full name.');
				form.querySelector('#fegn-name').focus();
				return;
			}
			if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				showStatus('error', 'Please enter a valid email address.');
				form.querySelector('#fegn-email').focus();
				return;
			}
			if (!phone) {
				showStatus('error', 'Please enter your phone number.');
				form.querySelector('#fegn-phone').focus();
				return;
			}
			if (!service) {
				showStatus('error', 'Please select a service you are interested in.');
				form.querySelector('#fegn-service').focus();
				return;
			}
			if (!message) {
				showStatus('error', 'Please tell us a few details about your project.');
				form.querySelector('#fegn-message').focus();
				return;
			}

			if (typeof FegnContactForm === 'undefined' || !FegnContactForm.ajaxUrl) {
				showStatus('error', 'The form is not ready yet. Please reload the page and try again.');
				return;
			}

			setBusy(true);
			showStatus('info', 'Sending...');

			var data = new URLSearchParams();
			data.append('action', FegnContactForm.action || 'fegn_submit_inquiry');
			data.append('nonce', FegnContactForm.nonce || '');
			['full_name', 'email', 'phone', 'company', 'service', 'message', 'fegn_company_website'].forEach(function (name) {
				var el = form.querySelector('[name="' + name + '"]');
				data.append(name, el ? el.value : '');
			});

			fetch(FegnContactForm.ajaxUrl, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body: data.toString()
			}).then(function (response) {
				return response.json().catch(function () { return null; }).then(function (json) {
					return { ok: response.ok, json: json };
				});
			}).then(function (result) {
				var json = result.json;
				if (json && typeof json.success !== 'undefined') {
					if (json.success) {
						showStatus('success', (json.data && json.data.message) || 'Thank you! Your inquiry has been received.');
						form.reset();
					} else {
						showStatus('error', (json.data && json.data.message) || 'Something went wrong. Please try again.');
					}
				} else if (result.ok) {
					showStatus('success', 'Thank you! Your inquiry has been received.');
					form.reset();
				} else {
					showStatus('error', 'Something went wrong. Please try again or email us directly at info@fegtechnova.com.');
				}
			}).catch(function () {
				showStatus('error', 'Network error. Please check your connection and try again.');
			}).finally(function () {
				setBusy(false);
			});
		});
	});
})();
