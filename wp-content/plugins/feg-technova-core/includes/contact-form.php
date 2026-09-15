<?php
/**
 * Project inquiry contact form backend.
 *
 * Handles AJAX submissions from the "Send a Project Inquiry" form on the
 * Contact page template: nonce validation, sanitization, and an HTML
 * notification email via wp_mail().
 *
 * @package feg-technova-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const FEGNT_INQUIRY_ACTION   = 'fegn_submit_inquiry';
const FEGNT_INQUIRY_NONCE    = 'fegn_contact_inquiry';
const FEGNT_INQUIRY_RECIPIENT = 'info@fegtechnova.com';

/**
 * Allowed "Service Interested In" values (keys) with human labels.
 *
 * @return array<string,string>
 */
function fegnt_inquiry_services() {
	return array(
		'erp'       => __( 'ERP Development', 'feg-technova-core' ),
		'saas'      => __( 'SaaS Development', 'feg-technova-core' ),
		'web'       => __( 'Web Application Development', 'feg-technova-core' ),
		'website'   => __( 'Website Design & Development', 'feg-technova-core' ),
		'mobile'    => __( 'Mobile App Development', 'feg-technova-core' ),
		'crm'       => __( 'CRM', 'feg-technova-core' ),
		'uiux'      => __( 'UI/UX Design', 'feg-technova-core' ),
		'ai'        => __( 'AI Automation', 'feg-technova-core' ),
		'chatbot'   => __( 'AI Chatbot', 'feg-technova-core' ),
		'marketing' => __( 'Digital Marketing', 'feg-technova-core' ),
		'other'     => __( 'Other', 'feg-technova-core' ),
	);
}

/**
 * Detect a local development environment (localhost / 127.0.0.1 / ::1).
 *
 * Used to bypass strict wp_mail() delivery on machines without SMTP so the
 * form UI can be tested end-to-end. Production (fegtechnova.com) always
 * sends the real notification email.
 *
 * @return bool
 */
function fegnt_is_local_environment() {
	if ( function_exists( 'wp_get_environment_type' ) && 'local' === wp_get_environment_type() ) {
		return true;
	}
	if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'local' === WP_ENVIRONMENT_TYPE ) {
		return true;
	}
	if ( isset( $_SERVER['HTTP_HOST'] ) ) {
		$host = strtolower( (string) wp_unslash( $_SERVER['HTTP_HOST'] ) );
		$host = preg_replace( '/:\d+$/', '', $host );
		if ( in_array( $host, array( 'localhost', '127.0.0.1', '::1' ), true ) ) {
			return true;
		}
		if ( 'localhost' === substr( $host, -9 ) ) {
			return true;
		}
		/* LAN / dev hosts (phone-over-WiFi testing via 192.168.x.x, Docker,
		 * .local/.test domains): no public mail routing, treat as local. */
		if ( preg_match( '/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/', $host ) ) {
			return true;
		}
		if ( preg_match( '/\.(local|test|example|invalid)$/', $host ) ) {
			return true;
		}
	}
	return false;
}

/**
 * Handle the inquiry submission for guests and logged-in users.
 */
function fegnt_handle_inquiry_submission() {
	check_ajax_referer( FEGNT_INQUIRY_NONCE, 'nonce' );

	// Honeypot: silently accept spam so bots learn nothing.
	if ( ! empty( $_POST['fegn_company_website'] ) ) {
		wp_send_json_success(
			array( 'message' => __( 'Thank you! Your inquiry has been received.', 'feg-technova-core' ) )
		);
	}

	$full_name = isset( $_POST['full_name'] ) ? sanitize_text_field( wp_unslash( $_POST['full_name'] ) ) : '';
	$email     = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$phone     = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
	$company   = isset( $_POST['company'] ) ? sanitize_text_field( wp_unslash( $_POST['company'] ) ) : '';
	$service   = isset( $_POST['service'] ) ? sanitize_key( wp_unslash( $_POST['service'] ) ) : '';
	$message   = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';

	$services = fegnt_inquiry_services();

	if ( '' === $full_name ) {
		wp_send_json_error(
			array( 'message' => __( 'Please enter your full name.', 'feg-technova-core' ) ),
			422
		);
	}
	if ( '' === $email || ! is_email( $email ) ) {
		wp_send_json_error(
			array( 'message' => __( 'Please enter a valid email address.', 'feg-technova-core' ) ),
			422
		);
	}
	if ( '' === $phone ) {
		wp_send_json_error(
			array( 'message' => __( 'Please enter your phone number.', 'feg-technova-core' ) ),
			422
		);
	}
	if ( '' === $service || ! isset( $services[ $service ] ) ) {
		wp_send_json_error(
			array( 'message' => __( 'Please select a service you are interested in.', 'feg-technova-core' ) ),
			422
		);
	}
	if ( '' === $message ) {
		wp_send_json_error(
			array( 'message' => __( 'Please tell us a few details about your project.', 'feg-technova-core' ) ),
			422
		);
	}

	$recipient = apply_filters( 'fegnt_inquiry_recipient', FEGNT_INQUIRY_RECIPIENT );
	/* translators: %s: client full name */
	$subject = sprintf( __( 'New Project Inquiry from %s', 'feg-technova-core' ), $full_name );

	$rows = array(
		__( 'Full Name', 'feg-technova-core' )             => $full_name,
		__( 'Email Address', 'feg-technova-core' )         => $email,
		__( 'Phone Number', 'feg-technova-core' )          => $phone,
		__( 'Company Name', 'feg-technova-core' )          => '' !== $company ? $company : __( '—', 'feg-technova-core' ),
		__( 'Service Interested In', 'feg-technova-core' ) => $services[ $service ],
	);

	$body  = '<html><body>';
	$body .= '<h2>' . esc_html__( 'New Project Inquiry', 'feg-technova-core' ) . '</h2>';
	$body .= '<table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">';
	foreach ( $rows as $label => $value ) {
		$body .= '<tr><th align="left" style="background:#f1f5f9;">' . esc_html( $label ) . '</th><td>' . esc_html( $value ) . '</td></tr>';
	}
	$body .= '</table>';
	$body .= '<h3>' . esc_html__( 'Project Details', 'feg-technova-core' ) . '</h3>';
	$body .= '<p>' . nl2br( esc_html( $message ) ) . '</p>';
	$body .= '</body></html>';

	$headers = array(
		'Content-Type: text/html; charset=UTF-8',
		'Reply-To: ' . $full_name . ' <' . $email . '>',
	);

	// Localhost: no SMTP available — skip strict wp_mail() delivery checks
	// (prevents timeouts/errors) and return clean success for UI testing.
	// The submission is logged when debugging is enabled.
	if ( fegnt_is_local_environment() ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log(
				sprintf(
					'[fegnt inquiry:localhost-bypass] %s <%s> (%s) — %s: %s',
					$full_name,
					$email,
					$phone,
					$services[ $service ],
					$message
				)
			);
		}
		wp_send_json_success(
			array( 'message' => __( 'Thank you! Your inquiry has been received.', 'feg-technova-core' ) )
		);
	}

	// Production (fegtechnova.com): deliver the HTML notification email.
	$sent = wp_mail( $recipient, $subject, $body, $headers );

	if ( ! $sent ) {
		wp_send_json_error(
			array( 'message' => __( 'Something went wrong while sending your inquiry. Please try again or email us directly at info@fegtechnova.com.', 'feg-technova-core' ) ),
			500
		);
	}

	wp_send_json_success(
		array( 'message' => __( 'Thank you! Your inquiry has been received.', 'feg-technova-core' ) )
	);
}
add_action( 'wp_ajax_' . FEGNT_INQUIRY_ACTION, 'fegnt_handle_inquiry_submission' );
add_action( 'wp_ajax_nopriv_' . FEGNT_INQUIRY_ACTION, 'fegnt_handle_inquiry_submission' );
