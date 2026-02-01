# AutoFix Toolkit - Complete Frontend Development Ecosystem

A comprehensive toolkit for frontend development, debugging, and deployment validation. Includes AutoFix, LinkChecker, and CORS Utils - three powerful CLI tools that work together to ensure your web applications are error-free, properly linked, and CORS-compliant.

## 🛠️ Tools Overview

### 🔧 AutoFix - Automated Frontend Debugger
- **Purpose**: Automatically detects and fixes frontend JavaScript errors
- **Features**: Browser monitoring, LLM-powered fixes, backup/rollback
- **Best for**: Runtime errors, console errors, component failures

### 🔗 LinkChecker - Dead Link Finder
- **Purpose**: Crawls websites and identifies broken or dead links  
- **Features**: Multi-depth crawling, multiple output formats, performance metrics
- **Best for**: Broken links, 404 errors, redirect chains

### 🌐 CORS Utils - Cross-Origin Sharing Troubleshooter
- **Purpose**: Diagnoses and fixes CORS issues between frontend and backend
- **Features**: Policy analysis, config generation, interactive wizard
- **Best for**: CORS errors, API access issues, preflight request failures

## 🚀 Quick Start

### Installation Options

#### Option 1: Install All Tools Globally
```bash
# Clone repository
git clone https://github.com/asmeyatsky/autofix.git
cd autofix

# Install and build AutoFix
npm install && npm run build && npm install -g .

# Install and build LinkChecker
cd linkchecker
npm install && npm run build && npm install -g .

# Install and build CORS Utils
cd ../corsutils  
npm install && npm run build && npm install -g .
```

#### Option 2: Install Individually
```bash
# Just AutoFix
git clone https://github.com/asmeyatsky/autofix.git
cd autofix && npm install && npm run build && npm install -g .

# Just LinkChecker
git clone https://github.com/asmeyatsky/autofix.git
cd autofix/linkchecker && npm install && npm run build && npm install -g .

# Just CORS Utils
git clone https://github.com/asmeyatsky/autofix.git
cd autofix/corsutils && npm install && npm run build && npm install -g .
```

## 📖 Usage Examples

### 🔧 AutoFix Examples
```bash
# Fix errors on development server
export AUTOFIX_LLM_API_KEY="your-openai-key"
autofix --url http://localhost:3000 --project ./src

# Quick test with headless mode
autofix --url http://localhost:3000 --project ./src --headless --max-attempts 3
```

### 🔗 LinkChecker Examples
```bash
# Check entire website
linkchecker https://example.com --format html --output report.html

# Quick summary check
linkchecker https://example.com --summary --max-depth 2 --max-pages 50

# Check for broken links only
linkchecker https://example.com --dead-only --format json --output broken-links.json
```

### 🌐 CORS Utils Examples
```bash
# Test CORS on API endpoint
corsutils test http://localhost:8000/api --methods "GET,POST,PUT"

# Analyze frontend/backend CORS setup
corsutils analyze http://localhost:3000 http://localhost:8000

# Generate server configuration
corsutils config express --origins "http://localhost:3000,https://app.example.com"
```

## 🔄 Combined Workflows

### Complete Development Health Check
```bash
# Use the integrated health check script
./complete-health-check.sh http://localhost:3000 http://localhost:8000 ./src
```

### Individual Tool Integration
```bash
# Step 1: Check for broken links
linkchecker http://localhost:3000 --format json --output links.json

# Step 2: Fix frontend errors  
export AUTOFIX_LLM_API_KEY="your-key"
autofix --url http://localhost:3000 --project ./src --max-attempts 5

# Step 3: Verify CORS configuration
corsutils analyze http://localhost:3000 http://localhost:8000
```

### CI/CD Pipeline Integration
```bash
#!/bin/bash
# Health check for CI/CD

# Install tools
npm install -g autofix linkchecker corsutils

# Set API key
export AUTOFIX_LLM_API_KEY=$OPENAI_API_KEY

# Run checks
linkchecker $FRONTEND_URL --format json --output links.json --summary
autofix --url $FRONTEND_URL --project ./src --headless --max-attempts 2
corsutils analyze $FRONTEND_URL $BACKEND_URL

# Generate combined report
node generate-ci-report.js
```

## 🎯 Real-World Scenarios

### Scenario 1: E-commerce Site Launch
```bash
# 1. Comprehensive link check
linkchecker https://staging-shop.com \
  --max-depth 5 \
  --max-pages 1000 \
  --format html \
  --output pre-launch-report.html

# 2. Frontend error monitoring
export AUTOFIX_LLM_API_KEY="production-key"
autofix --url https://staging-shop.com \
  --project ./src \
  --max-attempts 5 \
  --timeout 30000

# 3. CORS validation for checkout API
corsutils analyze https://staging-shop.com https://api.staging-shop.com
```

### Scenario 2: React Application Development
```bash
# Development server setup
npm start &
sleep 5

# Monitor for React errors
autofix --url http://localhost:3000 --project ./src --headless false

# Test API integration CORS
corsutils test http://localhost:8000/api --methods "GET,POST,PUT,DELETE"

# Check for broken navigation links
linkchecker http://localhost:3000 --include "/products" "/cart" "/profile"
```

### Scenario 3: API Documentation Site
```bash
# Check API docs for broken links
linkchecker https://docs.example.com \
  --max-depth 6 \
  --exclude "\.pdf$" ".*edit.*" \
  --format markdown \
  --output api-docs-report.md

# Test CORS for API endpoints
corsutils suite https://api.example.com/users https://api.example.com/auth

# Generate CORS config for documentation server
corsutils config nginx --origins "https://docs.example.com"
```

## 📊 Output & Reports

### AutoFix Reports
```
🔧 AutoFix: Automated Frontend Debugger
📁 Project: /Users/user/my-app/src
🌐 URL: http://localhost:3000

🔄 Attempt 2/5
❌ Error detected: TypeError: Cannot read property 'name' of null
🤖 Sending to LLM for analysis...
✅ Fix applied: Updated user component to handle undefined state
🔄 Refreshing page...

✨ Frontend started successfully!
📊 Fixed 1 errors in 2 attempts
🎉 AutoFix complete!
```

### LinkChecker Reports
```
🔗 LinkChecker: Dead Link Finder
🌐 Starting from: https://example.com

📈 Crawling Summary:
   Total pages crawled: 234
   Total links checked: 1,847
   ✅ Valid links: 1,842
   ❌ Dead/broken links: 3
   🚨 Errors: 2
   📉 Error rate: 0.27%
```

### CORS Utils Reports
```
🌐 CORS Analysis Report
🔍 Analyzing CORS setup...
   Frontend: http://localhost:3000
   Backend:  http://localhost:8000

Issues Found:
   ❌ Missing Access-Control-Allow-Origin header for http://localhost:8000
   ❌ Missing Access-Control-Allow-Methods header for http://localhost:8000

Recommendations:
   💡 Configure CORS middleware on your backend server
   💡 Ensure your frontend origin is included in allowed origins

Suggested Configuration:
   Origin: http://localhost:3000
   Methods: GET, POST, PUT, DELETE, OPTIONS
   Allowed Headers: Content-Type, Authorization, X-Requested-With
   Credentials: true
   Max Age: 86400
```

## 🔧 Configuration Files

### AutoFix Configuration (.autofix.json)
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

### LinkChecker Configuration (linkchecker.config.json)
```json
{
  "maxDepth": 4,
  "maxPages": 500,
  "concurrency": 3,
  "delay": 200,
  "timeout": 30000,
  "format": "json",
  "excludePatterns": ["\\.pdf$", "\\.jpg$"],
  "domains": ["example.com"]
}
```

### CORS Server Configuration
```javascript
// Express.js
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));
```

## 🚀 Advanced Features

### AutoFix LLM Integration
- **OpenAI GPT-4**: Advanced error analysis and fixes
- **Custom Endpoints**: Use your own LLM API
- **Error Context**: Includes console logs, stack traces, and DOM info
- **Safe Modifications**: Automatic backups before changes
- **Rollback**: Restore previous state if fixes cause issues

### LinkChecker Performance
- **Concurrent Crawling**: Up to 10 parallel requests
- **Smart Filtering**: Include/exclude patterns and domain limits
- **Rate Limiting**: Respectful crawling with configurable delays
- **Memory Management**: Handles large sites efficiently
- **Multiple Formats**: JSON, CSV, HTML, Markdown outputs

### CORS Utils Intelligence
- **Preflight Testing**: OPTIONS request validation
- **Policy Analysis**: Header compliance checking
- **Config Generation**: 11+ server framework configurations
- **Interactive Wizard**: Step-by-step troubleshooting
- **Multi-Origin Support**: Handle complex origin scenarios

## 🛠️ Development & Contributing

### Project Structure
```
autofix/
├── src/                    # AutoFix source code
│   ├── cli.ts              # AutoFix CLI interface
│   ├── core/                # Core AutoFix functionality
│   └── utils/               # Utility functions
├── linkchecker/            # LinkChecker tool
│   ├── src/cli.ts           # LinkChecker CLI
│   ├── src/linkchecker.ts   # Core crawler
│   └── src/output-formatter.ts
├── corsutils/              # CORS Utils tool
│   ├── src/cli.ts           # CORS Utils CLI
│   ├── src/cors-tester.ts   # CORS testing logic
│   └── src/config-generator.ts
├── examples/               # Example applications for testing
├── complete-health-check.sh # Integrated health check script
├── combined-workflows.md   # Detailed workflow examples
└── README.md             # This file
```

### Development Setup
```bash
# Clone repository
git clone https://github.com/asmeyatsky/autofix.git
cd autofix

# Install dependencies for all tools
npm install
cd linkchecker && npm install
cd ../corsutils && npm install

# Build all tools
npm run build
cd linkchecker && npm run build
cd ../corsutils && npm run build

# Install globally for testing
npm install -g . ../linkchecker ../corsutils
```

### Testing
```bash
# Test AutoFix with example app
cd examples
python3 -m http.server 8000 &
autofix --url http://localhost:8000 --project . --max-attempts 1

# Test LinkChecker
linkchecker http://localhost:8000 --max-depth 2 --format markdown

# Test CORS Utils
corsutils test http://localhost:8000 --methods "GET,POST"
```

## 🔧 Troubleshooting

### Common Installation Issues
```bash
# TypeScript compilation errors
npm install -g typescript
npm run build

# Puppeteer issues (AutoFix/LinkChecker)
npm install puppeteer --force
# On macOS: brew install chromium

# Permission errors
sudo npm install -g autofix linkchecker corsutils
# Or use npx instead of global install
```

### Common Runtime Issues
```bash
# AutoFix API key errors
export AUTOFIX_LLM_API_KEY="sk-your-openai-key"

# LinkChecker browser launch fails
# Try headless mode or install dependencies
sudo apt-get install -y libgbm-dev

# CORS Utils connection errors
# Check if servers are running
curl -I http://localhost:3000
curl -I http://localhost:8000
```

## 📋 Feature Comparison

| Feature | AutoFix | LinkChecker | CORS Utils |
|---------|---------|-------------|------------|
| Error Detection | ✅ | ❌ | ❌ |
| Automated Fixes | ✅ | ❌ | ❌ |
| Link Crawling | ❌ | ✅ | ❌ |
| Dead Link Detection | ❌ | ✅ | ❌ |
| CORS Testing | ❌ | ❌ | ✅ |
| Config Generation | ❌ | ❌ | ✅ |
| Interactive Mode | ❌ | ❌ | ✅ |
| CI/CD Integration | ✅ | ✅ | ✅ |
| Multiple Output Formats | ❌ | ✅ | ✅ |
| LLM Integration | ✅ | ❌ | ❌ |

## 🌟 Use Cases

### Development Teams
- **AutoFix**: Fix runtime errors during development
- **LinkChecker**: Ensure no broken links before deployment  
- **CORS Utils**: Resolve API integration issues quickly

### QA/Testing Teams
- **LinkChecker**: Comprehensive link validation
- **CORS Utils**: Cross-origin testing
- **AutoFix**: Monitor for frontend regressions

### DevOps/CI/CD
- **LinkChecker**: Automated link testing in pipelines
- **CORS Utils**: CORS compliance verification
- **AutoFix**: Frontend error monitoring in staging

### Solo Developers
- **Complete Toolkit**: All frontend debugging needs in one place
- **Quick Diagnostics**: Fast issue identification and resolution
- **Learning**: Built-in explanations and best practices

## 🤝️ Community & Support

- **GitHub Repository**: https://github.com/asmeyatsky/autofix
- **Issues & Bugs**: Report via GitHub Issues
- **Feature Requests**: Submit detailed use cases
- **Discussions**: Join community discussions

## 📄 License

MIT License - see LICENSE file for details.

---

**🚀 The Complete Frontend Development Toolkit**

Whether you're a solo developer, part of a team, or managing production infrastructure, AutoFix Toolkit provides everything you need to build, test, and maintain reliable web applications.

**Start building better web experiences today!** 🎉