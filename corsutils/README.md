# CORS Utils - Cross-Origin Resource Sharing Troubleshooting Tool

CORS Utils is a powerful CLI tool that helps developers diagnose, test, and fix CORS (Cross-Origin Resource Sharing) issues in their web applications. It works alongside AutoFix and LinkChecker to provide a complete frontend debugging toolkit.

## Features

- 🔍 **CORS Testing**: Test CORS headers and preflight requests
- 🩺 **Issue Diagnosis**: Automatically detect and categorize CORS problems  
- ⚙️ **Config Generation**: Generate server configurations for any framework
- 🔧 **Interactive Wizard**: Step-by-step troubleshooting guide
- 📊 **Comprehensive Reports**: Detailed analysis and recommendations
- 🧪 **Test Suite**: Run complete CORS validation across multiple endpoints

## Installation

### Option A: Install Globally
```bash
# Clone the repository
git clone https://github.com/asmeyatsky/autofix.git
cd autofix/corsutils

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .

# Verify installation
corsutils --help
```

### Option B: Run Locally
```bash
git clone https://github.com/asmeyatsky/autofix.git
cd autofix/corsutils

npm install
npm run build

# Run directly
node dist/cli.js --help
```

## Quick Start

### 1. Test a Single URL
```bash
corsutils test http://localhost:8000/api
```

### 2. Analyze Frontend + Backend
```bash
corsutils analyze http://localhost:3000 http://localhost:8000
```

### 3. Interactive Troubleshooting
```bash
corsutils interactive
```

### 4. Generate Server Configuration
```bash
corsutils config express --origins "http://localhost:3000,https://myapp.com"
```

## Commands

### `test` - Test CORS for a URL
```bash
corsutils test <url> [options]

# Examples:
corsutils test http://localhost:8000/api/users
corsutils test https://api.example.com --methods "GET,POST,PUT,DELETE"
```

**Options:**
- `-m, --methods <methods>`: HTTP methods to test (default: GET,POST)

### `analyze` - Analyze CORS between frontend and backend
```bash
corsutils analyze <frontend-url> <backend-url>

# Example:
corsutils analyze http://localhost:3000 http://localhost:8000
```

This command will:
- Test CORS on the backend endpoint
- Analyze compatibility with the frontend origin
- Provide specific recommendations
- Suggest configuration changes

### `config` - Generate server configuration
```bash
corsutils config <server-type> [options]

# Examples:
corsutils config express
corsutils config next --origins "http://localhost:3000,https://app.example.com"
corsutils config nginx --origins "*"
```

**Supported Server Types:**
- `express` / `express.js` - Node.js Express
- `fastify` - Node.js Fastify
- `next` / `nextjs` - Next.js applications
- `nuxt` / `nuxtjs` - Nuxt.js applications
- `django` - Django Python framework
- `flask` - Flask Python framework
- `spring` - Spring Boot Java
- `aspnet` - ASP.NET Core
- `nginx` - Nginx reverse proxy
- `apache` - Apache HTTP Server

**Options:**
- `-o, --origins <origins>`: Allowed origins (default: http://localhost:3000)

### `suite` - Run comprehensive test suite
```bash
corsutils suite <urls...>

# Example:
corsutils suite http://localhost:8000/api http://localhost:8000/auth
```

Runs a complete CORS test suite including:
- All HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Preflight requests (OPTIONS)
- Header validation
- Comprehensive reporting

### `diagnose` - Diagnose CORS issues
```bash
corsutils diagnose <urls...>

# Example:
corsutils diagnose http://localhost:8000/api/users http://localhost:8000/auth
```

Provides detailed diagnosis of CORS issues with specific fixes.

### `interactive` - Interactive troubleshooting wizard
```bash
corsutils interactive
```

Step-by-step wizard that guides you through:
1. Frontend/Backend URL configuration
2. Server type selection
3. Issue identification
4. Configuration generation
5. Specific troubleshooting steps

## Usage Examples

### Common Development Scenario
```bash
# 1. Test your API endpoint
corsutils test http://localhost:8000/api

# 2. Generate Express configuration
corsutils config express --origins "http://localhost:3000"

# 3. Apply the generated configuration to your Express app
```

### Production Deployment Check
```bash
# Test production endpoints
corsutils test https://api.yourapp.com/users --methods "GET,POST,PUT,DELETE"

# Run comprehensive test suite
corsutils suite https://api.yourapp.com/users https://api.yourapp.com/auth

# Generate production-ready configuration
corsutils config nginx --origins "https://yourapp.com,https://admin.yourapp.com"
```

### Debugging CORS Issues
```bash
# Use interactive wizard for debugging
corsutils interactive

# Or manually diagnose issues
corsutils diagnose http://localhost:8000/api

# Test preflight specifically
corsutils preflight http://localhost:8000/api
```

## Generated Configurations

### Express.js Example
```javascript
const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Next.js Example
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          }
        ]
      }
    ];
  }
};
```

### Nginx Example
```nginx
location / {
    add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:3000';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain';
        return 204;
    }
    
    proxy_pass http://localhost:3000;
}
```

## Output Examples

### Test Result
```
✅ PASS http://localhost:8000/api/users (200)
   CORS Headers:
     access-control-allow-origin: http://localhost:3000
     access-control-allow-methods: GET, POST, PUT, DELETE
     access-control-allow-headers: Content-Type, Authorization
   Recommendations:
     💡 Consider adding Access-Control-Max-Age to cache preflight responses
```

### Issue Detection
```
❌ FAIL http://localhost:8000/api/users (200)
   Missing Headers:
     • access-control-allow-origin
     • access-control-allow-methods
   Recommendations:
     💡 Add Access-Control-Allow-Origin header to allow cross-origin requests
     💡 Add Access-Control-Allow-Methods header to include GET
```

### Analysis Report
```
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

## Integration with AutoFix and LinkChecker

CORS Utils works perfectly alongside the other tools in the AutoFix ecosystem:

```bash
#!/bin/bash
# Complete web application health check

echo "🔗 Checking for dead links..."
linkchecker http://localhost:3000 --summary --format json --output links.json

echo "🔧 Checking for frontend errors..."
autofix --url http://localhost:3000 --project ./src --max-attempts 3

echo "🌐 Checking CORS configuration..."
corsutils analyze http://localhost:3000 http://localhost:8000

echo "✅ Complete health check finished!"
```

## Troubleshooting Common Issues

### 1. "No 'Access-Control-Allow-Origin' header is present"
```bash
corsutils test http://localhost:8000/api
corsutils config express --origins "http://localhost:3000"
```

### 2. "Credentials not allowed when Access-Control-Allow-Origin is '*'"
```bash
corsutils diagnose http://localhost:8000/api
# Don't use wildcard origin with credentials
corsutils config express --origins "http://localhost:3000"
```

### 3. Preflight requests failing
```bash
corsutils preflight http://localhost:8000/api
corsutils suite http://localhost:8000/api
```

## Best Practices

1. **Development**: Use specific origins instead of wildcards
2. **Production**: Always specify exact allowed domains
3. **Security**: Only enable credentials when necessary
4. **Performance**: Set appropriate `max-age` for preflight caching
5. **Testing**: Use CORS Utils before deploying to production

## API Reference

### Test Options
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- Headers: Custom headers can be specified in advanced mode
- Origins: Single or multiple origins supported

### Configuration Options
- `origin`: Allowed origins (string or array)
- `methods`: HTTP methods to allow
- `allowedHeaders`: Request headers to allow
- `exposedHeaders`: Response headers to expose
- `credentials`: Allow cookies/authorization
- `maxAge`: Preflight cache duration

## Contributing

We welcome contributions! Please see the main repository for guidelines.

## License

MIT License - see LICENSE file for details.

---

**🔧 Happy CORS debugging!** 

Remember: CORS is a security feature, not an error. Configure it properly to balance security and functionality.