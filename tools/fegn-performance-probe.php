<?php
// Temporary localhost-only diagnostics. Never return settings or query values.
if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', array('127.0.0.1', '::1'), true)) { http_response_code(403); exit; }
define('SAVEQUERIES', true);
$start = microtime(true);
require dirname(__DIR__) . '/wp-load.php';
$boot = microtime(true) - $start;
$connect = array();
foreach (array('localhost', '127.0.0.1') as $host) {
    $t = microtime(true);
    $db = new mysqli($host, DB_USER, DB_PASSWORD, DB_NAME);
    $connect[$host] = round((microtime(true) - $t) * 1000, 2);
    $db->close();
}
$queries = array_column($wpdb->queries, 1);
$autoload = $wpdb->get_row("SELECT COUNT(*) AS rows_count, SUM(LENGTH(option_value)) AS bytes FROM {$wpdb->options} WHERE autoload IN ('yes','on','auto','auto-on')", ARRAY_A);
header('Content-Type: application/json');
$slow = $wpdb->queries;
usort($slow, function($a, $b) { return $b[1] <=> $a[1]; });
$slow = array_map(function($q) { return array('sql' => preg_replace("/'[^']*'/", "'?'", $q[0]), 'ms' => round($q[1]*1000, 2), 'caller' => $q[2]); }, array_slice($slow, 0, 5));
echo json_encode(array('slow_queries' => $slow)) . "\n";
echo json_encode(array('bootstrap_ms' => round($boot * 1000, 2), 'query_count' => count($queries), 'query_ms' => round(array_sum($queries) * 1000, 2), 'slowest_query_ms' => round(max($queries) * 1000, 2), 'connection_ms' => $connect, 'autoload' => $autoload, 'plugins' => get_option('active_plugins'), 'opcache' => function_exists('opcache_get_status') ? opcache_get_status(false) : false, 'memory_mb' => round(memory_get_peak_usage(true) / 1048576, 2)), JSON_PRETTY_PRINT);
