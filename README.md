# AutoFix - Automated Frontend Debugger

AutoFix is a CLI tool that monitors frontend application startup, automatically detects errors, captures console logs, and uses LLM to fix issues until the frontend renders successfully.

## Features

- **Automatic Monitoring**: Continuously monitors frontend startup for errors
- **Error Detection**: Captures console errors and network failures  
- **LLM-Powered Fixes**: Uses AI to automatically fix detected issues
- **Browser Automation**: Opens dev tools, captures logs, and refreshes automatically
- **Continuous Loop**: Keeps trying until the frontend starts successfully
- **Multi-Framework Support**: Works with React, Vue, Angular, and vanilla JS

## Installation

```bash
npm install -g autofix-cli
```

## Usage

```bash
# Monitor a local development server
autofix --url http://localhost:3000

# Monitor with custom LLM endpoint
autofix --url http://localhost:3000 --llm-endpoint https://api.openai.com/v1

# Specify project directory for code modifications
autofix --url http://localhost:3000 --project ./src

# Custom timeout and retry settings
autofix --url http://localhost:3000 --timeout 30000 --max-attempts 10
```

## Options

- `--url, -u`: Frontend URL to monitor (required)
- `--project, -p`: Project directory containing source code (default: ./)
- `--llm-endpoint, -l`: Custom LLM API endpoint
- `--timeout, -t`: Startup timeout in milliseconds (default: 10000)
- `--max-attempts, -m`: Maximum fix attempts (default: 5)
- `--headless`: Run in headless mode (default: false)
- `--help, -h`: Show help

## How It Works

1. **Monitoring**: AutoFix opens your frontend URL and monitors for successful render
2. **Error Detection**: If errors occur, it captures console logs and network errors
3. **LLM Analysis**: Sends error logs and relevant code to an LLM for analysis
4. **Automatic Fixes**: Applies the LLM's suggested fixes to your codebase
5. **Verification**: Refreshes the page and checks if the issue is resolved
6. **Loop**: Continues this process until the frontend starts successfully or max attempts reached

## Configuration

Create an `.autofix.json` file in your project root:

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

## Environment Variables

- `AUTOFIX_LLM_API_KEY`: Your LLM API key
- `AUTOFIX_LLM_ENDPOINT`: Default LLM endpoint
- `AUTOFIX_PROJECT`: Default project directory

## Example Output

```bash
$ autofix --url http://localhost:3000

🔧 AutoFix: Monitoring http://localhost:3000...

⚠️  Error detected: TypeError: Cannot read property 'map' of undefined
📝 Capturing console logs...
🤖 Sending to LLM for analysis...
✅ Fix applied: Updated user component to handle undefined state
🔄 Refreshing page...

✨ Frontend started successfully!
📊 Fixed 2 errors in 3 attempts
🎉 AutoFix complete!
```

## Support

- React, Vue, Angular, Vanilla JavaScript
- Node.js-based build tools
- Modern browsers with Chrome DevTools protocol

## License

MIT