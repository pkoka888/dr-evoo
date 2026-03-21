#!/usr/bin/env npx ts-node

/**
 * MCP Health Check Script
 * 
 * Checks that all MCP servers are running and healthy.
 * Exit codes:
 *   0 - All servers healthy
 *   1 - One or more servers are down
 */

interface MCPServer {
  name: string;
  url: string;
  description: string;
}

interface HealthResult {
  server: MCPServer;
  healthy: boolean;
  responseTime?: number;
  error?: string;
}

const MCP_SERVERS: MCPServer[] = [
  {
    name: "saleor",
    url: "http://localhost:3100",
    description: "Saleor GraphQL context"
  },
  {
    name: "postgres",
    url: "http://localhost:3101",
    description: "Direct DB read-only"
  },
  {
    name: "fetch",
    url: "http://localhost:3102",
    description: "Web fetch tool"
  }
];

/**
 * Check health of a single MCP server
 */
async function checkServerHealth(server: MCPServer): Promise<HealthResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${server.url}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        server,
        healthy: true,
        responseTime
      };
    } else {
      return {
        server,
        healthy: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      server,
      healthy: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Main health check function
 */
async function main(): Promise<void> {
  console.log("=".repeat(50));
  console.log("MCP Server Health Check");
  console.log("=".repeat(50));
  console.log();
  
  const results: HealthResult[] = [];
  let allHealthy = true;
  
  for (const server of MCP_SERVERS) {
    console.log(`Checking ${server.name} (${server.url})...`);
    const result = await checkServerHealth(server);
    results.push(result);
    
    if (result.healthy) {
      console.log(`  ✓ ${server.name} is healthy (${result.responseTime}ms)`);
    } else {
      console.log(`  ✗ ${server.name} is DOWN: ${result.error}`);
      allHealthy = false;
    }
    console.log();
  }
  
  // Summary
  console.log("-".repeat(50));
  console.log("Summary:");
  console.log("-".repeat(50));
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(`Healthy: ${healthyCount}/${totalCount}`);
  console.log();
  
  for (const result of results) {
    const status = result.healthy ? "✓" : "✗";
    console.log(`  ${status} ${result.server.name}: ${result.server.description}`);
  }
  
  console.log();
  
  if (allHealthy) {
    console.log("All MCP servers are running correctly!");
    process.exit(0);
  } else {
    console.error("ERROR: One or more MCP servers are not responding!");
    process.exit(1);
  }
}

// Run the health check
main().catch((error) => {
  console.error("Health check failed:", error);
  process.exit(1);
});
