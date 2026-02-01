# AutoFix - User Guide

## 🚀 Quick Start

### Step 1: Installation

#### Option A: Install Globally (Recommended)
```bash
# Clone the repository
git clone https://github.com/asmeyatsky/autofix.git
cd autofix

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .

# Verify installation
autofix --help
```

#### Option B: Run Locally
```bash
# Clone the repository
git clone https://github.com/asmeyatsky/autofix.git
cd autofix

# Install dependencies
npm install

# Build the project
npm run build

# Run directly
node dist/cli.js --help
```

### Step 2: Setup LLM API Key

AutoFix uses an LLM (Large Language Model) to analyze and fix code errors. You'll need an API key:

#### Using OpenAI (Recommended)
```bash
# Set your OpenAI API key
export AUTOFIX_LLM_API_KEY="sk-your-openai-api-key-here"

# Verify the key is set
echo $AUTOFIX_LLM_API_KEY
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and set it as shown above

### Step 3: Test AutoFix

#### Test 1: Help Command
```bash
# Should show help message
autofix --help
```

Expected output:
```
Usage: autofix [options]

Automated Frontend Debugger - CLI tool that monitors frontend startup and fixes
errors automatically

Options:
  -V, --version                output the version number
  -u, --url <url>              Frontend URL to monitor
  -p, --project <path>         Project directory containing source code
                               (default: "./")
  -l, --llm-endpoint <url>     Custom LLM API endpoint
  -t, --timeout <ms>           Startup timeout in milliseconds (default:
                               "10000")
  -m, --max-attempts <number>  Maximum fix attempts (default: "5")
      --headless               Run in headless mode (default: false)
      --config <path>          Path to config file (default: ".autofix.json")
  -h, --help                   display help for command
```

#### Test 2: Built-in Demo
```bash
# Run the demo script (macOS/Linux)
./demo.sh

# Or run manually (Windows)
cd examples
npm install
npm run dev &
# In another terminal:
autofix --url http://localhost:3000 --project ./examples --max-attempts 2
```

## 🎯 Real-World Usage

### Scenario 1: React Development Server

#### Setup
```bash
# Create a simple React app (if you don't have one)
npx create-react-app my-react-app
cd my-react-app

# Start the development server
npm start
```

#### Add an Intentional Error
Edit `src/App.js` and add this error:
```javascript
import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This will cause an error
    const name = user.name.toUpperCase(); // Error: Cannot read property 'name' of null
    console.log(name);
  }, []);

  return (
    <div className="App">
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
```

#### Run AutoFix
```bash
# Terminal 1: Make sure React app is running
npm start

# Terminal 2: Run AutoFix
export AUTOFIX_LLM_API_KEY="your-api-key"
autofix --url http://localhost:3000 --project ./src --max-attempts 3
```

#### What Happens
1. AutoFix opens http://localhost:3000
2. Detects the "Cannot read property 'name' of null" error
3. Captures the console error and stack trace
4. Sends context to LLM for analysis
5. LLM suggests adding a null check
6. AutoFix applies the fix to `src/App.js`
7. Refreshes the page to verify the fix

### Scenario 2: Vue.js Development

#### Setup
```bash
# Create Vue app
npm create vue@latest my-vue-app
cd my-vue-app
npm install
npm run dev
```

#### Add Error
Edit `src/App.vue`:
```vue
<template>
  <div id="app">
    <h1>{{ user.name }}</h1> <!-- Error: user is undefined -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // user is missing
    }
  }
}
</script>
```

#### Run AutoFix
```bash
export AUTOFIX_LLM_API_KEY="your-api-key"
autofix --url http://localhost:5173 --project ./src --max-attempts 3
```

### Scenario 3: Static HTML with JavaScript

#### Create Test Files
```bash
mkdir test-site
cd test-site
```

Create `index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Site</title>
</head>
<body>
    <div id="app"></div>
    <script src="app.js"></script>
</body>
</html>
```

Create `app.js` (with error):
```javascript
// This will cause an error
const data = undefined;
const items = data.items.map(item => item.name); // Error: Cannot read property 'map' of undefined

document.getElementById('app').innerHTML = `<h1>Items: ${items.length}</h1>`;
```

#### Run AutoFix
```bash
# Start a simple server
python3 -m http.server 8000 &

# Run AutoFix
export AUTOFIX_LLM_API_KEY="your-api-key"
autofix --url http://localhost:8000 --project . --headless --max-attempts 3
```

## ⚙️ Configuration

### Create Config File
Create `.autofix.json` in your project root:

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

### Use Config File
```bash
# AutoFix will automatically read .autofix.json
autofix

# Or specify custom config
autofix --config ./my-config.json
```

### Environment Variables
Create `.env` file:
```bash
# .env
AUTOFIX_LLM_API_KEY=sk-your-openai-api-key-here
AUTOFIX_LLM_ENDPOINT=https://api.openai.com/v1
AUTOFIX_PROJECT=./src
```

Then load it:
```bash
source .env
autofix --url http://localhost:3000
```

## 🔧 Advanced Usage

### Custom LLM Endpoint
If you want to use a different LLM provider:

```bash
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --llm-endpoint https://your-custom-llm.com/v1 \
  --max-attempts 10
```

### Headless Mode (for CI/CD)
```bash
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --headless \
  --max-attempts 5 \
  --timeout 30000
```

### High-Performance Monitoring
```bash
# Longer timeout for heavy apps
autofix --url http://localhost:3000 --timeout 60000

# More attempts for complex bugs
autofix --url http://localhost:3000 --max-attempts 10

# Monitor multiple projects
autofix --url http://localhost:3000 --project ./frontend
autofix --url http://localhost:8000 --project ./backend
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot find module 'debug'"
```bash
cd /path/to/autofix
npm install debug
npm run build
```

#### 2. "File not found" errors
```bash
# Check your project path
ls -la ./src

# Use absolute path
autofix --url http://localhost:3000 --project /full/path/to/src
```

#### 3. LLM API errors
```bash
# Verify your API key
echo $AUTOFIX_LLM_API_KEY

# Test API connectivity
curl -H "Authorization: Bearer $AUTOFIX_LLM_API_KEY" \
     https://api.openai.com/v1/models
```

#### 4. Browser fails to start
```bash
# Try headless mode
autofix --url http://localhost:3000 --headless

# Install Chromium dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y chromium-browser

# On macOS with Homebrew
brew install chromium
```

#### 5. "Module not found" errors
```bash
# Ensure you're in the right directory
cd /path/to/autofix
node dist/cli.js --help

# Or install globally
npm install -g .
autofix --help
```

### Debug Mode
Get verbose output:

```bash
# Enable debug logging
DEBUG=puppeteer:* autofix --url http://localhost:3000

# Or check AutoFix logs
autofix --url http://localhost:3000 2>&1 | tee autofix.log
```

### Recovery

#### Rollback Changes
If AutoFix makes unwanted changes:

```bash
# Find backup files
find ./src -name "*.autofix.backup.*"

# Restore from backup (example)
cp ./src/App.js.autofix.backup.1234567890 ./src/App.js
```

#### Manual Intervention
If AutoFix gets stuck:

1. Check `autofix.log` for errors
2. Verify the frontend URL is accessible
3. Check your LLM API key and quota
4. Try reducing `--max-attempts` and `--timeout`

## 📊 Monitoring Results

### Success Output
```
🔧 AutoFix: Automated Frontend Debugger

📁 Project: /Users/user/my-app/src
🌐 URL: http://localhost:3000
⏱️  Timeout: 10000ms
🔄 Max Attempts: 5

🚀 Starting AutoFix monitoring...

🔄 Attempt 1/5
🔧 Monitoring frontend startup...
✅ Frontend started successfully!
⏱️  Startup time: 2.3s

✨ Frontend started successfully!
📊 Fixed 0 errors in 1 attempts
🎉 AutoFix complete!
```

### Error and Fix Output
```
🔄 Attempt 1/5
🔧 Monitoring frontend startup...
❌ Error detected: TypeError: Cannot read property 'name' of null
📝 Capturing console logs...
🤖 Sending to LLM for analysis...
✅ Fix applied: Updated user component to handle undefined state
🔄 Refreshing page...

🔄 Attempt 2/5
🔧 Monitoring frontend startup...
✅ Frontend started successfully!
⏱️  Startup time: 3.1s

✨ Frontend started successfully!
📊 Fixed 1 errors in 2 attempts
🎉 AutoFix complete!
```

## 🎓 Best Practices

### Before Running AutoFix
1. **Commit your code** - Always have version control
2. **Run tests** - Ensure your test suite passes
3. **Check environment** - Verify dev server is running
4. **Set API key** - Ensure LLM access is configured

### During AutoFix Operation
1. **Monitor logs** - Watch the output for progress
2. **Check fixes** - Review applied changes
3. **Test manually** - Verify the application works as expected
4. **Have patience** - Some fixes may require multiple attempts

### After AutoFix Completes
1. **Review changes** - Check all modified files
2. **Run tests** - Ensure nothing is broken
3. **Commit fixes** - Save the working changes
4. **Document issues** - Note any recurring problems

### Integration Tips

#### CI/CD Pipeline
```bash
# In your CI script
export AUTOFIX_LLM_API_KEY=$OPENAI_API_KEY
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --headless \
  --max-attempts 3 \
  --timeout 30000
```

#### Team Usage
```bash
# Share configuration file
git add .autofix.json
git commit -m "Add AutoFix configuration"

# Each team member sets their API key
export AUTOFIX_LLM_API_KEY="personal-api-key"
autofix
```

#### Multiple Environments
```bash
# Development
autofix --config ./config/dev.autofix.json

# Staging
autofix --config ./config/staging.autofix.json

# Production (read-only check)
autofix --url https://app.example.com --headless --max-attempts 1
```

## 🆘 Getting Help

### Resources
- **GitHub Repository**: https://github.com/asmeyatsky/autofix
- **Documentation**: Check `README.md` and `USAGE.md`
- **Examples**: See `examples/` directory

### Reporting Issues
If you encounter problems:
1. Check the troubleshooting section above
2. Enable debug mode and save logs
3. Create an issue on GitHub with details
4. Include your OS, Node.js version, and error output

### Feature Requests
Have ideas for improvement?
1. Check existing GitHub issues
2. Create a new feature request
3. Describe the use case and expected behavior

---

**Happy debugging! 🎉** 

Remember: AutoFix is designed to assist developers, not replace them. Always review automated changes and use your judgment when applying fixes.