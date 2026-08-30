<?php
/**
 * Title: Section intro
 * Slug: extendable-child/section-intro
 * Categories: fegn
 * Description: Eyebrow + heading + lead paragraph opener for any section. Keep headings under 60 characters; lead under 35 words.
 * Keywords: intro, heading, eyebrow
 */
?>
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
	<!-- wp:paragraph {"className":"fegn-eyebrow","fontSize":"small","style":{"typography":{"fontWeight":"600","letterSpacing":"0.08em"}}} -->
	<p class="fegn-eyebrow has-small-font-size" style="font-weight:600;letter-spacing:0.08em">Section category</p>
	<!-- /wp:paragraph -->

	<!-- wp:heading {"level":2,"className":"fegn-section-title"} -->
	<h2 class="wp-block-heading fegn-section-title">Outcome-focused heading that names the business result.</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"className":"fegn-lead","fontSize":"large"} -->
	<p class="fegn-lead has-large-font-size">One supporting sentence that explains who this is for and why it matters. Replace this example text before publishing.</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
