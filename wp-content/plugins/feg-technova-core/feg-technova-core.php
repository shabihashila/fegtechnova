<?php
/**
 * Plugin Name: FEG TechNova Core
 * Description: Structured content types (Service, Industry, Case Study, Team Member, Testimonial, FAQ), their metadata, and editor guidance for the FEG TechNova redesign. Durable business content lives here, not in the theme.
 * Version:     0.1.0
 * Author:      FEG TechNova redesign implementation agent
 * License:     GPL-2.0-or-later
 * Text Domain: feg-technova-core
 *
 * @package feg-technova-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'FEGNT_CORE_VERSION', '0.1.0' );
define( 'FEGNT_CORE_FILE', __FILE__ );
define( 'FEGNT_CORE_DIR', plugin_dir_path( __FILE__ ) );

require_once FEGNT_CORE_DIR . 'includes/post-types.php';
require_once FEGNT_CORE_DIR . 'includes/meta.php';
require_once FEGNT_CORE_DIR . 'includes/blocks.php';
require_once FEGNT_CORE_DIR . 'includes/contact-form.php';

/**
 * Register the structured content types.
 */
function fegnt_core_init() {
	fegnt_register_post_types();
	fegnt_register_taxonomies();
	fegnt_register_all_meta();
}
add_action( 'init', 'fegnt_core_init' );

/**
 * Flush rewrites on activation/deactivation so CPT permalinks resolve.
 */
function fegnt_core_activate() {
	fegnt_register_post_types();
	fegnt_register_taxonomies();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'fegnt_core_activate' );

function fegnt_core_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'fegnt_core_deactivate' );
