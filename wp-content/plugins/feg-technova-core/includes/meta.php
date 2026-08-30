<?php
/**
 * Meta registration, structured metaboxes, and editor guidance for
 * FEG TechNova content types.
 *
 * Field storage: native post meta via register_post_meta (no paid field
 * framework), per docs/content-model.md. All custom meta is show_in_rest =>
 * false; frontend rendering reads it server-side so nothing internal leaks
 * through REST responses.
 *
 * @package feg-technova-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const FEGNT_META_PREFIX = 'fegnt_';

/**
 * Register all post meta.
 */
function fegnt_register_all_meta() {

	// Service.
	fegnt_register_text_meta( 'feg_service', 'cta_text' );
	fegnt_register_url_meta( 'feg_service', 'cta_link' );
	fegnt_register_lines_meta( 'feg_service', 'capabilities' );   // one capability per line
	fegnt_register_lines_meta( 'feg_service', 'process_steps' );  // "Title | description" per line
	fegnt_register_relation_meta( 'feg_service', 'related_case_studies' );
	fegnt_register_relation_meta( 'feg_service', 'related_faqs' );

	// Industry.
	fegnt_register_text_meta( 'feg_industry', 'cta_text' );
	fegnt_register_url_meta( 'feg_industry', 'cta_link' );
	fegnt_register_lines_meta( 'feg_industry', 'challenges' );    // one challenge per line
	fegnt_register_textarea_meta( 'feg_industry', 'compliance_notes' );
	fegnt_register_relation_meta( 'feg_industry', 'applicable_services' );
	fegnt_register_relation_meta( 'feg_industry', 'related_case_studies' );

	// Case Study.
	fegnt_register_text_meta( 'feg_case_study', 'client_display_name' );
	fegnt_register_bool_meta( 'feg_case_study', 'anonymized' );
	fegnt_register_text_meta( 'feg_case_study', 'descriptor' );   // approved anonymous label
	fegnt_register_textarea_meta( 'feg_case_study', 'challenge' );
	fegnt_register_textarea_meta( 'feg_case_study', 'constraints' );
	fegnt_register_textarea_meta( 'feg_case_study', 'our_role' );
	fegnt_register_textarea_meta( 'feg_case_study', 'solution' );
	fegnt_register_lines_meta( 'feg_case_study', 'results' );     // "metric | unit/context | source | last-verified YYYY-MM-DD"
	fegnt_register_lines_meta( 'feg_case_study', 'stack' );       // one technology per line
	fegnt_register_relation_meta( 'feg_case_study', 'related_services' );
	fegnt_register_single_relation_meta( 'feg_case_study', 'testimonial_id' );

	// Team Member.
	fegnt_register_text_meta( 'feg_team_member', 'role' );
	fegnt_register_lines_meta( 'feg_team_member', 'approved_links' ); // "label | url" per line
	fegnt_register_int_meta( 'feg_team_member', 'sort_order' );

	// Testimonial.
	fegnt_register_text_meta( 'feg_testimonial', 'person_name' );
	fegnt_register_text_meta( 'feg_testimonial', 'person_role' );
	fegnt_register_text_meta( 'feg_testimonial', 'company' );
	register_post_meta(
		'feg_testimonial',
		FEGNT_META_PREFIX . 'permission_status',
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => false,
			'default'           => 'pending',
			'sanitize_callback' => function ( $value ) {
				return in_array( $value, array( 'pending', 'granted', 'denied' ), true ) ? $value : 'pending';
			},
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
	fegnt_register_single_relation_meta( 'feg_testimonial', 'related_case_study_id' );

	// FAQ: title = question, editor = answer, plus related services.
	fegnt_register_relation_meta( 'feg_faq', 'related_services' );
}

/**
 * Helpers to register typed meta with sane auth callbacks.
 */
function fegnt_register_text_meta( $post_type, $key ) {
	register_post_meta(
		$post_type,
		FEGNT_META_PREFIX . $key,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

function fegnt_register_textarea_meta( $post_type, $key ) {
	register_post_meta(
		$post_type,
		FEGNT_META_PREFIX . $key,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

function fegnt_register_url_meta( $post_type, $key ) {
	register_post_meta(
		$post_type,
		FEGNT_META_PREFIX . $key,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

function fegnt_register_bool_meta( $post_type, $key ) {
	register_post_meta(
		$post_type,
		FEGNT_META_PREFIX . $key,
		array(
			'type'              => 'boolean',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => function ( $value ) {
				return (bool) $value;
			},
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

function fegnt_register_int_meta( $post_type, $key ) {
	register_post_meta(
		$post_type,
		FEGNT_META_PREFIX . $key,
		array(
			'type'              => 'integer',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'absint',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

/**
 * Newline-separated list fields; stored as newline-delimited strings.
 */
function fegnt_register_lines_meta( $post_type, $key ) {
	fegnt_register_textarea_meta( $post_type, $key );
}

/**
 * Multi-value relation: array of related post IDs.
 */
function fegnt_register_relation_meta( $post_type, $key ) {
	register_post_meta(
		$post_type,
		FEGNT_META_PREFIX . $key,
		array(
			'type'              => 'array',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => function ( $value ) {
				return array_values( array_filter( array_map( 'absint', (array) $value ) ) );
			},
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

/**
 * Single-value relation: one related post ID (0 = none).
 */
function fegnt_register_single_relation_meta( $post_type, $key ) {
	fegnt_register_int_meta( $post_type, $key );
}

/* ------------------------------------------------------------------------- *
 * Metaboxes
 * ------------------------------------------------------------------------- */

/**
 * Register metaboxes per content type.
 */
function fegnt_add_metaboxes() {
	add_meta_box(
		'fegnt_service_fields',
		__( 'Service details', 'feg-technova-core' ),
		'fegnt_render_service_box',
		'feg_service',
		'normal',
		'high'
	);
	add_meta_box(
		'fegnt_industry_fields',
		__( 'Industry details', 'feg-technova-core' ),
		'fegnt_render_industry_box',
		'feg_industry',
		'normal',
		'high'
	);
	add_meta_box(
		'fegnt_case_study_fields',
		__( 'Case study details', 'feg-technova-core' ),
		'fegnt_render_case_study_box',
		'feg_case_study',
		'normal',
		'high'
	);
	add_meta_box(
		'fegnt_team_fields',
		__( 'Team member details', 'feg-technova-core' ),
		'fegnt_render_team_box',
		'feg_team_member',
		'normal',
		'high'
	);
	add_meta_box(
		'fegnt_testimonial_fields',
		__( 'Attribution & permission', 'feg-technova-core' ),
		'fegnt_render_testimonial_box',
		'feg_testimonial',
		'normal',
		'high'
	);
	add_meta_box(
		'fegnt_faq_fields',
		__( 'FAQ placement', 'feg-technova-core' ),
		'fegnt_render_faq_box',
		'feg_faq',
		'normal',
		'high'
	);

	foreach ( array( 'feg_service', 'feg_industry', 'feg_case_study', 'feg_team_member', 'feg_testimonial', 'feg_faq' ) as $screen ) {
		add_meta_box(
			'fegnt_guidance',
			__( 'Editing guidance (content rules)', 'feg-technova-core' ),
			'fegnt_render_guidance_box',
			$screen,
			'side',
			'default'
		);
	}
}
add_action( 'add_meta_boxes', 'fegnt_add_metaboxes' );

/**
 * Small field renderers.
 */
function fegnt_field_text( $post, $key, $label, $help = '' ) {
	$value = get_post_meta( $post->ID, FEGNT_META_PREFIX . $key, true );
	echo '<p><label for="' . esc_attr( FEGNT_META_PREFIX . $key ) . '"><strong>' . esc_html( $label ) . '</strong></label><br>';
	printf(
		'<input type="text" id="%1$s" name="%1$s" value="%2$s" class="widefat" />',
		esc_attr( FEGNT_META_PREFIX . $key ),
		esc_attr( $value )
	);
	if ( $help ) {
		echo '<span class="description">' . esc_html( $help ) . '</span>';
	}
	echo '</p>';
}

function fegnt_field_textarea( $post, $key, $label, $help = '', $rows = 4 ) {
	$value = get_post_meta( $post->ID, FEGNT_META_PREFIX . $key, true );
	echo '<p><label for="' . esc_attr( FEGNT_META_PREFIX . $key ) . '"><strong>' . esc_html( $label ) . '</strong></label><br>';
	printf(
		'<textarea id="%1$s" name="%1$s" rows="%2$d" class="widefat">%3$s</textarea>',
		esc_attr( FEGNT_META_PREFIX . $key ),
		(int) $rows,
		esc_textarea( $value )
	);
	if ( $help ) {
		echo '<span class="description">' . esc_html( $help ) . '</span>';
	}
	echo '</p>';
}

function fegnt_field_checkbox( $post, $key, $label, $help = '' ) {
	$value = (bool) get_post_meta( $post->ID, FEGNT_META_PREFIX . $key, true );
	echo '<p><label><input type="checkbox" name="' . esc_attr( FEGNT_META_PREFIX . $key ) . '" value="1" ' . checked( $value, true, false ) . ' /> <strong>' . esc_html( $label ) . '</strong></label>';
	if ( $help ) {
		echo '<br><span class="description">' . esc_html( $help ) . '</span>';
	}
	echo '</p>';
}

function fegnt_field_select( $post, $key, $label, $options, $help = '' ) {
	$value = get_post_meta( $post->ID, FEGNT_META_PREFIX . $key, true );
	echo '<p><label for="' . esc_attr( FEGNT_META_PREFIX . $key ) . '"><strong>' . esc_html( $label ) . '</strong></label><br>';
	printf( '<select id="%1$s" name="%1$s" class="widefat">', esc_attr( FEGNT_META_PREFIX . $key ) );
	foreach ( $options as $option_value => $option_label ) {
		printf(
			'<option value="%1$s" %2$s>%3$s</option>',
			esc_attr( $option_value ),
			selected( (string) $value, (string) $option_value, false ),
			esc_html( $option_label )
		);
	}
	echo '</select>';
	if ( $help ) {
		echo '<span class="description">' . esc_html( $help ) . '</span>';
	}
	echo '</p>';
}

function fegnt_field_multiselect_posts( $post, $key, $label, $query_post_type, $help = '' ) {
	$value = (array) get_post_meta( $post->ID, FEGNT_META_PREFIX . $key, true );
	$posts = get_posts(
		array(
			'post_type'      => $query_post_type,
			'post_status'    => array( 'publish', 'draft' ),
			'posts_per_page' => 200,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);
	echo '<p><strong>' . esc_html( $label ) . '</strong>';
	if ( empty( $posts ) ) {
		echo '<br><span class="description">' . esc_html__( 'No entries exist yet.', 'feg-technova-core' ) . '</span></p>';

		return;
	}
	echo '<select name="' . esc_attr( FEGNT_META_PREFIX . $key ) . '[]" multiple size="5" class="widefat">';
	foreach ( $posts as $candidate ) {
		printf(
			'<option value="%1$d" %2$s>%3$s (%4$s)</option>',
			(int) $candidate->ID,
			selected( in_array( (int) $candidate->ID, array_map( 'absint', $value ), true ), true, false ),
			esc_html( get_the_title( $candidate ) ),
			esc_html( $candidate->post_status )
		);
	}
	echo '</select>';
	if ( $help ) {
		echo '<span class="description">' . esc_html( $help ) . '</span>';
	}
	echo '</p>';
}

function fegnt_nonce_field() {
	wp_nonce_field( 'fegnt_save_meta', 'fegnt_meta_nonce' );
}

/**
 * Individual boxes.
 */
function fegnt_render_service_box( $post ) {
	fegnt_nonce_field();
	fegnt_field_multiselect_posts( $post, 'related_case_studies', __( 'Related case studies', 'feg-technova-core' ), 'feg_case_study', __( 'Only verified case studies should be linked.', 'feg-technova-core' ) );
	fegnt_field_multiselect_posts( $post, 'related_faqs', __( 'Related FAQs', 'feg-technova-core' ), 'feg_faq' );
	fegnt_field_textarea( $post, 'capabilities', __( 'Capabilities / deliverables (one per line)', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'process_steps', __( 'Approach steps', 'feg-technova-core' ), __( 'One step per line in the format: Title | short description', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'cta_text', __( 'CTA label', 'feg-technova-core' ), __( 'Must describe the result, e.g. Discuss Your Project. Never Click Here.', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'cta_link', __( 'CTA URL', 'feg-technova-core' ) );
}

function fegnt_render_industry_box( $post ) {
	fegnt_nonce_field();
	fegnt_field_multiselect_posts( $post, 'applicable_services', __( 'Applicable services', 'feg-technova-core' ), 'feg_service' );
	fegnt_field_multiselect_posts( $post, 'related_case_studies', __( 'Related case studies', 'feg-technova-core' ), 'feg_case_study' );
	fegnt_field_textarea( $post, 'challenges', __( 'Industry challenges (one per line)', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'compliance_notes', __( 'Compliance / risk considerations', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'cta_text', __( 'CTA label', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'cta_link', __( 'CTA URL', 'feg-technova-core' ) );
}

function fegnt_render_case_study_box( $post ) {
	fegnt_nonce_field();
	fegnt_field_text( $post, 'client_display_name', __( 'Client display name', 'feg-technova-core' ), __( 'Required only when disclosure is approved; leave empty if anonymized.', 'feg-technova-core' ) );
	fegnt_field_checkbox( $post, 'anonymized', __( 'Anonymize client', 'feg-technova-core' ), __( 'If checked, use an honest descriptor below instead of the client name.', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'descriptor', __( 'Anonymous descriptor', 'feg-technova-core' ), __( 'e.g. A Dhaka-based manufacturing group. Must not imply a false client relationship.', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'challenge', __( 'Challenge', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'constraints', __( 'Constraints & requirements', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'our_role', __( "FEG TechNova's role", 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'solution', __( 'Solution / architecture summary', 'feg-technova-core' ), __( 'Never expose confidential architecture, personal data, or security details.', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'results', __( 'Verified results (max 2 shown publicly)', 'feg-technova-core' ), __( 'One per line: metric | unit and context | measurement source | last-verified date (YYYY-MM-DD). Results without a source must not be published.', 'feg-technova-core' ), 5 );
	fegnt_field_textarea( $post, 'stack', __( 'Technology stack (one per line)', 'feg-technova-core' ), '', 3 );
	fegnt_field_multiselect_posts( $post, 'related_services', __( 'Related services', 'feg-technova-core' ), 'feg_service' );
	fegnt_field_select(
		$post,
		'testimonial_id',
		__( 'Approved testimonial', 'feg-technova-core' ),
		fegnt_testimonial_options(),
		__( 'Only testimonials with permission status Granted will ever render.', 'feg-technova-core' )
	);
}

function fegnt_render_team_box( $post ) {
	fegnt_nonce_field();
	fegnt_field_text( $post, 'role', __( 'Role', 'feg-technova-core' ) );
	fegnt_field_textarea( $post, 'approved_links', __( 'Approved links', 'feg-technova-core' ), __( 'One per line: label | url. Only profiles the person has approved.', 'feg-technova-core' ), 3 );
	fegnt_field_text( $post, 'sort_order', __( 'Sort order (number)', 'feg-technova-core' ) );
}

function fegnt_render_testimonial_box( $post ) {
	fegnt_nonce_field();
	fegnt_field_text( $post, 'person_name', __( 'Person name', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'person_role', __( 'Role', 'feg-technova-core' ) );
	fegnt_field_text( $post, 'company', __( 'Company / organization', 'feg-technova-core' ) );
	fegnt_field_select(
		$post,
		'permission_status',
		__( 'Permission status', 'feg-technova-core' ),
		array(
			'pending' => __( 'Pending — do NOT render publicly', 'feg-technova-core' ),
			'granted' => __( 'Granted — publication consent recorded', 'feg-technova-core' ),
			'denied'  => __( 'Denied — never publish', 'feg-technova-core' ),
		),
		__( 'Rendering code must check this value; default Pending keeps new testimonials private.', 'feg-technova-core' )
	);
	fegnt_field_select(
		$post,
		'related_case_study_id',
		__( 'Related case study', 'feg-technova-core' ),
		fegnt_case_study_options()
	);
}

function fegnt_render_faq_box( $post ) {
	fegnt_nonce_field();
	fegnt_field_multiselect_posts( $post, 'related_services', __( 'Show this FAQ on these services', 'feg-technova-core' ), 'feg_service', __( 'FAQs render only where related; no global FAQ dump.', 'feg-technova-core' ) );
}

/**
 * Option lists for single-relation selects.
 */
function fegnt_testimonial_options() {
	$options = array( '0' => __( '— none —', 'feg-technova-core' ) );
	foreach ( get_posts( array( 'post_type' => 'feg_testimonial', 'posts_per_page' => 200, 'post_status' => array( 'publish', 'draft' ) ) ) as $t ) {
		$status         = get_post_meta( $t->ID, FEGNT_META_PREFIX . 'permission_status', true );
		$status         = $status ? $status : 'pending';
		$options[ $t->ID ] = get_the_title( $t ) . sprintf( ' [%s]', $status );
	}

	return $options;
}

function fegnt_case_study_options() {
	$options = array( '0' => __( '— none —', 'feg-technova-core' ) );
	foreach ( get_posts( array( 'post_type' => 'feg_case_study', 'posts_per_page' => 200, 'post_status' => array( 'publish', 'draft' ) ) ) as $cs ) {
		$options[ $cs->ID ] = get_the_title( $cs );
	}

	return $options;
}

/**
 * Guidance box: mirrors docs/content-model.md limits so editors see the
 * rules where they write.
 */
function fegnt_render_guidance_box( $post ) {
	$guidance = array(
		'feg_service'     => array(
			__( 'Outcome sentence max 25 words; excerpt/summary max 60 words.', 'feg-technova-core' ),
			__( 'Publish only with distinct expertise, use cases, process, technologies, and proof or FAQ content.', 'feg-technova-core' ),
			__( 'Never invent metrics, clients, or certifications.', 'feg-technova-core' ),
		),
		'feg_industry'    => array(
			__( 'Publish only industries with substantive verified experience.', 'feg-technova-core' ),
			__( 'Cover workflows, risks, integration needs, compliance, services, proof, and CTA — not a swapped noun.', 'feg-technova-core' ),
		),
		'feg_case_study'  => array(
			__( 'Excerpt max 40 words; hero image 16:10; up to two results shown publicly.', 'feg-technova-core' ),
			__( 'Every result needs a unit, context, source, and last-verified date.', 'feg-technova-core' ),
			__( 'If disclosure is restricted, anonymize honestly; never imply a false client relationship.', 'feg-technova-core' ),
		),
		'feg_team_member' => array(
			__( 'Real, owner-approved people only. Portrait square, min 600px.', 'feg-technova-core' ),
			__( 'Unverified entries must be removed, not hidden.', 'feg-technova-core' ),
		),
		'feg_testimonial' => array(
			__( 'Quote max 80 words. Full attribution required.', 'feg-technova-core' ),
			__( 'Renders publicly only when permission status is Granted.', 'feg-technova-core' ),
		),
		'feg_faq'         => array(
			__( 'Title = question, body = answer.', 'feg-technova-core' ),
			__( 'Relate FAQs to specific services; avoid global duplication.', 'feg-technova-core' ),
		),
	);
	$lines = isset( $guidance[ $post->post_type ] ) ? $guidance[ $post->post_type ] : array();
	echo '<ul style="list-style:disc;padding-left:18px;margin:0">';
	foreach ( $lines as $line ) {
		echo '<li>' . esc_html( $line ) . '</li>';
	}
	echo '</ul>';
}

/* ------------------------------------------------------------------------- *
 * Saving
 * ------------------------------------------------------------------------- */

/**
 * Save all fegnt_ meta for our screens.
 */
function fegnt_save_meta( $post_id ) {
	if ( ! isset( $_POST['fegnt_meta_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['fegnt_meta_nonce'] ) ), 'fegnt_save_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$fegnt_types = array( 'feg_service', 'feg_industry', 'feg_case_study', 'feg_team_member', 'feg_testimonial', 'feg_faq' );
	$post_type   = get_post_type( $post_id );
	if ( ! in_array( $post_type, $fegnt_types, true ) ) {
		return;
	}

	$text_keys     = array(
		'feg_service'         => array( 'cta_text', 'cta_link', 'capabilities', 'process_steps', 'related_case_studies', 'related_faqs' ),
		'feg_industry'        => array( 'cta_text', 'cta_link', 'challenges', 'compliance_notes', 'applicable_services', 'related_case_studies' ),
		'feg_case_study'      => array( 'client_display_name', 'descriptor', 'challenge', 'constraints', 'our_role', 'solution', 'results', 'stack', 'related_services', 'testimonial_id', 'anonymized' ),
		'feg_team_member'     => array( 'role', 'approved_links', 'sort_order' ),
		'feg_testimonial'     => array( 'person_name', 'person_role', 'company', 'permission_status', 'related_case_study_id' ),
		'feg_faq'             => array( 'related_services' ),
	);
	$url_keys      = array( 'feg_service' => array( 'cta_link' ), 'feg_industry' => array( 'cta_link' ) );
	$relation_keys = array(
		'related_case_studies',
		'related_faqs',
		'applicable_services',
		'related_services',
	);

	$keys = isset( $text_keys[ $post_type ] ) ? $text_keys[ $post_type ] : array();

	foreach ( $keys as $key ) {
		$meta_key = FEGNT_META_PREFIX . $key;

		if ( in_array( $key, $relation_keys, true ) ) {
			$raw   = isset( $_POST[ $meta_key ] ) ? (array) wp_unslash( $_POST[ $meta_key ] ) : array();
			$value = array_values( array_filter( array_map( 'absint', $raw ) ) );
			update_post_meta( $post_id, $meta_key, $value );
			continue;
		}

		if ( 'cta_link' === $key && isset( $url_keys[ $post_type ] ) && in_array( 'cta_link', $url_keys[ $post_type ], true ) ) {
			$value = isset( $_POST[ $meta_key ] ) ? esc_url_raw( wp_unslash( $_POST[ $meta_key ] ) ) : '';
			update_post_meta( $post_id, $meta_key, $value );
			continue;
		}

		if ( ! isset( $_POST[ $meta_key ] ) ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		$raw_value = wp_unslash( $_POST[ $meta_key ] );

		if ( 'testimonial_id' === $key || 'related_case_study_id' === $key || 'sort_order' === $key ) {
			update_post_meta( $post_id, $meta_key, absint( $raw_value ) );
		} elseif ( 'anonymized' === $key ) {
			update_post_meta( $post_id, $meta_key, (bool) $raw_value );
		} elseif ( 'permission_status' === $key ) {
			update_post_meta( $post_id, $meta_key, in_array( $raw_value, array( 'pending', 'granted', 'denied' ), true ) ? $raw_value : 'pending' );
		} elseif ( in_array( $key, array( 'challenge', 'constraints', 'our_role', 'solution', 'compliance_notes' ), true ) ) {
			update_post_meta( $post_id, $meta_key, sanitize_textarea_field( $raw_value ) );
		} else {
			update_post_meta( $post_id, $meta_key, sanitize_textarea_field( $raw_value ) );
		}
	}

	// Unchecked checkboxes never POST — handle them explicitly.
	if ( 'feg_case_study' === $post_type && ! isset( $_POST[ FEGNT_META_PREFIX . 'anonymized' ] ) ) {
		update_post_meta( $post_id, FEGNT_META_PREFIX . 'anonymized', false );
	}
}
add_action( 'save_post', 'fegnt_save_meta' );

/* ------------------------------------------------------------------------- *
 * Admin list tweaks
 * ------------------------------------------------------------------------- */

/**
 * Permission status column on testimonials — makes the publication gate visible.
 */
function fegnt_testimonial_columns( $columns ) {
	$columns['fegnt_permission'] = __( 'Permission', 'feg-technova-core' );

	return $columns;
}
add_filter( 'manage_feg_testimonial_posts_columns', 'fegnt_testimonial_columns' );

function fegnt_testimonial_column_content( $column, $post_id ) {
	if ( 'fegnt_permission' !== $column ) {
		return;
	}
	$status = get_post_meta( $post_id, FEGNT_META_PREFIX . 'permission_status', true );
	$status = $status ? $status : 'pending';
	echo esc_html( strtoupper( $status ) );
}
add_action( 'manage_feg_testimonial_posts_custom_column', 'fegnt_testimonial_column_content', 10, 2 );
