<?php
/**
 * Title: Service cards (query)
 * Slug: extendable-child/service-cards
 * Categories: fegn
 * Description: Grid of published Services pulled live from the Service content type. Excerpt limit 40 words per card. Shows nothing when no services are published yet.
 * Keywords: services, cards, query loop
 */
?>
<!-- wp:query {"queryId":0,"query":{"postType":"feg_service","perPage":6,"pages":0,"offset":0,"inherit":false,"order":"asc","orderBy":"title"},"className":"fegn-query-cards alignwide","layout":{"type":"default"}} -->
<div class="wp-block-query fegn-query-cards alignwide">
	<!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
		<!-- wp:group {"className":"fegn-card","layout":{"type":"constrained"}} -->
		<div class="wp-block-group fegn-card">
			<!-- wp:post-title {"isLink":true,"level":3} /-->
			<!-- wp:post-excerpt {"excerptLength":33,"moreText":"Learn more →"} /-->
		</div>
		<!-- /wp:group -->
	<!-- /wp:post-template -->
	<!-- wp:no-results -->
		<!-- wp:paragraph --><p>No services are published yet.</p><!-- /wp:paragraph -->
	<!-- /wp:no-results -->
</div>
<!-- /wp:query -->
