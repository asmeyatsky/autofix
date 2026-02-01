# AutoFix - Usage Guide

## Quick Start

### 1. Installation

```bash
# Install globally
npm install -g autofix-cli

# Or install locally
npm install autofix-cli
```

### 2. Basic Usage

#### Traditional Mode
```bash
# Monitor a running frontend
autofix --url http://localhost:3000

# With custom project directory
autofix --url http://localhost:3000 --project ./src

# With custom AI endpoint
autofix --url http://localhost:3000 --llm-endpoint https://your-ai-api.com/v1
```

#### Agentic Mode (NEW!)
```bash
# Use coordinated AI agents for comprehensive validation and fixing
autofix --url http://localhost:3000 --agentic

# Agentic mode with custom settings
autofix --url http://localhost:3000 --project ./src --agentic --timeout 30000 --max-attempts 5
```

### 3. Configuration File

Create `.autofix.json` in your project:

```json
{
  "url": "http://localhost:3000",
  "project": "./src",
  "agentic": true,
  "llmEndpoint": "https://api.openai.com/v1",
  "timeout": 10000,
  "maxAttempts": 5,
  "headless": false
}
```

### 4. Environment Variables

```bash
export AUTOFIX_LLM_API_KEY="your-api-key"
export AUTOFIX_LLM_ENDPOINT="https://api.openai.com/v1"
export AUTOFIX_PROJECT="./src"

autofix --url http://localhost:3000
```

## Command Options

| Option | Short | Description | Default |
|--------|-------|-------------|----------|
| `--url` | `-u` | Frontend URL to monitor | Required |
| `--project` | `-p` | Project directory | `./` |
| `--llm-endpoint` | `-l` | Custom AI API endpoint | OpenAI |
| `--timeout` | `-t` | Startup timeout (ms) | `10000` |
| `--max-attempts` | `-m` | Maximum fix attempts | `5` |
| `--headless` | | Run without UI | `false` |
| `--agentic` | | Use agentic approach with coordinated agents | `false` |
| `--config` | | Config file path | `.autofix.json` |
| `--help` | `-h` | Show help | |

## How It Works

### Traditional Mode
AutoFix opens your frontend URL and monitors for:
- Console errors and warnings
- Network request failures
- Page load errors
- JavaScript runtime errors

When errors are detected, AutoFix:
- Captures console logs with stack traces
- Records network failures
- Takes screenshots for debugging
- Identifies relevant source files

AutoFix sends error context to an AI:
- Error messages and stack traces
- Relevant source files
- Network error details
- Framework and environment info

The AI provides fixes that AutoFix:
- Validates syntax and correctness
- Creates backups before modifications
- Applies targeted code changes
- Maintains code style and best practices

After applying fixes:
- Refreshes the page automatically
- Re-monitors for remaining errors
- Continues loop until success or max attempts

### Agentic Mode (NEW!)
In agentic mode, multiple specialized agents work together:

1. **LinkChecker Agent**: Discovers and validates all links in your site
2. **AutoFix Agent**: Monitors startup, detects errors, and applies fixes
3. **TestRunner Agent**: Validates fixes with comprehensive tests

The AgentOrchestrator coordinates these agents in a workflow:
- Link validation
- Error monitoring and analysis
- Fix application
- Post-fix testing and validation

## Examples

### React Development Server
```bash
# Start your React app
npm start

# In another terminal, run AutoFix in traditional mode
autofix --url http://localhost:3000 --project ./src

# Or run in agentic mode for comprehensive validation
autofix --url http://localhost:3000 --project ./src --agentic
```

### Vue Development
```bash
# Vue CLI dev server
npm run serve

# Run AutoFix in agentic mode
autofix --url http://localhost:8080 --project ./src --agentic --max-attempts 10
```

### Angular Development
```bash
# Angular dev server
ng serve

# Run AutoFix in agentic mode with longer timeout
autofix --url http://localhost:4200 --project ./src --agentic --timeout 30000
```

### Static HTML Site
```bash
# Serve static files
python -m http.server 8000

# Run AutoFix in agentic mode
autofix --url http://localhost:8000 --project . --agentic --headless
```

## Troubleshooting

### Common Issues

1. **"Cannot find module 'debug'"**
   ```bash
   npm install debug
   ```

2. **"File not found" errors**
   - Check your `--project` path is correct
   - Ensure source files exist in the project directory

3. **AI API errors**
   - Set `AUTOFIX_LLM_API_KEY` environment variable
   - Verify your AI endpoint is accessible

4. **Browser fails to start**
   - Try `--headless` mode if no display available
   - Install Chromium dependencies if needed

5. **Agentic mode issues**
   - Ensure all required dependencies are installed
   - Check that agents can communicate properly

### Debug Mode

For more verbose output:
```bash
DEBUG=puppeteer:* autofix --url http://localhost:3000
```

## Advanced Usage

### Custom AI Integration

Use a custom AI endpoint:
```bash
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --llm-endpoint https://your-custom-ai.com/v1
```

### Agentic Mode with Custom Workflows

Configure specific agent behaviors:
```bash
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --agentic \
  --max-attempts 5 \
  --headless
```

### CI/CD Integration

```bash
# In your CI pipeline
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --agentic \
  --max-attempts 3 \
  --headless \
  --timeout 30000
```

### Multiple Projects

Create separate config files:
```bash
# Project 1 with traditional mode
autofix --config ./project1/.autofix.json

# Project 2 with agentic mode
autofix --config ./project2/.autofix.json
```

## Best Practices

1. **Before Running AutoFix**
   - Commit your code to version control
   - Ensure tests pass locally
   - Have a recent backup

2. **Configuration**
   - Set appropriate timeouts for your app
   - Adjust max attempts based on complexity
   - Use headless mode in CI/CD
   - Enable agentic mode for comprehensive validation

3. **After AutoFix**
   - Review applied changes
   - Run your test suite
   - Commit successful fixes

4. **Agentic Mode Specific**
   - Use for complex debugging scenarios
   - Combine with traditional mode for comprehensive coverage
   - Monitor agent health and performance metrics
   - Regularly update agent configurations

## Support

- Check the README for more details
- Report issues on GitHub
- Review the example in the `examples/` directory