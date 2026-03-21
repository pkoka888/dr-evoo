<?php
/**
 * Kilo Code MCP Server
 * Model Context Protocol server for Kilo Code framework integration
 *
 * @author Kilo Code Team
 * @version 1.0.0
 */

require_once __DIR__ . '/../integration/ModeExecutor.php';

class KiloCodeMCPServer
{
    private $modeExecutor;
    private $config;
    private $logger;

    public function __construct()
    {
        $this->initializeLogger();
        $this->loadConfiguration();
        $this->initializeModeExecutor();
    }

    /**
     * Initialize logger
     */
    private function initializeLogger()
    {
        $this->logger = new class {
            private $logFile;

            public function __construct()
            {
                $this->logFile = __DIR__ . '/mcp-logs/' . date('Y-m-d') . '.log';
                if (!is_dir(__DIR__ . '/mcp-logs')) {
                    mkdir(__DIR__ . '/mcp-logs', 0755, true);
                }
            }

            public function info($message)
            {
                $this->log("[INFO] " . $message);
            }

            public function error($message)
            {
                $this->log("[ERROR] " . $message);
            }

            public function debug($message)
            {
                $this->log("[DEBUG] " . $message);
            }

            private function log($message)
            {
                $timestamp = date('Y-m-d H:i:s');
                $logEntry = "{$timestamp} {$message}\n";
                file_put_contents($this->logFile, $logEntry, FILE_APPEND);
            }
        };
    }

    /**
     * Load configuration
     */
    private function loadConfiguration()
    {
        $configPath = __DIR__ . '/mcp-config.json';
        if (file_exists($configPath)) {
            $this->config = json_decode(file_get_contents($configPath), true);
            $this->logger->info("Configuration loaded successfully");
        } else {
            $this->logger->error("Configuration file not found: {$configPath}");
            throw new Exception("Configuration file not found");
        }
    }

    /**
     * Initialize mode executor
     */
    private function initializeModeExecutor()
    {
        try {
            $this->modeExecutor = new ModeExecutor();
            $this->logger->info("Mode executor initialized successfully");
        } catch (Exception $e) {
            $this->logger->error("Failed to initialize mode executor: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle MCP request
     */
    public function handleRequest($request)
    {
        $this->logger->debug("Received request: " . json_encode($request));

        try {
            switch ($request['method'] ?? '') {
                case 'execute_mode':
                    return $this->handleExecuteMode($request['params'] ?? []);
                case 'get_modes':
                    return $this->handleGetModes();
                case 'get_mode_info':
                    return $this->handleGetModeInfo($request['params'] ?? []);
                case 'get_project_info':
                    return $this->handleGetProjectInfo();
                case 'get_available_tools':
                    return $this->handleGetAvailableTools($request['params'] ?? []);
                case 'validate_configuration':
                    return $this->handleValidateConfiguration($request['params'] ?? []);
                case 'run_code_quality_check':
                    return $this->handleRunCodeQualityCheck($request['params'] ?? []);
                case 'run_security_scan':
                    return $this->handleRunSecurityScan($request['params'] ?? []);
                case 'run_performance_analysis':
                    return $this->handleRunPerformanceAnalysis($request['params'] ?? []);
                case 'get_execution_history':
                    return $this->handleGetExecutionHistory($request['params'] ?? []);
                case 'clear_execution_history':
                    return $this->handleClearExecutionHistory();
                default:
                    throw new Exception("Unknown method: " . ($request['method'] ?? ''));
            }
        } catch (Exception $e) {
            $this->logger->error("Request failed: " . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'timestamp' => time()
            ];
        }
    }

    /**
     * Handle execute_mode request
     */
    private function handleExecuteMode($params)
    {
        $mode = $params['mode'] ?? '';
        $context = $params['context'] ?? [];

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        $result = $this->modeExecutor->executeMode($mode, $context);

        return [
            'success' => $result['success'],
            'mode' => $result['mode'],
            'result' => $result['result'] ?? null,
            'execution_time' => $result['execution_time'] ?? 0,
            'timestamp' => $result['timestamp'] ?? time()
        ];
    }

    /**
     * Handle get_modes request
     */
    private function handleGetModes()
    {
        return [
            'modes' => $this->modeExecutor->getAvailableModes(),
            'timestamp' => time()
        ];
    }

    /**
     * Handle get_mode_info request
     */
    private function handleGetModeInfo($params)
    {
        $mode = $params['mode'] ?? '';

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        return [
            'mode' => $mode,
            'info' => $this->modeExecutor->getModeInfo($mode),
            'timestamp' => time()
        ];
    }

    /**
     * Handle get_project_info request
     */
    private function handleGetProjectInfo()
    {
        return [
            'project' => $this->modeExecutor->getProjectInfo(),
            'timestamp' => time()
        ];
    }

    /**
     * Handle get_available_tools request
     */
    private function handleGetAvailableTools($params)
    {
        $mode = $params['mode'] ?? '';

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        $modeInfo = $this->modeExecutor->getModeInfo($mode);
        $tools = $modeInfo['tools'] ?? [];

        return [
            'mode' => $mode,
            'tools' => $tools,
            'timestamp' => time()
        ];
    }

    /**
     * Handle validate_configuration request
     */
    private function handleValidateConfiguration($params)
    {
        $mode = $params['mode'] ?? '';

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        // Get mode configuration
        $config = $this->modeExecutor->getModeConfiguration($mode);

        // Validate configuration
        $validationResult = $this->validateModeConfiguration($mode, $config);

        return [
            'mode' => $mode,
            'valid' => $validationResult['valid'],
            'errors' => $validationResult['errors'],
            'warnings' => $validationResult['warnings'],
            'timestamp' => time()
        ];
    }

    /**
     * Validate mode configuration
     */
    private function validateModeConfiguration($mode, $config)
    {
        $errors = [];
        $warnings = [];

        // Check required configuration
        $requiredConfig = [
            'php-dev' => ['php_version', 'standards', 'security_patterns'],
            'dashboard-ui' => ['responsive_design', 'accessibility_compliance'],
            'database-admin' => ['schema_design', 'query_optimization']
        ];

        if (isset($requiredConfig[$mode])) {
            foreach ($requiredConfig[$mode] as $configKey) {
                if (!isset($config[$configKey]) || empty($config[$configKey])) {
                    $errors[] = "Missing required configuration: {$configKey}";
                }
            }
        }

        // Check tool availability
        $availableTools = $this->getAvailableToolsForMode($mode);
        $configuredTools = $config['tools'] ?? [];

        foreach ($configuredTools as $tool) {
            if (!in_array($tool, $availableTools)) {
                $errors[] = "Unknown tool configured: {$tool}";
            }
        }

        // Check version compatibility
        if (isset($config['php_version'])) {
            $phpVersion = $config['php_version'];
            if (version_compare($phpVersion, '8.3.0', '<')) {
                $warnings[] = "PHP version {$phpVersion} may not be fully compatible";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings
        ];
    }

    /**
     * Get available tools for mode
     */
    private function getAvailableToolsForMode($mode)
    {
        $tools = [
            'php-dev' => ['phpstan', 'phpcs', 'phpunit', 'composer'],
            'dashboard-ui' => ['eslint', 'stylelint', 'html-validator', 'lighthouse'],
            'database-admin' => ['mysql', 'redis', 'phpmyadmin', 'mysqldump']
        ];

        return $tools[$mode] ?? [];
    }

    /**
     * Handle run_code_quality_check request
     */
    private function handleRunCodeQualityCheck($params)
    {
        $mode = $params['mode'] ?? '';
        $threshold = $params['threshold'] ?? 80;

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        // Execute mode to get quality metrics
        $result = $this->modeExecutor->executeMode($mode);

        if (!$result['success']) {
            throw new Exception("Mode execution failed: " . $result['error']);
        }

        // Get quality metrics
        $qualityMetrics = $this->getQualityMetrics($mode, $result['result']);

        // Check against threshold
        $qualityScore = $qualityMetrics['overall'] ?? 0;
        $qualityPassed = $qualityScore >= $threshold;

        return [
            'mode' => $mode,
            'quality_score' => $qualityScore,
            'threshold' => $threshold,
            'passed' => $qualityPassed,
            'metrics' => $qualityMetrics,
            'timestamp' => time()
        ];
    }

    /**
     * Get quality metrics
     */
    private function getQualityMetrics($mode, $result)
    {
        $metrics = [
            'php-dev' => [
                'code_quality' => $result['metrics']['code_quality'] ?? 0,
                'test_coverage' => $result['metrics']['test_coverage'] ?? 0,
                'security_score' => $result['metrics']['security_score'] ?? 0,
                'performance_score' => $result['metrics']['performance_score'] ?? 0,
                'overall' => ($result['metrics']['code_quality'] ?? 0) * 0.4 +
                             ($result['metrics']['test_coverage'] ?? 0) * 0.3 +
                             ($result['metrics']['security_score'] ?? 0) * 0.2 +
                             ($result['metrics']['performance_score'] ?? 0) * 0.1
            ],
            'dashboard-ui' => [
                'accessibility_score' => $result['metrics']['accessibility_score'] ?? 0,
                'performance_score' => $result['metrics']['performance_score'] ?? 0,
                'seo_score' => $result['metrics']['seo_score'] ?? 0,
                'best_practices_score' => $result['metrics']['best_practices_score'] ?? 0,
                'overall' => ($result['metrics']['accessibility_score'] ?? 0) * 0.3 +
                             ($result['metrics']['performance_score'] ?? 0) * 0.3 +
                             ($result['metrics']['seo_score'] ?? 0) * 0.2 +
                             ($result['metrics']['best_practices_score'] ?? 0) * 0.2
            ],
            'database-admin' => [
                'schema_quality' => $result['metrics']['schema_quality'] ?? 0,
                'query_performance' => $result['metrics']['query_performance'] ?? 0,
                'security_score' => $result['metrics']['security_score'] ?? 0,
                'backup_compliance' => $result['metrics']['backup_compliance'] ?? 0,
                'overall' => ($result['metrics']['schema_quality'] ?? 0) * 0.3 +
                             ($result['metrics']['query_performance'] ?? 0) * 0.3 +
                             ($result['metrics']['security_score'] ?? 0) * 0.2 +
                             ($result['metrics']['backup_compliance'] ?? 0) * 0.2
            ]
        ];

        return $metrics[$mode] ?? ['overall' => 0];
    }

    /**
     * Handle run_security_scan request
     */
    private function handleRunSecurityScan($params)
    {
        $mode = $params['mode'] ?? '';

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        // Execute mode to get security results
        $result = $this->modeExecutor->executeMode($mode);

        if (!$result['success']) {
            throw new Exception("Mode execution failed: " . $result['error']);
        }

        // Get security results
        $securityResults = $this->getSecurityResults($mode, $result['result']);

        return [
            'mode' => $mode,
            'vulnerabilities' => $securityResults['vulnerabilities'] ?? [],
            'severity_levels' => $securityResults['severity_levels'] ?? [],
            'overall_score' => $securityResults['overall_score'] ?? 0,
            'timestamp' => time()
        ];
    }

    /**
     * Get security results
     */
    private function getSecurityResults($mode, $result)
    {
        $results = [
            'php-dev' => [
                'vulnerabilities' => $result['security_vulnerabilities'] ?? [],
                'severity_levels' => $result['security_severity_levels'] ?? [],
                'overall_score' => $result['security_score'] ?? 0
            ],
            'dashboard-ui' => [
                'vulnerabilities' => $result['security_vulnerabilities'] ?? [],
                'severity_levels' => $result['security_severity_levels'] ?? [],
                'overall_score' => $result['security_score'] ?? 0
            ],
            'database-admin' => [
                'vulnerabilities' => $result['security_vulnerabilities'] ?? [],
                'severity_levels' => $result['security_severity_levels'] ?? [],
                'overall_score' => $result['security_score'] ?? 0
            ]
        ];

        return $results[$mode] ?? ['overall_score' => 0];
    }

    /**
     * Handle run_performance_analysis request
     */
    private function handleRunPerformanceAnalysis($params)
    {
        $mode = $params['mode'] ?? '';
        $maxExecutionTime = $params['max_execution_time'] ?? 30;

        if (empty($mode)) {
            throw new Exception("Mode parameter is required");
        }

        // Execute mode to get performance results
        $result = $this->modeExecutor->executeMode($mode);

        if (!$result['success']) {
            throw new Exception("Mode execution failed: " . $result['error']);
        }

        // Get performance results
        $performanceResults = $this->getPerformanceResults($mode, $result['result']);

        // Check execution time
        $executionTime = $result['execution_time'] ?? 0;
        $performancePassed = $executionTime <= $maxExecutionTime;

        return [
            'mode' => $mode,
            'execution_time' => $executionTime,
            'max_execution_time' => $maxExecutionTime,
            'passed' => $performancePassed,
            'performance_metrics' => $performanceResults,
            'timestamp' => time()
        ];
    }

    /**
     * Get performance results
     */
    private function getPerformanceResults($mode, $result)
    {
        $results = [
            'php-dev' => [
                'memory_usage' => $result['memory_usage'] ?? 0,
                'cpu_usage' => $result['cpu_usage'] ?? 0,
                'query_performance' => $result['query_performance'] ?? 0,
                'cache_hit_rate' => $result['cache_hit_rate'] ?? 0,
                'overall_score' => $result['performance_score'] ?? 0
            ],
            'dashboard-ui' => [
                'load_time' => $result['load_time'] ?? 0,
                'first_contentful_paint' => $result['first_contentful_paint'] ?? 0,
                'largest_contentful_paint' => $result['largest_contentful_paint'] ?? 0,
                'cumulative_layout_shift' => $result['cumulative_layout_shift'] ?? 0,
                'overall_score' => $result['performance_score'] ?? 0
            ],
            'database-admin' => [
                'query_response_time' => $result['query_response_time'] ?? 0,
                'index_usage' => $result['index_usage'] ?? 0,
                'connection_pool' => $result['connection_pool'] ?? 0,
                'backup_speed' => $result['backup_speed'] ?? 0,
                'overall_score' => $result['performance_score'] ?? 0
            ]
        ];

        return $results[$mode] ?? ['overall_score' => 0];
    }

    /**
     * Handle get_execution_history request
     */
    private function handleGetExecutionHistory($params)
    {
        $limit = $params['limit'] ?? 10;

        $historyFile = __DIR__ . '/mcp-logs/execution_history.json';
        if (file_exists($historyFile)) {
            $history = json_decode(file_get_contents($historyFile), true);
            $recentHistory = array_slice($history, -$limit, $limit, true);
            return [
                'history' => array_reverse($recentHistory),
                'total' => count($history),
                'timestamp' => time()
            ];
        }

        return [
            'history' => [],
            'total' => 0,
            'timestamp' => time()
        ];
    }

    /**
     * Handle clear_execution_history request
     */
    private function handleClearExecutionHistory()
    {
        $historyFile = __DIR__ . '/mcp-logs/execution_history.json';
        if (file_exists($historyFile)) {
            unlink($historyFile);
        }

        return [
            'success' => true,
            'message' => 'Execution history cleared',
            'timestamp' => time()
        ];
    }

    /**
     * Start MCP server
     */
    public function start()
    {
        $this->logger->info("Starting Kilo Code MCP Server");

        // Set up signal handling
        pcntl_signal(SIGTERM, [$this, 'handleSignal']);
        pcntl_signal(SIGINT, [$this, 'handleSignal']);

        // Read requests from stdin
        while (!feof(STDIN)) {
            $input = fgets(STDIN);
            if ($input === false) {
                break;
            }

            $request = json_decode($input, true);
            if ($request === null) {
                $this->logger->error("Invalid JSON request: " . $input);
                continue;
            }

            $response = $this->handleRequest($request);

            // Log execution history
            $this->logExecutionHistory($request, $response);

            // Send response
            echo json_encode($response) . "\n";
            flush();
        }

        $this->logger->info("MCP Server stopped");
    }

    /**
     * Handle signals
     */
    public function handleSignal($signal)
    {
        $this->logger->info("Received signal: {$signal}");
        exit(0);
    }

    /**
     * Log execution history
     */
    private function logExecutionHistory($request, $response)
    {
        $historyFile = __DIR__ . '/mcp-logs/execution_history.json';
        $history = [];

        if (file_exists($historyFile)) {
            $history = json_decode(file_get_contents($historyFile), true);
        }

        $history[] = [
            'request' => $request,
            'response' => $response,
            'timestamp' => time()
        ];

        // Keep only last 1000 entries
        if (count($history) > 1000) {
            $history = array_slice($history, -1000);
        }

        file_put_contents($historyFile, json_encode($history, JSON_PRETTY_PRINT));
    }
}

// Start the server
$server = new KiloCodeMCPServer();
$server->start();
