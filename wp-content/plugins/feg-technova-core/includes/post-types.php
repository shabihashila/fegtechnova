<?php
/**
 * Structured content types for the FEG TechNova redesign.
 *
 * Spec source: docs/content-model.md section 1 (requirements.md 13.2).
 * Editor guidance lives in each post type description and in the
 * guidance metabox registered in includes/meta.php.
 *
 * @package feg-technova-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the six structured content types.
 */
function fegnt_register_post_types() {

	// Service — public, non-hierarchical. Route: /services/{service-slug}/.
	register_post_type(
		'feg_service',
		array(
			'labels'          => array(
				'name'               => __( 'Services', 'feg-technova-core' ),
				'singular_name'      => __( 'Service', 'feg-technova-core' ),
				'add_new_item'       => __( 'Add New Service', 'feg-technova-core' ),
				'edit_item'          => __( 'Edit Service', 'feg-technova-core' ),
				'not_found'          => __( 'No services published yet.', 'feg-technova-core' ),
			),
			'public'          => true,
			'menu_icon'       => 'dashicons-admin-tools',
			'menu_position'   => 21,
			'supports'        => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
			'rewrite'         => array(
				'slug'       => 'services',
				'with_front' => false,
			),
			'has_archive'     => false,
			'show_in_rest'    => true,
			'description'     => __( 'Publish only if this page has distinct expertise, use cases, process, technologies, and proof or FAQ content (requirements 12.1). Outcome sentence max 25 words; summary/excerpt max 60 words.', 'feg-technova-core' ),
		)
	);

	// Industry — public, conditional on verified experience.
	register_post_type(
		'feg_industry',
		array(
			'labels'       => array(
				'name'          => __( 'Industries', 'feg-technova-core' ),
				'singular_name' => __( 'Industry', 'feg-technova-core' ),
				'add_new_item'  => __( 'Add New Industry', 'feg-technova-core' ),
				'edit_item'     => __( 'Edit Industry', 'feg-technova-core' ),
			),
			'public'       => true,
			'menu_icon'    => 'dashicons-building',
			'menu_position' => 22,
			'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
			'rewrite'      => array(
				'slug'       => 'industries',
				'with_front' => false,
			),
			'has_archive'  => false,
			'show_in_rest' => true,
			'description'  => __( 'Only publish industries where FEG TechNova has substantive, owner-verified delivery experience (requirements 12.3). Each page must discuss workflows, risks, integration needs, compliance, services, proof, and a tailored CTA — not just a swapped noun.', 'feg-technova-core' ),
		)
	);

	// Case Study — public. Replaces/reframes Portfolio per requirements 8.3/12.4.
	register_post_type(
		'feg_case_study',
		array(
			'labels'       => array(
				'name'          => __( 'Case Studies', 'feg-technova-core' ),
				'singular_name' => __( 'Case Study', 'feg-technova-core' ),
				'add_new_item'  => __( 'Add New Case Study', 'feg-technova-core' ),
				'edit_item'     => __( 'Edit Case Study', 'feg-technova-core' ),
			),
			'public'       => true,
			'menu_icon'    => 'dashicons-portfolio',
			'menu_position' => 23,
			'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
			'rewrite'      => array(
				'slug'       => 'case-studies',
				'with_front' => false,
			),
			'has_archive'  => true,
			'show_in_rest' => true,
			'description'  => __( 'Card contract: title, client or approved anonymous descriptor, industry term, service relation, excerpt max 40 words, hero image 16:10, up to two verified results with units, context, source, and last-verified date. Never publish results without an internal measurement source (requirements 6/12.5).', 'feg-technova-core' ),
		)
	);

	// Team Member — private; rendered only through approved patterns/blocks.
	register_post_type(
		'feg_team_member',
		array(
			'labels'       => array(
				'name'          => __( 'Team Members', 'feg-technova-core' ),
				'singular_name' => __( 'Team Member', 'feg-technova-core' ),
				'add_new_item'  => __( 'Add New Team Member', 'feg-technova-core' ),
				'edit_item'     => __( 'Edit Team Member', 'feg-technova-core' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_rest'        => true,
			'exclude_from_search' => true,
			'menu_icon'           => 'dashicons-groups',
			'menu_position'       => 24,
			'supports'            => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'revisions' ),
			'description'         => __( 'Use ONLY with real, owner-approved people: verified name, role, biography, portrait (square, min 600px), approved links. Remove any entry that is not explicitly verified (requirements 6). The editor content field holds the bio.', 'feg-technova-core' ),
		)
	);

	// Testimonial — not publicly queryable; renders only when permission = granted.
	register_post_type(
		'feg_testimonial',
		array(
			'labels'       => array(
				'name'          => __( 'Testimonials', 'feg-technova-core' ),
				'singular_name' => __( 'Testimonial', 'feg-technova-core' ),
				'add_new_item'  => __( 'Add New Testimonial', 'feg-technova-core' ),
				'edit_item'     => __( 'Edit Testimonial', 'feg-technova-core' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_rest'        => true,
			'exclude_from_search' => true,
			'menu_icon'           => 'dashicons-format-quote',
			'menu_position'       => 25,
			'supports'            => array( 'title', 'editor', 'revisions' ),
			'description'         => __( 'Quote max 80 words (editor content). Attribution fields: person name, role, company. A testimonial may render publicly ONLY when its permission status is set to Granted with recorded consent (requirements 6/11.10).', 'feg-technova-core' ),
		)
	);

	// FAQ — not public; related to pages/services so schema ships only
	// where the Q&A actually appears (avoids global duplication).
	register_post_type(
		'feg_faq',
		array(
			'labels'       => array(
				'name'          => __( 'FAQs', 'feg-technova-core' ),
				'singular_name' => __( 'FAQ', 'feg-technova-core' ),
				'add_new_item'  => __( 'Add New FAQ', 'feg-technova-core' ),
				'edit_item'     => __( 'Edit FAQ', 'feg-technova-core' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_rest'        => true,
			'exclude_from_search' => true,
			'menu_icon'           => 'dashicons-editor-help',
			'menu_position'       => 26,
			'supports'            => array( 'title', 'editor', 'revisions' ),
			'description'         => __( 'Title = question (one sentence), editor content = answer. Relate FAQs to specific Services so they render only on relevant pages and FAQ schema is emitted only where the Q&A exists.', 'feg-technova-core' ),
		)
	);
}

/**
 * Taxonomy: industry terms on case studies. Queryable so industry filter
 * URLs work without JavaScript once the index ships.
 */
function fegnt_register_taxonomies() {
	register_taxonomy(
		'feg_cs_industry',
		'feg_case_study',
		array(
			'labels'            => array(
				'name'          => __( 'Case Study Industries', 'feg-technova-core' ),
				'singular_name' => __( 'Case Study Industry', 'feg-technova-core' ),
			),
			'hierarchical'      => false,
			'public'            => true,
			'publicly_queryable'=> true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => array(
				'slug'       => 'case-study-industry',
				'with_front' => false,
			),
			'description'       => __( 'The real industry a case study belongs to. Used by index filters; only add industries that also exist as verified Industries content or honest descriptors.', 'feg-technova-core' ),
		)
	);
}
