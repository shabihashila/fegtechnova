<?php
/**
 * Template Name: Landing — Web Design & Development
 * Serves the standalone Tailwind landing page.
 */

$file = get_stylesheet_directory() . '/landing/web-design.html';
if ( file_exists( $file ) ) {
	readfile( $file );
	exit;
}

get_header();
esc_html_e( 'Landing page file not found.', 'fegn' );
get_footer();
