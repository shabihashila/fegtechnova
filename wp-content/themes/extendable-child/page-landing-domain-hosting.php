<?php
/**
 * Template Name: Landing — Domain & Hosting
 * Serves the standalone Tailwind landing page.
 */

$file = get_stylesheet_directory() . '/landing/domain-hosting.html';
if ( file_exists( $file ) ) {
	readfile( $file );
	exit;
}

// Fallback if file is missing
get_header();
esc_html_e( 'Landing page file not found.', 'fegn' );
get_footer();
