<?php
/**
 * FEG TechNova Redesign child theme functions.
 *
 * Loads the child stylesheet, retires the superseded Sessions 1–7
 * "dark neon" assets that still ship inside the parent theme directory,
 * and keeps vendor files untouched.
 *
 * @package fegn
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'FEGN_VERSION', '0.1.0' );

/**
 * Enqueue the child design-system stylesheet.
 */
function fegn_enqueue_assets() {
	$css_path = get_stylesheet_directory() . '/assets/css/fegn.css';

	wp_enqueue_style(
		'fegn-style',
		get_stylesheet_directory_uri() . '/assets/css/fegn.css',
		array(),
		file_exists( $css_path ) ? (string) filemtime( $css_path ) : FEGN_VERSION
	);
}
add_action( 'wp_enqueue_scripts', 'fegn_enqueue_assets', 5 );

/**
 * Header behavior script: Services mega menu keyboard/touch interactions.
 */
function fegn_enqueue_header_script() {
	$js_path = get_stylesheet_directory() . '/assets/js/fegn-header.js';

	wp_enqueue_script(
		'fegn-header',
		get_stylesheet_directory_uri() . '/assets/js/fegn-header.js',
		array(),
		file_exists( $js_path ) ? (string) filemtime( $js_path ) : FEGN_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'fegn_enqueue_header_script' );

/**
 * Retire the superseded dark-neon assets enqueued by the parent theme
 * (see extendable/functions.php feg_enqueue_redesign_assets).
 * Runs at priority 20, after the parent enqueues at 10.
 */
function fegn_retire_legacy_assets() {
	foreach ( array( 'feg-custom-style', 'feg-globe', 'feg-countdown', 'feg-interactions' ) as $handle ) {
		wp_dequeue_style( $handle );
		wp_deregister_style( $handle );
		wp_dequeue_script( $handle );
		wp_deregister_script( $handle );
	}
}
add_action( 'wp_enqueue_scripts', 'fegn_retire_legacy_assets', 20 );

/**
 * Remove the legacy redesign body class added by the parent theme.
 */
function fegn_remove_legacy_body_class( $classes ) {
	return array_diff( $classes, array( 'feg-redesign' ) );
}
add_filter( 'body_class', 'fegn_remove_legacy_body_class', 20 );

/**
 * Editor: load the child stylesheet inside the block editor so patterns
 * preview with the real design system.
 */
function fegn_editor_assets() {
	wp_enqueue_style(
		'fegn-editor-style',
		get_stylesheet_directory_uri() . '/assets/css/fegn.css',
		array(),
		FEGN_VERSION
	);
}
add_action( 'enqueue_block_editor_assets', 'fegn_editor_assets' );

/**
 * Dynamic copyright year token used in the footer template part.
 */
function fegn_render_year_token( $block_content ) {
	return str_replace( '[fegn_year]', gmdate( 'Y' ), $block_content );
}
add_filter( 'render_block', 'fegn_render_year_token', 20 );

/**
 * Pattern category for the FEG TechNova design system patterns.
 */
function fegn_register_pattern_category() {
	if ( function_exists( 'register_block_pattern_category' ) ) {
		register_block_pattern_category(
			'fegn',
			array( 'label' => __( 'FEG TechNova', 'fegn' ) )
		);
	}
}
add_action( 'init', 'fegn_register_pattern_category' );

/**
 * Block templates and patterns write root-relative links (href="/about/").
 * Those resolve against the HOST root, which 404s when WordPress runs from
 * a subdirectory (local staging: /fegtechnova/). Rewrite them once against
 * the final rendered HTML via an output buffer — a render_block filter would
 * run recursively over nested blocks and double-prefix hrefs. On a
 * domain-root install this is a no-op, so no environment-specific URLs get
 * baked into files.
 */
function fegn_start_root_relative_link_fix() {
	ob_start( 'fegn_rewrite_root_relative_links' );
}
add_action( 'template_redirect', 'fegn_start_root_relative_link_fix', 1 );

function fegn_rewrite_root_relative_links( $html ) {
	$home_path = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
	if ( empty( $home_path ) || '/' === $home_path ) {
		return $html;
	}
	$base = rtrim( esc_attr( untrailingslashit( $home_path ) ), '/' ) . '/';

	return preg_replace(
		'~href=(["\'])/(?!/)~',
		'href=$1' . $base,
		$html
	);
}
