<?php
// CLI-only comparison of baseline and optimized Contact responses.
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
$captures = [];
foreach (['before', 'after'] as $label) {
    $document = new DOMDocument();
    libxml_use_internal_errors(true);
    $document->loadHTML(file_get_contents(getenv('TEMP') . '/fegn-perf-' . $label . '.html'));
    libxml_clear_errors();
    $xpath = new DOMXPath($document);
    foreach ($xpath->query('//script | //style | //head') as $node) {
        $node->parentNode->removeChild($node);
    }
    $text = preg_replace('/\s+/u', ' ', $document->textContent);
    $controls = [];
    foreach ($xpath->query('//a | //img | //input | //textarea | //select | //option | //button | //form') as $node) {
        $attributes = [];
        foreach (['href', 'src', 'alt', 'id', 'name', 'type', 'required', 'action'] as $key) {
            if ($node->hasAttribute($key)) { $attributes[$key] = $node->getAttribute($key); }
        }
        $controls[] = [$node->nodeName, $attributes];
    }
    $captures[] = [$text, $controls];
}
if ($captures[0] !== $captures[1]) {
    fwrite(STDERR, "Visible text, links, images or form controls changed\n");
    exit(1);
}
echo 'Contact content preserved; compared ' . count($captures[0][1]) . " links/images/form elements.\n";
