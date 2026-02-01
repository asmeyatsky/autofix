# LinkChecker - Dead Link Finder CLI

LinkChecker is a powerful CLI tool that crawls websites and identifies dead or broken links. It works alongside AutoFix to provide comprehensive website debugging capabilities.

## Features

- 🔗 **Comprehensive Crawling**: Follows internal links to discover and validate all pages
- ❌ **Dead Link Detection**: Identifies 404s, 5xx errors, and other broken links
- 🔀 **Redirect Tracking**: Monitors redirect chains and 3xx responses
- 📊 **Multiple Output Formats**: JSON, CSV, HTML, and Markdown reports
- ⚙️ **Flexible Configuration**: Depth limits, concurrency, filtering options
- 🚀 **High Performance**: Concurrent processing with rate limiting
- 📈 **Detailed Statistics**: Complete crawling metrics and error analysis

## Installation

### Option A: Install Globally
```bash
# Clone the repository
git clone https://github.com/asmeyatsky/autofix.git
cd autofix/linkchecker

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .

# Verify installation
linkchecker --help
```

### Option B: Run Locally
```bash
git clone https://github.com/asmeyatsky/autofix.git
cd autofix/linkchecker

npm install
npm run build

# Run directly
node dist/cli.js --help
```

## Quick Start

### Basic Usage
```bash
# Check a website for dead links
linkchecker https://example.com

# Save results to file
linkchecker https://example.com --output results.json

# Get summary only
linkchecker https://example.com --summary
```

### Advanced Options
```bash
# Custom depth and concurrency
linkchecker https://example.com --max-depth 5 --concurrency 10

# Filter to specific domains and patterns
linkchecker https://example.com --domains example.com blog.example.com --exclude "\.pdf$" "\.jpg$"

# HTML report with custom user agent
linkchecker https://example.com --format html --output report.html --user-agent "MyBot/1.0"
```

## Command Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `<url>` | | Base URL to start crawling from | Required |
| `--max-depth` | `-d` | Maximum crawl depth | `3` |
| `--max-pages` | `-p` | Maximum pages to crawl | `100` |
| `--concurrency` | `-c` | Concurrent requests | `5` |
| `--delay` | | Delay between requests (ms) | `100` |
| `--timeout` | `-t` | Request timeout (ms) | `30000` |
| `--retries` | `-r` | Max retries per link | `3` |
| `--no-follow` | | Don't follow redirects | `false` |
| `--user-agent` | | Custom user agent | `LinkChecker/1.0` |
| `--output` | | Output file path | - |
| `--format` | `-f` | Output format | `json` |
| `--include` | | Include URL patterns | - |
| `--exclude` | | Exclude URL patterns | - |
| `--domains` | | Limit to specific domains | - |
| `--no-color` | | Disable colored output | `false` |
| `--summary` | | Show only summary statistics | `false` |
| `--dead-only` | | Show only dead/broken links | `false` |

## Usage Examples

### 1. Basic Website Check
```bash
linkchecker https://example.com
```

### 2. Save HTML Report
```bash
linkchecker https://example.com --format html --output site-report.html
```

### 3. Check Specific Sections
```bash
# Only check blog posts
linkchecker https://example.com --include "/blog/" "/article/"

# Exclude media files
linkchecker https://example.com --exclude "\.pdf$" "\.jpg$" "\.png$"
```

### 4. High-Performance Crawling
```bash
# Fast crawling with higher concurrency
linkchecker https://example.com --concurrency 15 --delay 50 --max-pages 500
```

### 5. CI/CD Integration
```bash
# Silent mode with JSON output for CI
linkchecker https://example.com --summary --format json --output results.json --no-color
```

### 6. Multi-Domain Sites
```bash
# Check subdomains
linkchecker https://example.com --domains example.com blog.example.com api.example.com
```

### 7. Custom Timeout and Retries
```bash
# For slow servers
linkchecker https://example.com --timeout 60000 --retries 5
```

## Output Formats

### JSON Output
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "stats": {
    "totalPages": 25,
    "checkedLinks": 342,
    "deadLinks": 8,
    "validLinks": 324,
    "redirectedLinks": 10,
    "errors": 2,
    "duration": 15420
  },
  "results": [
    {
      "url": "https://example.com/broken-page",
      "statusCode": 404,
      "statusText": "Not Found",
      "error": "",
      "sourceUrl": "https://example.com/",
      "linkText": "Broken Link",
      "responseTime": 245,
      "contentType": "text/html"
    }
  ]
}
```

### CSV Output
Columns include: URL, Status Code, Status Text, Error, Source URL, Link Text, Response Time, Content Type, Redirect Chain

### HTML Output
Generates a professional HTML report with:
- Summary statistics dashboard
- Dead/broken links table
- Redirected links table
- Valid links summary
- Responsive design with charts

### Markdown Output
Creates a readable markdown report with:
- Statistics summary table
- Dead links listing
- Redirects section
- Source code links

## Exit Codes

- `0` - Success (no dead links found)
- `1` - Dead links or errors detected

## Performance Tuning

### Large Websites
```bash
# Conservative settings for large sites
linkchecker https://large-site.com \
  --max-depth 4 \
  --max-pages 1000 \
  --concurrency 3 \
  --delay 200 \
  --retries 5 \
  --timeout 60000
```

### Fast Development Check
```bash
# Quick check for development sites
linkchecker https://dev-site.com \
  --max-depth 2 \
  --max-pages 50 \
  --concurrency 8 \
  --delay 50 \
  --summary
```

### Production Monitoring
```bash
# Comprehensive production check
linkchecker https://prod-site.com \
  --max-depth 5 \
  --max-pages 500 \
  --concurrency 5 \
  --delay 100 \
  --format html \
  --output production-report.html
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
```bash
cd /path/to/autofix/linkchecker
npm install
npm run build
```

#### 2. Memory issues with large sites
```bash
# Reduce concurrency and max pages
linkchecker https://site.com --concurrency 2 --max-pages 100
```

#### 3. Server blocking requests
```bash
# Add delay and custom user agent
linkchecker https://site.com --delay 1000 --user-agent "LinkChecker/1.0 (friendly-bot)"
```

#### 4. Timeout errors
```bash
# Increase timeout and retries
linkchecker https://site.com --timeout 60000 --retries 5
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=linkchecker:* linkchecker https://example.com
```

## Integration with AutoFix

LinkChecker works perfectly alongside AutoFix:

```bash
# First, check for dead links
linkchecker https://localhost:3000 --output links.json

# Then, fix frontend errors
autofix --url http://localhost:3000 --project ./src
```

### Combined Workflow Script
```bash
#!/bin/bash

echo "🔗 Checking for dead links..."
linkchecker https://localhost:3000 --format json --output links.json --summary

if [ $? -eq 0 ]; then
    echo "✅ No dead links found"
else
    echo "❌ Dead links detected - check links.json for details"
fi

echo ""
echo "🔧 Running AutoFix to fix frontend errors..."
autofix --url http://localhost:3000 --project ./src
```

## Best Practices

### 1. Respect Website Resources
- Use appropriate delays between requests
- Set reasonable concurrency limits
- Use descriptive user agents
- Follow robots.txt rules

### 2. Effective Configuration
- Start with conservative settings
- Increase depth gradually
- Use filtering to focus on relevant content
- Monitor server response times

### 3. Output Management
- Save results for historical tracking
- Use appropriate formats for your use case
- Set up automated reporting
- Integrate with CI/CD pipelines

### 4. Error Handling
- Review dead links systematically
- Prioritize high-traffic pages
- Check redirect chains for efficiency
- Monitor server-side vs client-side issues

## API Reference

### CrawlerConfig Interface
```typescript
interface CrawlerConfig {
  baseUrl: string;
  maxDepth?: number;        // Default: 3
  maxPages?: number;        // Default: 100
  concurrency?: number;     // Default: 5
  delay?: number;           // Default: 100
  timeout?: number;         // Default: 30000
  retries?: number;         // Default: 3
  followRedirects?: boolean; // Default: true
  userAgent?: string;       // Default: 'LinkChecker/1.0'
  outputFile?: string;
  format?: 'json' | 'csv' | 'html' | 'markdown';
  allowedDomains?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
}
```

### LinkResult Interface
```typescript
interface LinkResult {
  url: string;
  statusCode?: number;
  statusText?: string;
  error?: string;
  sourceUrl: string;
  linkText?: string;
  responseTime?: number;
  contentType?: string;
  redirectChain?: string[];
}
```

## Contributing

Want to contribute to LinkChecker?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Happy link checking! 🔗**