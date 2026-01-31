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

```bash
# Monitor a running frontend
autofix --url http://localhost:3000

# With custom project directory
autofix --url http://localhost:3000 --project ./src

# With custom LLM endpoint
autofix --url http://localhost:3000 --llm-endpoint https://your-llm-api.com/v1
```

### 3. Configuration File

Create `.autofix.json` in your project:

```json
{
  "url": "http://localhost:3000",
  "project": "./src",
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
| `--llm-endpoint` | `-l` | Custom LLM API endpoint | OpenAI |
| `--timeout` | `-t` | Startup timeout (ms) | `10000` |
| `--max-attempts` | `-m` | Maximum fix attempts | `5` |
| `--headless` | | Run without UI | `false` |
| `--config` | | Config file path | `.autofix.json` |
| `--help` | `-h` | Show help | |

## How It Works

### Step 1: Monitoring
AutoFix opens your frontend URL and monitors for:
- Console errors and warnings
- Network request failures
- Page load errors
- JavaScript runtime errors

### Step 2: Error Detection
When errors are detected, AutoFix:
- Captures console logs with stack traces
- Records network failures
- Takes screenshots for debugging
- Identifies relevant source files

### Step 3: LLM Analysis
AutoFix sends error context to an LLM:
- Error messages and stack traces
- Relevant source files
- Network error details
- Framework and environment info

### Step 4: Code Fixing
The LLM provides fixes that AutoFix:
- Validates syntax and correctness
- Creates backups before modifications
- Applies targeted code changes
- Maintains code style and best practices

### Step 5: Verification
After applying fixes:
- Refreshes the page automatically
- Re-monitors for remaining errors
- Continues loop until success or max attempts

## Examples

### React Development Server
```bash
# Start your React app
npm start

# In another terminal, run AutoFix
autofix --url http://localhost:3000 --project ./src
```

### Vue Development
```bash
# Vue CLI dev server
npm run serve

# Run AutoFix
autofix --url http://localhost:8080 --project ./src --max-attempts 10
```

### Angular Development
```bash
# Angular dev server
ng serve

# Run AutoFix with longer timeout
autofix --url http://localhost:4200 --project ./src --timeout 30000
```

### Static HTML Site
```bash
# Serve static files
python -m http.server 8000

# Run AutoFix
autofix --url http://localhost:8000 --project . --headless
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

3. **LLM API errors**
   - Set `AUTOFIX_LLM_API_KEY` environment variable
   - Verify your LLM endpoint is accessible

4. **Browser fails to start**
   - Try `--headless` mode if no display available
   - Install Chromium dependencies if needed

### Debug Mode

For more verbose output:
```bash
DEBUG=puppeteer:* autofix --url http://localhost:3000
```

## Advanced Usage

### Custom LLM Integration

Use a custom LLM endpoint:
```bash
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --llm-endpoint https://your-custom-llm.com/v1
```

### CI/CD Integration

```bash
# In your CI pipeline
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --max-attempts 3 \
  --headless \
  --timeout 30000
```

### Multiple Projects

Create separate config files:
```bash
# Project 1
autofix --config ./project1/.autofix.json

# Project 2  
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

3. **After AutoFix**
   - Review applied changes
   - Run your test suite
   - Commit successful fixes

## Support

- Check the README for more details
- Report issues on GitHub
- Review the example in the `examples/` directory