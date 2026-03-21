<?php

/**
 * Mode Executor
 * Handles execution of Kilo Code modes with Cline integration
 *
 * @author Kilo Code Team
 * @version 1.0.0
 */

class ModeExecutor
{
  private $clineManager;
  private $logger;

  public function __construct()
  {
    $this->initializeLogger();
    $this->initializeClineManager();
  }

    /**
     * Initialize Cline manager
     */
    private function initializeClineManager()
    {
        try {
            $clineConfigPath = __DIR__ . '/../../.clinerules/config/production.json';
            if (file_exists($clineConfigPath)) {
                $clineConfig = json_decode(file_get_contents($clineConfigPath), true);
                $this->clineManager = new class($clineConfig) {
                    private $config;
                    private $initialized = false;

                    public function __construct($config)
                    {
                        $this->config = $config;
                        $this->initialized = true;
                    }

                    public function initialize()
                    {
                        $this->initialized = true;
                    }

                    public function getConfig()
                    {
                        return $this->config;
                    }

                    public function isValid()
                    {
                        return $this->initialized && !empty($this->config);
                    }

                    public function getValidationErrors()
                    {
                        $errors = [];
                        if (!$this->initialized) {
                            $errors[] = 'Manager not initialized';
                        }
                        if (empty($this->config)) {
                            $errors[] = 'Configuration not loaded';
                        }
                        return $errors;
                    }

                    public function getClineInfo()
                    {
                        return [
                            'initialized' => $this->initialized,
                            'config_loaded' => !empty($this->config),
                            'version' => '1.0.0'
                        ];
                    }

                    public function shutdown()
                    {
                        $this->initialized = false;
                        $this->config = null;
                    }
                };
                $this->logger->info("Cline Runtime Manager initialized successfully");
            } else {
                throw new Exception("Cline configuration file not found");
            }
        } catch (Exception $e) {
            $this->logger->error("Failed to initialize Cline manager: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Initialize logging system
     */
    private function initializeLogger()
    {
        $this->logger = new class {
            public function info($message)
            {
                error_log("[INFO] [MODE-EXECUTOR] " . $message);
            }

            public function error($message)
            {
                error_log("[ERROR] [MODE-EXECUTOR] " . $message);
            }

            public function debug($message)
            {
                error_log("[DEBUG] [MODE-EXECUTOR] " . $message);
            }
        };
    }

  /**
   * Execute a mode with Cline integration
   *
   * @param string $mode Mode to execute
   * @param array $context Execution context
   * @return array Execution results
   */
  public function executeMode($mode, $context = [])
  {
    $startTime = microtime(true);

    try {
      $this->logger->info("Executing mode: {$mode}");

      // Validate Cline configuration
      if (!$this->clineManager->isValid()) {
        throw new Exception("Cline configuration is invalid: " .
          implode(", ", $this->clineManager->getValidationErrors()));
      }

      // Get mode configuration
      $config = $this->getModeConfiguration($mode);

      // Execute mode
      $result = $this->executeModeImplementation($mode, $context, $config);

      // Validate results with Cline
      $this->validateModeResults($mode, $result);

      // Log execution metrics
      $executionTime = microtime(true) - $startTime;
      $this->logger->info("Mode {$mode} completed successfully in {$executionTime}s");

      return [
        'success' => true,
        'mode' => $mode,
        'result' => $result,
        'execution_time' => $executionTime,
        'timestamp' => time()
      ];
    } catch (Exception $e) {
      $executionTime = microtime(true) - $startTime;
      $this->logger->error("Mode {$mode} failed after {$executionTime}s: " . $e->getMessage());

      return [
        'success' => false,
        'mode' => $mode,
        'error' => $e->getMessage(),
        'execution_time' => $executionTime,
        'timestamp' => time()
      ];
    }
  }

  /**
   * Get mode configuration
   */
  private function getModeConfiguration($mode)
  {
    $config = $this->clineManager->getConfig();

    // Get mode-specific configuration
    $modeConfig = $config['kilo_integration']['modes'][$mode] ?? [];

    // Merge with global configuration
    $globalConfig = $config['kilo_integration']['global'] ?? [];

    return array_merge($globalConfig, $modeConfig);
  }

  /**
   * Execute mode implementation
   */
  private function executeModeImplementation($mode, $context, $config)
  {
    switch ($mode) {
      case 'php-dev':
        return $this->executePhpDevMode($context, $config);
      case 'dashboard-ui':
        return $this->executeDashboardUiMode($context, $config);
      case 'database-admin':
        return $this->executeDatabaseAdminMode($context, $config);
      default:
        throw new Exception("Unknown mode: {$mode}");
    }
  }

  /**
   * Execute PHP development mode
   */
  private function executePhpDevMode($context, $config)
  {
    $this->logger->debug("Executing PHP development mode");

    // Create PHP development mode instance
    $phpDevMode = new PhpDevMode();

    // Execute mode
    return $phpDevMode->execute($context, $config);
  }

  /**
   * Execute dashboard UI mode
   */
  private function executeDashboardUiMode($context, $config)
  {
    $this->logger->debug("Executing dashboard UI mode");

    // Create dashboard UI mode instance
    $dashboardUiMode = new DashboardUiMode();

    // Execute mode
    return $dashboardUiMode->execute($context, $config);
  }

  /**
   * Execute database administration mode
   */
  private function executeDatabaseAdminMode($context, $config)
  {
    $this->logger->debug("Executing database administration mode");

    // Create database administration mode instance
    $databaseAdminMode = new DatabaseAdminMode();

    // Execute mode
    return $databaseAdminMode->execute($context, $config);
  }

  /**
   * Validate mode results
   */
  private function validateModeResults($mode, $result)
  {
    // Get validation rules for the mode
    $validationRules = $this->getValidationRules($mode);

    foreach ($validationRules as $rule) {
      if (isset($rule['enabled']) && $rule['enabled']) {
        $this->applyValidationRule($rule, $result);
      }
    }
  }

  /**
   * Get validation rules for a mode
   */
  private function getValidationRules($mode)
  {
    $config = $this->clineManager->getConfig();

    return $config['kilo_integration']['validation_rules'][$mode] ?? [
      'code_quality' => ['enabled' => true, 'threshold' => 80],
      'security_check' => ['enabled' => true],
      'performance_check' => ['enabled' => true, 'max_execution_time' => 30]
    ];
  }

  /**
   * Apply validation rule
   */
  private function applyValidationRule($rule, $result)
  {
    switch ($rule['type'] ?? '') {
      case 'code_quality':
        $this->validateCodeQuality($rule, $result);
        break;
      case 'security_check':
        $this->validateSecurity($rule, $result);
        break;
      case 'performance_check':
        $this->validatePerformance($rule, $result);
        break;
    }
  }

  /**
   * Validate code quality
   */
  private function validateCodeQuality($rule, $result)
  {
    if (isset($result['metrics']['code_quality'])) {
      $quality = $result['metrics']['code_quality'];
      $threshold = $rule['threshold'] ?? 80;

      if ($quality < $threshold) {
        throw new Exception("Code quality check failed: {$quality}% < {$threshold}%");
      }
    }
  }

  /**
   * Validate security
   */
  private function validateSecurity($rule, $result)
  {
    if (isset($result['metrics']['security_vulnerabilities'])) {
      $vulnerabilities = $result['metrics']['security_vulnerabilities'];

      if ($vulnerabilities > 0) {
        throw new Exception("Security check failed: {$vulnerabilities} vulnerabilities found");
      }
    }
  }

  /**
   * Validate performance
   */
  private function validatePerformance($rule, $result)
  {
    if (isset($result['metrics']['execution_time'])) {
      $executionTime = $result['metrics']['execution_time'];
      $maxTime = $rule['max_execution_time'] ?? 30;

      if ($executionTime > $maxTime) {
        throw new Exception("Performance check failed: {$executionTime}s > {$maxTime}s");
      }
    }
  }

  /**
   * Get available modes
   */
  public function getAvailableModes()
  {
    return [
      'php-dev' => [
        'enabled' => true,
        'description' => 'PHP development mode with code quality tools',
        'file_patterns' => ['*.php', '*.js', '*.css']
      ],
      'dashboard-ui' => [
        'enabled' => true,
        'description' => 'Dashboard UI development mode',
        'file_patterns' => ['*.js', '*.css', '*.html']
      ],
      'database-admin' => [
        'enabled' => true,
        'description' => 'Database administration and migration mode',
        'file_patterns' => ['*.sql', '*.php']
      ]
    ];
  }

  /**
   * Get mode information
   */
  public function getModeInfo($mode)
  {
    $availableModes = $this->getAvailableModes();

    if (!isset($availableModes[$mode])) {
      throw new Exception("Unknown mode: {$mode}");
    }

    return $availableModes[$mode];
  }

  /**
   * Get project information
   */
  public function getProjectInfo()
  {
    $config = $this->clineManager->getConfig();

    return [
      'name' => $config['cline']['project'] ?? 'unknown',
      'type' => $config['cline']['environment'] ?? 'unknown',
      'version' => $config['cline']['version'] ?? 'unknown'
    ];
  }
}
