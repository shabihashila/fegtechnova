<?php
/**
 * Template Name: Landing -- Marketing & Creative Services
 * Renders the matching landing/*.html file inside the global theme chrome
 * (standard header/footer template parts) via fegn_render_landing_page(),
 * keyed by the current page slug.
 */

$slug = get_post_field( 'post_name', get_the_ID() );
$file = get_stylesheet_directory() . '/landing/' . sanitize_file_name( $slug ) . '.html';

fegn_render_landing_page( $file );
