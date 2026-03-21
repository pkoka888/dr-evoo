import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { logger } from "./utils/logger.js";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0"
});

logger.info("Weather MCP server starting up");

// Secure credential loading function
function loadApiKey(): string {
  // Try Docker secret first (production)
  const secretPath = "/run/secrets/openweather_api_key";
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf8").trim();
  }

  // Fallback to environment variable (development)
  const envKey = process.env.OPENWEATHER_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error("OpenWeather API key not found. Set OPENWEATHER_API_KEY environment variable or provide Docker secret.");
}

// Health check endpoint
server.setRequestHandler("health", async () => {
  return { status: "ok" };
});

// Weather tool
server.tool("get_weather", {
  city: z.string().describe("City name for weather lookup")
}, async ({ city }) => {
  logger.info(`Weather request for city: ${city}`);
  const apiKey = loadApiKey();

  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    const weather = response.data;
    const description = `Weather in ${city}: ${weather.main.temp}°C, ${weather.weather[0].description}, humidity: ${weather.main.humidity}%, wind: ${weather.wind.speed} m/s`;

    logger.info(`Weather data retrieved successfully for ${city}`);
    return {
      content: [{
        type: "text",
        text: description
      }]
    };
  } catch (error) {
    logger.error(`Failed to fetch weather data for ${city}`, error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);