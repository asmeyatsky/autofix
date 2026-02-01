# AutoFix - Agentic Frontend Debugger & Validator

AutoFix is an advanced CLI tool that combines automated frontend debugging with coordinated AI agents for comprehensive validation and fixing of web applications. It monitors frontend application startup, automatically detects errors, validates links, runs tests, and uses AI to fix issues until the frontend renders successfully.

## Features

- **Agentic Architecture**: Modular agent system with coordinated workflows
- **Automatic Monitoring**: Continuously monitors frontend startup for errors
- **Error Detection**: Captures console errors and network failures
- **AI-Powered Fixes**: Uses AI to automatically fix detected issues
- **Link Validation**: Checks for broken links and validates site structure
- **Comprehensive Testing**: Runs unit, E2E, visual, and security tests
- **Browser Automation**: Opens dev tools, captures logs, and refreshes automatically
- **Continuous Loop**: Keeps trying until the frontend starts successfully
- **Multi-Framework Support**: Works with React, Vue, Angular, and vanilla JS

## Installation

```bash
npm install -g autofix-cli
```

## Usage

### Traditional Mode
```bash
# Monitor a local development server
autofix --url http://localhost:3000

# Monitor with custom AI endpoint
autofix --url http://localhost:3000 --llm-endpoint https://api.openai.com/v1

# Specify project directory for code modifications
autofix --url http://localhost:3000 --project ./src

# Custom timeout and retry settings
autofix --url http://localhost:3000 --timeout 30000 --max-attempts 10
```

### Agentic Mode (NEW!)
```bash
# Use coordinated AI agents for comprehensive validation and fixing
autofix --url http://localhost:3000 --agentic

# Agentic mode with custom settings
autofix --url http://localhost:3000 --project ./src --agentic --timeout 30000 --max-attempts 5
```

## Options

- `--url, -u`: Frontend URL to monitor (required)
- `--project, -p`: Project directory containing source code (default: ./)
- `--llm-endpoint, -l`: Custom AI API endpoint
- `--timeout, -t`: Startup timeout in milliseconds (default: 10000)
- `--max-attempts, -m`: Maximum fix attempts (default: 5)
- `--headless`: Run in headless mode (default: false)
- `--agentic`: Use agentic approach with coordinated agents (default: false)
- `--help, -h`: Show help

## How It Works

### Traditional Mode
1. **Monitoring**: AutoFix opens your frontend URL and monitors for successful render
2. **Error Detection**: If errors occur, it captures console logs and network errors
3. **AI Analysis**: Sends error logs and relevant code to an AI for analysis
4. **Automatic Fixes**: Applies the AI's suggested fixes to your codebase
5. **Verification**: Refreshes the page and checks if the issue is resolved
6. **Loop**: Continues this process until the frontend starts successfully or max attempts reached

### Agentic Mode (NEW!)
1. **Agent Coordination**: Multiple specialized agents work together
2. **Link Validation**: LinkChecker agent identifies broken links and validates site structure
3. **Error Monitoring**: AutoFix agent monitors startup and analyzes errors
4. **Fix Application**: AutoFix agent applies necessary fixes to code
5. **Testing Validation**: TestRunner agent validates fixes with comprehensive tests
6. **Workflow Execution**: Coordinated workflow ensures all validation steps complete

## Agent Architecture

### AutoFix Agent
- Error detection and analysis
- Automated code fixing
- Startup monitoring
- Performance metrics collection

### LinkChecker Agent
- Link discovery and cataloging
- Link validation and accessibility checking
- Deep crawl analysis
- Site structure mapping

### TestRunner Agent
- Unit testing execution
- End-to-end browser testing
- Visual regression testing
- Security vulnerability scanning

## Configuration

Create an `.autofix.json` file in your project root:

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

## Environment Variables

- `AUTOFIX_LLM_API_KEY`: Your AI API key
- `AUTOFIX_LLM_ENDPOINT`: Default AI endpoint
- `AUTOFIX_PROJECT`: Default project directory

## Example Output

### Traditional Mode
```bash
$ autofix --url http://localhost:3000

🔧 AutoFix: Monitoring http://localhost:3000...

⚠️  Error detected: TypeError: Cannot read property 'map' of undefined
📝 Capturing console logs...
🤖 Sending to AI for analysis...
✅ Fix applied: Updated user component to handle undefined state
🔄 Refreshing page...

✨ Frontend started successfully!
📊 Fixed 2 errors in 3 attempts
🎉 AutoFix complete!
```

### Agentic Mode
```bash
$ autofix --url http://localhost:3000 --agentic

🤖 Starting Agent-Based AutoFix...
🔗 Running LinkChecker agent...
🔍 Running AutoFix monitoring...
🔧 Applying fixes...
🧪 Running post-fix validation tests...

✨ Frontend started successfully!
📊 Fixed 3 errors in 2 attempts
🎉 Agentic AutoFix complete!
```

## Support

- React, Vue, Angular, Vanilla JavaScript
- Node.js-based build tools
- Modern browsers with Chrome DevTools protocol
- Agentic workflows with coordinated AI agents

## License

MIT