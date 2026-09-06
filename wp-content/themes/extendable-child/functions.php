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
 * Project inquiry form: AJAX submission without page reload.
 * Nonce + endpoint are exposed via wp_localize_script; the server-side
 * handler lives in the feg-technova-core plugin (includes/contact-form.php).
 */
function fegn_enqueue_contact_form_script() {
	$js_path = get_stylesheet_directory() . '/assets/js/fegn-contact-form.js';
	if ( ! file_exists( $js_path ) ) {
		return;
	}

	wp_enqueue_script(
		'fegn-contact-form',
		get_stylesheet_directory_uri() . '/assets/js/fegn-contact-form.js',
		array(),
		(string) filemtime( $js_path ),
		true
	);

	wp_localize_script(
		'fegn-contact-form',
		'FegnContactForm',
		array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'action'  => 'fegn_submit_inquiry',
			'nonce'   => wp_create_nonce( 'fegn_contact_inquiry' ),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'fegn_enqueue_contact_form_script' );

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

/**
 * Render a standalone Tailwind landing page (landing/*.html) inside the
 * real theme chrome.
 *
 * The landing files only provide the marketing sections. Document head
 * extras (Tailwind CDN + page CSS), the exact global header/footer
 * template parts, and all theme assets come from the main theme, so the
 * top navigation is 100% uniform on every Website/Marketing sub-page.
 * Any legacy standalone <header>/<footer> left inside the file is
 * stripped at render time.
 *
 * @param string $file Absolute path to the landing/*.html file.
 */
function fegn_render_landing_page( $file ) {
	if ( ! file_exists( $file ) ) {
		status_header( 404 );
		esc_html_e( 'Landing page file not found.', 'fegn' );
		exit;
	}

	$html = file_get_contents( $file );

	$title = '';
	if ( preg_match( '~<title>(.*?)</title>~is', $html, $m ) ) {
		$title = trim( wp_strip_all_tags( $m[1] ) );
	}

	$description = '';
	if ( preg_match( '~<meta\s+name="description"\s+content="(.*?)"~is', $html, $m ) ) {
		$description = html_entity_decode( $m[1], ENT_QUOTES, get_bloginfo( 'charset' ) );
	}

	// Tailwind CDN + config + font CSS + page <style> block.
	$head_extras = '';
	if ( preg_match( '~(<script src="https://cdn\.tailwindcss\.com.*?</style>)~is', $html, $m ) ) {
		$head_extras = $m[1];
	}

	// Marketing sections between the HERO marker and the footer marker
	// (physical files may carry FOOTER or the stripped FOOTER-REMOVED note).
	$body = $html;
	if ( preg_match( '~<!-- HERO -->(.*?)(?:<!-- FOOTER -->|<!-- FOOTER-REMOVED)~is', $html, $m ) ) {
		$body = $m[1];
	} elseif ( preg_match( '~<body[^>]*>(.*?)</body>~is', $html, $m ) ) {
		$body = $m[1];
	}

	// Drop any legacy standalone header/footer baked into the file.
	$body = preg_replace( '~<!-- GLOBAL HEADER.*?-->.*?</header>~is', '', $body );
	$body = preg_replace( '~<!-- FOOTER -->.*$~is', '', $body );

	$needs_lucide = ( false !== strpos( $html, 'lucide.createIcons' ) );

	add_theme_support( 'title-tag' );

	if ( '' !== $title ) {
		add_filter(
			'pre_get_document_title',
			function () use ( $title ) {
				return $title;
			}
		);
	}

	add_action(
		'wp_head',
		function () use ( $description, $head_extras ) {
			if ( '' !== $description ) {
				echo '<meta name="description" content="' . esc_attr( $description ) . '">' . "\n";
			}
			// Theme-owned static assets (Tailwind CDN, font CSS, page styles).
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $head_extras;
		},
		5
	);

	?>
	<!DOCTYPE html>
	<html <?php language_attributes(); ?>>
	<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php wp_head(); ?>
	</head>
	<body <?php body_class( 'fegn-landing' ); ?>>
	<?php wp_body_open(); ?>
	<?php fegn_landing_template_part( 'header' ); ?>
	<main id="fegn-main" class="wp-block-group fegn-main">
		<?php
		// Static theme-owned landing markup (no user input).
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $body;
		?>
	</main>
	<?php fegn_landing_template_part( 'footer' ); ?>
	<?php if ( $needs_lucide ) : ?>
	<script>if ( window.lucide ) { lucide.createIcons(); }</script>
	<?php endif; ?>
	<?php wp_footer(); ?>
	</body>
	</html>
	<?php
	exit;
}

/**
 * Render a global header/footer template part outside block templates,
 * with a classic fallback when block parts are unavailable.
 *
 * @param string $slug Template part slug (header|footer).
 */
function fegn_landing_template_part( $slug ) {
	if ( function_exists( 'block_template_part' ) ) {
		block_template_part( $slug );
		return;
	}
	echo do_blocks( '<!-- wp:template-part {"slug":"' . esc_attr( $slug ) . '"} /-->' );
}
