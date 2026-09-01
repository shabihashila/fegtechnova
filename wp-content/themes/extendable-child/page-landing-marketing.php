<?php
/**
 * Template Name: Landing — Marketing & Creative Services
 * Serves a standalone static Tailwind landing page from the
 * theme's landing/ directory, keyed by the current page slug.
 */

$slug   = get_post_field( 'post_name', get_the_ID() );
$file   = get_stylesheet_directory() . '/landing/' . sanitize_file_name( $slug ) . '.html';

if ( file_exists( $file ) ) {
	readfile( $file );
	exit;
}

// Fallback if the landing file is missing.
get_header();
esc_html_e( 'Landing page file not found.', 'fegn' );
get_footer();