# Combined Workflows and Advanced Use Cases

This document provides real-world scenarios and combined workflows using both AutoFix and LinkChecker tools together.

## 🚀 Quick Start Combined Workflow

### Basic Development Setup
```bash
# Terminal 1: Start your development server
npm run dev  # or your preferred dev server

# Terminal 2: Run combined checks
./quick-dev-check.sh http://localhost:3000 ./src
```

Create `quick-dev-check.sh`:
```bash
#!/bin/bash
URL=$1
PROJECT=$2

echo "🔗 Running LinkChecker..."
linkchecker "$URL" --format json --output links.json --summary --max-depth 2

if [ $? -eq 0 ]; then
    echo "✅ No dead links found"
else
    echo "❌ Dead links detected - check links.json"
fi

echo ""
echo "🔧 Running AutoFix..."
autofix --url "$URL" --project "$PROJECT" --max-attempts 3

echo ""
echo "📊 Combined check complete!"
```

## 🎯 Real-World Scenarios

### Scenario 1: E-commerce Site Launch

**Goal**: Ensure new e-commerce site is ready for production

```bash
# Step 1: Comprehensive link check
linkchecker https://staging-shop.example.com \
  --max-depth 5 \
  --max-pages 1000 \
  --concurrency 3 \
  --format html \
  --output pre-launch-report.html \
  --exclude "\.pdf$" "\.jpg$" "\.png$" \
  --delay 200

# Step 2: Fix frontend errors
export AUTOFIX_LLM_API_KEY="your-production-api-key"
autofix \
  --url https://staging-shop.example.com \
  --project ./src \
  --max-attempts 5 \
  --timeout 30000 \
  --headless

# Step 3: Final verification
linkchecker https://staging-shop.example.com \
  --summary \
  --dead-only \
  --format json \
  --output final-check.json
```

**Expected Output**:
```
🔗 LinkChecker: Dead Link Finder
🌐 Starting from: https://staging-shop.example.com

📈 Crawling Summary:
   Total pages crawled: 234
   Total links checked: 1,847
   ✅ Valid links: 1,842
   ❌ Dead/broken links: 3
   🚨 Errors: 2
   📉 Error rate: 0.27%

🔧 AutoFix: Automated Frontend Debugger
📊 Fixed 2 errors in 3 attempts
✨ Frontend ready for production!
```

### Scenario 2: React Application with Router Issues

**Goal**: Fix routing and navigation issues in a React SPA

```bash
# Create React app with intentional routing errors
npx create-react-app router-test
cd router-test
npm install react-router-dom

# Add routing configuration with errors
# (See examples/router-app/ for full code)

# Start dev server
npm start

# In another terminal, run AutoFix
autofix \
  --url http://localhost:3000 \
  --project ./src \
  --max-attempts 5 \
  --timeout 15000

# Check navigation links
linkchecker http://localhost:3000 \
  --max-depth 3 \
  --include "/products" "/about" "/contact" \
  --format markdown \
  --output navigation-report.md
```

### Scenario 3: Vue.js Documentation Site

**Goal**: Ensure documentation site has no broken links

```bash
# VuePress or VitePress site
npm run dev

# Comprehensive link check
linkchecker http://localhost:5173 \
  --max-depth 6 \
  --max-pages 500 \
  --concurrency 2 \
  --delay 300 \
  --format html \
  --output docs-report.html \
  --exclude "\.pdf$" ".*github.com.*edit.*" \
  --user-agent "DocsBot/1.0"

# Fix any frontend JavaScript errors
autofix \
  --url http://localhost:5173 \
  --project ./docs/.vitepress \
  --max-attempts 3 \
  --headless
```

### Scenario 4: Large Enterprise Website Migration

**Goal**: Validate website after domain migration

```bash
# Check old domain for 404s after migration
linkchecker https://old-domain.com \
  --max-depth 4 \
  --max-pages 2000 \
  --concurrency 2 \
  --delay 500 \
  --timeout 60000 \
  --format csv \
  --output migration-check.csv \
  --domains old-domain.com new-domain.com \
  --dead-only

# Check new domain
linkchecker https://new-domain.com \
  --max-depth 5 \
  --max-pages 3000 \
  --concurrency 3 \
  --delay 300 \
  --format html \
  --output new-domain-report.html

# Fix any frontend issues on new domain
autofix \
  --url https://new-domain.com \
  --project ./src \
  --max-attempts 10 \
  --timeout 45000
```

### Scenario 5: API Documentation Site

**Goal**: Ensure API docs and examples work correctly

```bash
# Check API documentation links
linkchecker https://docs.api.example.com \
  --max-depth 3 \
  --include "/api/v1" "/endpoints" "/examples" \
  --exclude ".*\?.*" ".*#.*" \
  --format json \
  --output api-links.json \
  --retries 5 \
  --timeout 30000

# Test interactive examples
autofix \
  --url https://docs.api.example.com \
  --project ./interactive-examples \
  --max-attempts 3 \
  --headless

# Check API endpoints directly
linkchecker https://api.example.com/v1/users \
  --max-depth 1 \
  --format json \
  --output api-endpoints.json
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/quality-check.yml`:

```yaml
name: Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install AutoFix
      run: |
        git clone https://github.com/asmeyatsky/autofix.git
        cd autofix
        npm install
        npm run build
        npm install -g .
        
    - name: Install LinkChecker
      run: |
        cd autofix/linkchecker
        npm install
        npm run build
        npm install -g .
        
    - name: Start development server
      run: |
        npm install
        npm run dev &
        sleep 30
        
    - name: Run LinkChecker
      run: |
        linkchecker http://localhost:3000 \
          --format json \
          --output links-results.json \
          --summary \
          --max-depth 3 \
          --max-pages 100 \
          --dead-only
          
    - name: Run AutoFix
      env:
        AUTOFIX_LLM_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: |
        autofix \
          --url http://localhost:3000 \
          --project ./src \
          --max-attempts 3 \
          --timeout 30000 \
          --headless
          
    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: quality-results
        path: |
          links-results.json
          autofix.log
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh '''
                    npm install
                    git clone https://github.com/asmeyatsky/autofix.git
                    cd autofix && npm install && npm run build
                    cd linkchecker && npm install && npm run build
                '''
            }
        }
        
        stage('Start App') {
            steps {
                sh 'npm run dev &'
                sh 'sleep 30'
            }
        }
        
        stage('Quality Check') {
            parallel {
                stage('LinkChecker') {
                    steps {
                        sh '''
                            node autofix/linkchecker/dist/cli.js http://localhost:3000 \
                                --format json \
                                --output links.json \
                                --summary \
                                --max-depth 3
                        '''
                    }
                }
                
                stage('AutoFix') {
                    steps {
                        withCredentials([string(credentialsId: 'openai-api-key', variable: 'API_KEY')]) {
                            sh '''
                                export AUTOFIX_LLM_API_KEY=$API_KEY
                                node autofix/dist/cli.js \
                                    --url http://localhost:3000 \
                                    --project ./src \
                                    --max-attempts 2 \
                                    --headless
                            '''
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'links.json,autofix.log'
        }
    }
}
```

## 📊 Monitoring and Reporting

### Weekly Site Health Report

Create `weekly-health-check.sh`:

```bash
#!/bin/bash

DATE=$(date +%Y-%m-%d)
REPORT_DIR="reports/$DATE"
mkdir -p "$REPORT_DIR"

echo "🔗 Running comprehensive LinkChecker..."
linkchecker https://example.com \
  --max-depth 6 \
  --max-pages 5000 \
  --concurrency 2 \
  --delay 200 \
  --format html \
  --output "$REPORT_DIR/weekly-links.html" \
  --format csv \
  --output "$REPORT_DIR/weekly-links.csv"

echo "🔧 Running AutoFix on production..."
autofix \
  --url https://example.com \
  --project ./src \
  --max-attempts 5 \
  --timeout 30000 \
  --headless \
  > "$REPORT_DIR/autofix.log" 2>&1

echo "📊 Generating summary..."
cat > "$REPORT_DIR/summary.md" << EOF
# Weekly Site Health Report - $DATE

## LinkChecker Results
- Pages Crawled: $(grep "Total pages crawled" "$REPORT_DIR/weekly-links.html" | grep -o '[0-9]\+' || echo "N/A")
- Links Checked: $(grep "Total links checked" "$REPORT_DIR/weekly-links.html" | grep -o '[0-9]\+' || echo "N/A")
- Dead Links: $(grep "Dead/broken links" "$REPORT_DIR/weekly-links.html" | grep -o '[0-9]\+' || echo "N/A")
- Error Rate: $(grep "Error rate" "$REPORT_DIR/weekly-links.html" | grep -o '[0-9.]\+%' || echo "N/A")

## AutoFix Results
$(tail -20 "$REPORT_DIR/autofix.log")

## Recommendations
- Review dead links in weekly-links.csv
- Check any AutoFix modifications
- Monitor error trends over time
EOF

echo "✅ Report generated: $REPORT_DIR/summary.md"
```

### Real-time Monitoring Dashboard

```bash
# Create monitoring loop
while true; do
    clear
    echo "🔗 Real-time Site Monitor - $(date)"
    echo "================================"
    
    # Quick link check
    linkchecker https://example.com \
        --max-depth 1 \
        --summary \
        --dead-only \
        --format json \
        --output /tmp/quick-check.json \
        --no-color
    
    echo ""
    echo "📊 Last 5 minutes summary:"
    jq '.stats' /tmp/quick-check.json 2>/dev/null || echo "Check failed"
    
    sleep 300 # Wait 5 minutes
done
```

## 🛠️ Advanced Configuration

### Custom Configuration Files

Create `quality-check.config.json`:

```json
{
  "linkchecker": {
    "maxDepth": 4,
    "maxPages": 1000,
    "concurrency": 3,
    "delay": 200,
    "timeout": 30000,
    "retries": 3,
    "format": "json",
    "excludePatterns": [
      "\\.pdf$",
      "\\.jpg$",
      "\\.png$",
      ".*\\.git.*",
      ".*admin.*"
    ]
  },
  "autofix": {
    "maxAttempts": 5,
    "timeout": 20000,
    "headless": true,
    "llmEndpoint": "https://api.openai.com/v1/chat/completions"
  },
  "environments": {
    "development": {
      "url": "http://localhost:3000",
      "project": "./src"
    },
    "staging": {
      "url": "https://staging.example.com",
      "project": "./src"
    },
    "production": {
      "url": "https://example.com",
      "project": "./src"
    }
  }
}
```

### Environment-Specific Scripts

```bash
#!/bin/bash
# quality-check.sh

ENVIRONMENT=${1:-development}
CONFIG_FILE="quality-check.config.json"

# Load configuration
URL=$(jq -r ".environments.$ENVIRONMENT.url" "$CONFIG_FILE")
PROJECT=$(jq -r ".environments.$ENVIRONMENT.project" "$CONFIG_FILE")

MAX_DEPTH=$(jq -r ".linkchecker.maxDepth" "$CONFIG_FILE")
MAX_PAGES=$(jq -r ".linkchecker.maxPages" "$CONFIG_FILE")
CONCURRENCY=$(jq -r ".linkchecker.concurrency" "$CONFIG_FILE")

MAX_ATTEMPTS=$(jq -r ".autofix.maxAttempts" "$CONFIG_FILE")
TIMEOUT=$(jq -r ".autofix.timeout" "$CONFIG_FILE")

echo "🚀 Running quality check for $ENVIRONMENT environment..."
echo "🌐 URL: $URL"
echo "📁 Project: $PROJECT"

# Run LinkChecker
linkchecker "$URL" \
  --max-depth "$MAX_DEPTH" \
  --max-pages "$MAX_PAGES" \
  --concurrency "$CONCURRENCY" \
  --format json \
  --output "links-$ENVIRONMENT.json" \
  --summary

# Run AutoFix
autofix \
  --url "$URL" \
  --project "$PROJECT" \
  --max-attempts "$MAX_ATTEMPTS" \
  --timeout "$TIMEOUT"

echo "✅ Quality check complete for $ENVIRONMENT!"
```

## 🎯 Best Practices

### 1. Progressive Checking Strategy
```bash
# Phase 1: Quick check
linkchecker https://site.com --max-depth 1 --summary

# Phase 2: Deeper check if needed
linkchecker https://site.com --max-depth 3 --max-pages 100

# Phase 3: Full check for production
linkchecker https://site.com --max-depth 5 --max-pages 5000
```

### 2. Error Prioritization
```bash
# Focus on critical pages first
linkchecker https://site.com \
  --include "/checkout" "/login" "/signup" "/api" \
  --dead-only \
  --format json

# Then check secondary content
linkchecker https://site.com \
  --exclude "/checkout|/login|/signup|/api" \
  --max-depth 2
```

### 3. Scheduled Maintenance
```bash
# Daily quick check (cron job)
0 9 * * * /path/to/daily-check.sh

# Weekly comprehensive check
0 2 * * 0 /path/to/weekly-check.sh

# Monthly deep analysis
0 1 1 * * /path/to/monthly-check.sh
```

---

These combined workflows provide a comprehensive approach to website quality assurance using both AutoFix and LinkChecker tools together effectively.