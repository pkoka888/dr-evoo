# Weather MCP Server

A Model Context Protocol (MCP) server implementation in TypeScript that provides weather information retrieval using the OpenWeatherMap API.

## Features

- **Weather Lookup**: Get current weather conditions for any city
- **Comprehensive Data**: Temperature, humidity, wind speed, weather description
- **API Integration**: Secure OpenWeatherMap API integration
- **Docker Containerized**: Secure container with non-root user execution
- **Health Monitoring**: HTTP health check endpoint for container monitoring

## Security Features

- API key environment variable protection
- Input validation and sanitization
- Non-root user execution in containers
- HTTPS API communication
- Error handling for API failures

## Tools

### get_weather
Retrieves current weather information for a specified city.

**Parameters:**
- `city` (string): City name for weather lookup

**Returns:** Current temperature in Celsius, weather description, humidity, and wind speed.

**Security:** Validates city name input, ensures API key is configured.

## Configuration

### Environment Variables
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key (required)
- `HEALTH_PORT`: Port for health check server (default: `3000`)
- `NODE_ENV`: Environment mode

## Docker Deployment

### Build
```bash
docker build -t mcp-weather-server .
```

### Run
```bash
docker run -p 3000:3000 \
  -e OPENWEATHER_API_KEY=your_api_key \
  -v /host/data:/app/data \
  -v /host/logs:/app/logs \
  mcp-weather-server
```

### Docker Compose
The server is configured in `.kilocode/docker/docker-compose.mcp.yml` for integration with the MCP Docker setup.

## Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Run
```bash
OPENWEATHER_API_KEY=your_api_key npm start
```

### Test
```bash
npm test
```

### Development with watch
```bash
npm run dev
```

## Health Check

The server provides an HTTP health check endpoint at `http://localhost:3000/health`.

## API Key Setup

1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/)
2. Get your API key from the dashboard
3. Set the `OPENWEATHER_API_KEY` environment variable

## Error Handling

The server implements comprehensive error handling:
- API key validation
- Network error handling
- Invalid city name handling
- Structured logging for debugging

## Architecture

- **Type Safety**: Full TypeScript implementation with strict typing
- **MCP Compliance**: Uses official MCP SDK for protocol compliance
- **Async/Await**: Modern JavaScript async patterns
- **Error Boundaries**: Graceful error handling and recovery

## Integration

This server integrates with Kilo Code's MCP infrastructure and can be configured in `.kilocode/mcp.json` for local development or deployed via Docker Compose for production use.

## License

MIT