<?php
/**
 * Plugin Name: FEG TechNova Local Performance
 * Description: Avoid unused TranslatePress gettext queries on the single-language localhost site.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Use TranslatePress's supported setting without changing stored options. */
function fegn_local_gettext_settings( $options ) {
	if ( PHP_SAPI === 'cli' || is_admin() || wp_doing_ajax() || wp_doing_cron() || isset( $_GET['trp-edit-translation'] ) ) {
		return $options;
	}

	$host = wp_parse_url( get_option( 'home' ), PHP_URL_HOST );
	if ( ! in_array( $host, array( 'localhost', '127.0.0.1', '::1', '[::1]' ), true ) ) {
		return $options;
	}

	$settings = get_option( 'trp_settings', array() );
	$languages = $settings['translation-languages'] ?? array();
	if ( count( $languages ) !== 1 || reset( $languages ) !== ( $settings['default-language'] ?? '' ) ) {
		return $options;
	}

	$options = is_array( $options ) ? $options : array();
	$options['disable_translation_for_gettext_strings'] = 'yes';
	return $options;
}
add_filter( 'option_trp_advanced_settings', 'fegn_local_gettext_settings' );
add_filter( 'default_option_trp_advanced_settings', 'fegn_local_gettext_settings' );
