<?php
/**
 * Title: Case study grid (query)
 * Slug: extendable-child/case-study-grid
 * Categories: fegn
 * Description: Grid of published Case Studies with industry term, title, excerpt (max 40 words) and hero image (16:10). Only verified case studies should be published to this content type.
 * Keywords: case studies, portfolio, work
 */
?>
<!-- wp:query {"queryId":0,"query":{"postType":"feg_case_study","perPage":9,"pages":0,"offset":0,"inherit":false,"order":"desc","orderBy":"date"},"className":"fegn-query-cards alignwide","layout":{"type":"default"}} -->
<div class="wp-block-query fegn-query-cards alignwide">
	<!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
		<!-- wp:group {"className":"fegn-card fegn-case-card","layout":{"type":"constrained"}} -->
		<div class="wp-block-group fegn-card fegn-case-card">
			<!-- wp:post-featured-image {"isLink":true,"aspectRatio":"16/10","style":{"border":{"radius":"12px"}}} /-->
			<!-- wp:post-terms {"term":"feg_cs_industry","className":"fegn-card-term"} /-->
			<!-- wp:post-title {"isLink":true,"level":3} /-->
			<!-- wp:post-excerpt {"excerptLength":33,"moreText":"Read case study →"} /-->
		</div>
		<!-- /wp:group -->
	<!-- /wp:post-template -->
	<!-- wp:no-results -->
		<!-- wp:paragraph {"className":"fegn-muted-note"} --><p class="fegn-muted-note">Case studies are published only after client approval. Ask us about relevant projects in your industry.</p><!-- /wp:paragraph -->
	<!-- /wp:no-results -->
	<!-- wp:query-pagination {"paginationArrow":"arrow","layout":{"type":"flex","justifyContent":"space-between"}} -->
		<!-- wp:query-pagination-previous /-->
		<!-- wp:query-pagination-numbers /-->
		<!-- wp:query-pagination-next /-->
	<!-- /wp:query-pagination -->
</div>
<!-- /wp:query -->
