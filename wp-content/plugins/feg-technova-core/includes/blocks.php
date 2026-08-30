<?php
/**
 * Minimal server-rendered dynamic blocks that expose structured meta on the
 * front end. All output is escaped and indexable; nothing depends on JS.
 *
 * Blocks:
 *  - fegnt/service-sections     (capabilities, process, FAQs, related work, CTA)
 *  - fegnt/case-study-sections  (client context, challenge→solution, results, stack, testimonial)
 *  - fegnt/industry-sections    (challenges, applicable services, compliance, related work, CTA)
 *
 * @package feg-technova-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the dynamic blocks (after post types, same init priority order).
 */
function fegnt_register_blocks() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	register_block_type(
		'fegnt/service-sections',
		array(
			'api_version'     => 2,
			'render_callback' => 'fegnt_render_service_sections',
			'supports'        => array( 'inserter' => true ),
		)
	);
	register_block_type(
		'fegnt/case-study-sections',
		array(
			'api_version'     => 2,
			'render_callback' => 'fegnt_render_case_study_sections',
			'supports'        => array( 'inserter' => true ),
		)
	);
	register_block_type(
		'fegnt/industry-sections',
		array(
			'api_version'     => 2,
			'render_callback' => 'fegnt_render_industry_sections',
			'supports'        => array( 'inserter' => true ),
		)
	);
}
add_action( 'init', 'fegnt_register_blocks', 20 );

/* -------------------------------------------------------------------------
 * Shared render helpers
 * ---------------------------------------------------------------------- */

/**
 * Open a styled section wrapper matching the child design system.
 */
function fegnt_section_open( $extra_class = '', $dark = false ) {
	$classes = trim( 'fegn-section fegn-meta-section ' . $extra_class );
	return sprintf(
		'<div class="%1$s"%2$s>',
		esc_attr( $classes ),
		$dark ? ' style="background-color:var(--wp--preset--color--ink);color:#FFFFFF"' : ''
	);
}

function fegnt_section_close() {
	return '</div>';
}

function fegnt_h2( $text ) {
	return '<h2 class="wp-block-heading fegn-section-title">' . esc_html( $text ) . '</h2>';
}

/**
 * Render newline-separated lines as a list. Empty input returns ''.
 */
function fegnt_lines_to_list( $raw ) {
	$lines = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $raw ) ) );
	if ( empty( $lines ) ) {
		return '';
	}
	$out = '<ul>';
	foreach ( $lines as $line ) {
		$out .= '<li>' . esc_html( $line ) . '</li>';
	}

	return $out . '</ul>';
}

/**
 * "Title | description" lines → definition-style steps.
 */
function fegnt_steps_to_markup( $raw ) {
	$lines = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $raw ) ) );
	if ( empty( $lines ) ) {
		return '';
	}
	$out = '<ol class="fegn-process-list">';
	foreach ( $lines as $i => $line ) {
		$parts = array_map( 'trim', explode( '|', $line, 2 ) );
		$title = $parts[0];
		$desc  = isset( $parts[1] ) ? $parts[1] : '';
		$out  .= '<li><strong>' . esc_html( $title ) . '</strong>' . ( '' !== $desc ? ' — ' . esc_html( $desc ) : '' ) . '</li>';
	}

	return $out . '</ol>';
}

/**
 * Related posts as a linked list; only published targets are shown.
 */
function fegnt_related_posts_list( $ids, $post_type, $empty_text = '' ) {
	$ids = array_filter( array_map( 'absint', (array) $ids ) );
	if ( empty( $ids ) ) {
		return '' !== $empty_text ? '<p class="fegn-muted-note">' . esc_html( $empty_text ) . '</p>' : '';
	}
	$posts = get_posts(
		array(
			'post_type'        => $post_type,
			'post__in'         => $ids,
			'posts_per_page'   => count( $ids ),
			'post_status'      => 'publish',
			'orderby'          => 'post__in',
			'suppress_filters' => false,
		)
	);
	if ( empty( $posts ) ) {
		return '' !== $empty_text ? '<p class="fegn-muted-note">' . esc_html( $empty_text ) . '</p>' : '';
	}
	$out = '<ul class="fegn-related-list">';
	foreach ( $posts as $related ) {
		$out .= '<li><a href="' . esc_url( get_permalink( $related ) ) . '">' . esc_html( get_the_title( $related ) ) . '</a></li>';
	}

	return $out . '</ul>';
}

/**
 * CTA button from meta text + URL.
 */
function fegnt_cta_button( $text, $url ) {
	$text = trim( (string) $text );
	$url  = trim( (string) $url );
	if ( '' === $text || '' === $url ) {
		return '';
	}

	return sprintf(
		'<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="%1$s">%2$s</a></div></div>',
		esc_url( $url ),
		esc_html( $text )
	);
}

/**
 * FAQ items for the given IDs as accessible <details> accordions.
 */
function fegnt_faqs_accordion( $faq_ids ) {
	$faq_ids = array_filter( array_map( 'absint', (array) $faq_ids ) );
	if ( empty( $faq_ids ) ) {
		return '';
	}
	$faqs = get_posts(
		array(
			'post_type'      => 'feg_faq',
			'post__in'       => $faq_ids,
			'posts_per_page' => count( $faq_ids ),
			'post_status'    => 'publish',
			'orderby'        => 'post__in',
		)
	);
	if ( empty( $faqs ) ) {
		return '';
	}
	$out = '<div class="fegn-faq-list">';
	foreach ( $faqs as $faq ) {
		$answer = trim( do_blocks( get_post_field( 'post_content', $faq ) ) );
		$out   .= '<details class="fegn-faq-item"><summary>' . esc_html( get_the_title( $faq ) ) . '</summary><div class="fegn-faq-answer">' . wp_kses_post( wpautop( $answer ) ) . '</div></details>';
	}

	return $out . '</div>';
}

/**
 * Approved testimonial figure — renders ONLY when permission status is granted.
 */
function fegnt_testimonial_figure( $testimonial_id ) {
	$testimonial_id = absint( $testimonial_id );
	if ( ! $testimonial_id ) {
		return '';
	}
	if ( 'granted' !== get_post_meta( $testimonial_id, FEGNT_META_PREFIX . 'permission_status', true ) ) {
		return '';
	}
	$quote  = trim( get_post_field( 'post_content', $testimonial_id ) );
	$person = get_post_meta( $testimonial_id, FEGNT_META_PREFIX . 'person_name', true );
	$role   = get_post_meta( $testimonial_id, FEGNT_META_PREFIX . 'person_role', true );
	$org    = get_post_meta( $testimonial_id, FEGNT_META_PREFIX . 'company', true );

	if ( '' === $quote ) {
		return '';
	}
	$citation_parts = array_filter( array( $person, $role, $org ) );
	$attribution    = implode( ', ', $citation_parts );

	return sprintf(
		'<figure class="fegn-testimonial"><blockquote>%1$s</blockquote>%2$s</figure>',
		esc_html( wp_strip_all_tags( $quote ) ),
		'' !== $attribution ? '<figcaption>' . esc_html( $attribution ) . '</figcaption>' : ''
	);
}

/**
 * Verified results list. A result line is published only when it carries a
 * measurement source: "metric | unit/context | source | last-verified date".
 */
function fegnt_case_study_results( $raw ) {
	$lines = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $raw ) ) );
	if ( empty( $lines ) ) {
		return '';
	}
	$out = '<ul class="fegn-results-list">';
	foreach ( array_slice( $lines, 0, 2 ) as $line ) { // card contract: max 2 public results
		$parts = array_map( 'trim', explode( '|', $line ) );
		$metric = isset( $parts[0] ) ? $parts[0] : '';
		$context = isset( $parts[1] ) ? $parts[1] : '';
		$source  = isset( $parts[2] ) ? $parts[2] : '';
		if ( '' === $metric || '' === $source ) {
			continue; // no source → never publish the number
		}
		$out .= '<li><strong>' . esc_html( $metric ) . '</strong>' . ( '' !== $context ? ' <span class="fegn-results-context">(' . esc_html( $context ) . ')</span>' : '' ) . '</li>';
	}
	$published = substr_count( $out, '<li>' );

	return $published > 0 ? $out . '</ul>' : '';
}

/* -------------------------------------------------------------------------
 * Block render callbacks
 * ---------------------------------------------------------------------- */

/**
 * Service detail sections below the editor content.
 */
function fegnt_render_service_sections() {
	$post_id = get_the_ID();
	if ( ! $post_id || 'feg_service' !== get_post_type( $post_id ) ) {
		return '';
	}

	$html  = fegnt_section_open();
	$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'What we deliver', 'feg-technova-core' ) . '</h2>';
	$html .= fegnt_lines_to_list( get_post_meta( $post_id, FEGNT_META_PREFIX . 'capabilities', true ) );

	$steps = fegnt_steps_to_markup( get_post_meta( $post_id, FEGNT_META_PREFIX . 'process_steps', true ) );
	if ( '' !== $steps ) {
		$html .= '<h3 class="wp-block-heading">' . esc_html__( 'How we approach it', 'feg-technova-core' ) . '</h3>' . $steps;
	}

	$faqs = fegnt_faqs_accordion( get_post_meta( $post_id, FEGNT_META_PREFIX . 'related_faqs', true ) );
	if ( '' !== $faqs ) {
		$html .= '<h3 class="wp-block-heading">' . esc_html__( 'Common questions', 'feg-technova-core' ) . '</h3>' . $faqs;
	}

	$related = fegnt_related_posts_list(
		get_post_meta( $post_id, FEGNT_META_PREFIX . 'related_case_studies', true ),
		'feg_case_study'
	);
	if ( '' !== $related ) {
		$html .= '<h3 class="wp-block-heading">' . esc_html__( 'Related work', 'feg-technova-core' ) . '</h3>' . $related;
	}

	$html .= fegnt_cta_button(
		get_post_meta( $post_id, FEGNT_META_PREFIX . 'cta_text', true ),
		get_post_meta( $post_id, FEGNT_META_PREFIX . 'cta_link', true )
	);
	$html .= fegnt_section_close();

	return $html;
}

/**
 * Case study detail sections below the editor content.
 */
function fegnt_render_case_study_sections() {
	$post_id = get_the_ID();
	if ( ! $post_id || 'feg_case_study' !== get_post_type( $post_id ) ) {
		return '';
	}

	// Client context line (honest descriptor or approved name).
	$client_line = '';
	$name        = trim( get_post_meta( $post_id, FEGNT_META_PREFIX . 'client_display_name', true ) );
	$anon        = (bool) get_post_meta( $post_id, FEGNT_META_PREFIX . 'anonymized', true );
	$descriptor  = trim( get_post_meta( $post_id, FEGNT_META_PREFIX . 'descriptor', true ) );
	if ( $anon && '' !== $descriptor ) {
		$client_line = $descriptor;
	} elseif ( ! $anon && '' !== $name ) {
		$client_line = $name;
	}

	$html  = fegnt_section_open();
	if ( '' !== $client_line ) {
		$html .= '<p class="fegn-eyebrow has-small-font-size">' . esc_html( $client_line ) . '</p>';
	}

	foreach ( array(
		'challenge'   => __( 'The challenge', 'feg-technova-core' ),
		'constraints' => __( 'Constraints and requirements', 'feg-technova-core' ),
		'our_role'    => __( "FEG TechNova's role", 'feg-technova-core' ),
		'solution'    => __( 'The solution', 'feg-technova-core' ),
	) as $key => $heading ) {
		$value = trim( get_post_meta( $post_id, FEGNT_META_PREFIX . $key, true ) );
		if ( '' === $value ) {
			continue;
		}
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html( $heading ) . '</h2>' . wp_kses_post( wpautop( $value ) );
	}

	$results = fegnt_case_study_results( get_post_meta( $post_id, FEGNT_META_PREFIX . 'results', true ) );
	if ( '' !== $results ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Outcome', 'feg-technova-core' ) . '</h2>' . $results;
	}

	$stack = fegnt_lines_to_list( get_post_meta( $post_id, FEGNT_META_PREFIX . 'stack', true ) );
	if ( '' !== $stack ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Technology stack', 'feg-technova-core' ) . '</h2>' . $stack;
	}

	$testimonial = fegnt_testimonial_figure( get_post_meta( $post_id, FEGNT_META_PREFIX . 'testimonial_id', true ) );
	$html       .= $testimonial;

	$services = fegnt_related_posts_list(
		get_post_meta( $post_id, FEGNT_META_PREFIX . 'related_services', true ),
		'feg_service'
	);
	if ( '' !== $services ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Related services', 'feg-technova-core' ) . '</h2>' . $services;
	}
	$html .= fegnt_section_close();

	return $html;
}

/**
 * Industry detail sections below the editor content.
 */
function fegnt_render_industry_sections() {
	$post_id = get_the_ID();
	if ( ! $post_id || 'feg_industry' !== get_post_type( $post_id ) ) {
		return '';
	}

	$html = fegnt_section_open();

	$challenges = fegnt_lines_to_list( get_post_meta( $post_id, FEGNT_META_PREFIX . 'challenges', true ) );
	if ( '' !== $challenges ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Challenges we address', 'feg-technova-core' ) . '</h2>' . $challenges;
	}

	$compliance = trim( get_post_meta( $post_id, FEGNT_META_PREFIX . 'compliance_notes', true ) );
	if ( '' !== $compliance ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Compliance and risk considerations', 'feg-technova-core' ) . '</h2>' . wp_kses_post( wpautop( $compliance ) );
	}

	$services = fegnt_related_posts_list( get_post_meta( $post_id, FEGNT_META_PREFIX . 'applicable_services', true ), 'feg_service' );
	if ( '' !== $services ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Relevant services', 'feg-technova-core' ) . '</h2>' . $services;
	}

	$cases = fegnt_related_posts_list( get_post_meta( $post_id, FEGNT_META_PREFIX . 'related_case_studies', true ), 'feg_case_study' );
	if ( '' !== $cases ) {
		$html .= '<h2 class="wp-block-heading fegn-section-title">' . esc_html__( 'Related work', 'feg-technova-core' ) . '</h2>' . $cases;
	}

	$html .= fegnt_cta_button(
		get_post_meta( $post_id, FEGNT_META_PREFIX . 'cta_text', true ),
		get_post_meta( $post_id, FEGNT_META_PREFIX . 'cta_link', true )
	);
	$html .= fegnt_section_close();

	return $html;
}
