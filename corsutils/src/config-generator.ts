import { CorsConfig, CorsAnalysis, ServerType } from './types';

export class CorsConfigGenerator {
  private serverTypes: ServerType[] = [
    {
      name: 'Express.js',
      frameworks: ['express', 'nodejs'],
      configFiles: ['app.js', 'server.js', 'index.js']
    },
    {
      name: 'Fastify',
      frameworks: ['fastify', 'nodejs'],
      configFiles: ['app.js', 'server.js']
    },
    {
      name: 'Koa.js',
      frameworks: ['koa', 'nodejs'],
      configFiles: ['app.js', 'server.js']
    },
    {
      name: 'Next.js',
      frameworks: ['nextjs', 'react'],
      configFiles: ['next.config.js', 'next.config.mjs']
    },
    {
      name: 'Nuxt.js',
      frameworks: ['nuxtjs', 'vue'],
      configFiles: ['nuxt.config.js', 'nuxt.config.ts']
    },
    {
      name: 'Django',
      frameworks: ['django', 'python'],
      configFiles: ['settings.py', 'urls.py']
    },
    {
      name: 'Flask',
      frameworks: ['flask', 'python'],
      configFiles: ['app.py', '__init__.py']
    },
    {
      name: 'Spring Boot',
      frameworks: ['spring', 'java'],
      configFiles: ['application.properties', 'application.yml']
    },
    {
      name: 'ASP.NET Core',
      frameworks: ['aspnet', 'csharp'],
      configFiles: ['Startup.cs', 'Program.cs']
    },
    {
      name: 'Nginx',
      frameworks: ['nginx', 'proxy'],
      configFiles: ['nginx.conf', 'default.conf']
    },
    {
      name: 'Apache',
      frameworks: ['apache', 'httpd'],
      configFiles: ['.htaccess', 'httpd.conf']
    }
  ];

  generateBasicCorsConfig(allowedOrigins: string[] = ['http://localhost:3000']): CorsConfig {
    return {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Length', 'X-Total-Count'],
      credentials: true,
      maxAge: 86400 // 24 hours
    };
  }

  generateExpressConfig(config: CorsConfig): string {
    const origins = Array.isArray(config.origin) 
      ? `[${config.origin.map(o => `'${o}'`).join(', ')}]` 
      : `'${config.origin}'`;

    return `// Express.js CORS Configuration
const cors = require('cors');

const corsOptions = {
  origin: ${origins},
  methods: [${config.methods.map(m => `'${m}'`).join(', ')}],
  allowedHeaders: [${config.allowedHeaders.map(h => `'${h}'`).join(', ')}],
  exposedHeaders: [${config.exposedHeaders.map(h => `'${h}'`).join(', ')}],
  credentials: ${config.credentials},
  maxAge: ${config.maxAge},
  optionsSuccessStatus: 200 // some legacy browsers choke on 204
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Or apply to specific routes
app.use('/api', cors(corsOptions));`;
  }

  generateFastifyConfig(config: CorsConfig): string {
    const origins = Array.isArray(config.origin) 
      ? `[${config.origin.map(o => `'${o}'`).join(', ')}]` 
      : `'${config.origin}'`;

    return `// Fastify CORS Configuration
const fastify = require('fastify');

// Register CORS plugin
await fastify.register(require('@fastify/cors'), {
  origin: ${origins},
  methods: [${config.methods.map(m => `'${m}'`).join(', ')}],
  allowedHeaders: [${config.allowedHeaders.map(h => `'${h}'`).join(', ')}],
  exposedHeaders: [${config.exposedHeaders.map(h => `'${h}'`).join(', ')}],
  credentials: ${config.credentials},
  maxAge: ${config.maxAge}
});`;
  }

  generateNextConfig(config: CorsConfig): string {
    const origins = Array.isArray(config.origin) 
      ? `[${config.origin.map(o => `'${o}'`).join(', ')}]` 
      : `'${config.origin}'`;

    return `// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: ${origins}
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: '${config.methods.join(', ')}'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '${config.allowedHeaders.join(', ')}'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: '${config.credentials}'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '${config.maxAge}'
          }
        ]
      }
    ];
  }
};`;
  }

  generateNginxConfig(config: CorsConfig): string {
    const origins = Array.isArray(config.origin) 
      ? config.origin.join(' ') : config.origin;

    return `# Nginx CORS Configuration
server {
    listen 80;
    server_name your-domain.com;

    location / {
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '${origins}' always;
        add_header 'Access-Control-Allow-Methods' '${config.methods.join(', ')}' always;
        add_header 'Access-Control-Allow-Headers' '${config.allowedHeaders.join(', ')}' always;
        add_header 'Access-Control-Expose-Headers' '${config.exposedHeaders.join(', ')}' always;
        add_header 'Access-Control-Allow-Credentials' '${config.credentials}' always;
        add_header 'Access-Control-Max-Age' '${config.maxAge}' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '${origins}';
            add_header 'Access-Control-Allow-Methods' '${config.methods.join(', ')}';
            add_header 'Access-Control-Allow-Headers' '${config.allowedHeaders.join(', ')}';
            add_header 'Access-Control-Allow-Credentials' '${config.credentials}';
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }

        # Proxy to your backend
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;
  }

  generateDjangoConfig(config: CorsConfig): string {
    const origins = Array.isArray(config.origin) 
      ? `[${config.origin.map(o => `'${o}'`).join(', ')}]` 
      : `'${config.origin}'`;

    return `# Django CORS Configuration
# settings.py

INSTALLED_APPS = [
    # ... your other apps
    'corsheaders',
]

# CORS settings
CORS_ALLOWED_ORIGINS = ${origins}

CORS_ALLOW_CREDENTIALS = ${config.credentials}

CORS_ALLOWED_HEADERS = [${config.allowedHeaders.map(h => `'${h}'`).join(', ')}]

CORS_EXPOSE_HEADERS = [${config.exposedHeaders.map(h => `'${h}'`).join(', ')}]

CORS_ALLOW_ALL_ORIGINS = False  # Set to True only for development

CORS_ALLOW_METHODS = [${config.methods.map(m => `'${m}'`).join(', ')}]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]`;
  }

  generateConfig(serverType: string, config: CorsConfig): string {
    switch (serverType.toLowerCase()) {
      case 'express':
      case 'express.js':
        return this.generateExpressConfig(config);
      case 'fastify':
        return this.generateFastifyConfig(config);
      case 'next':
      case 'next.js':
      case 'nextjs':
        return this.generateNextConfig(config);
      case 'nginx':
        return this.generateNginxConfig(config);
      case 'django':
        return this.generateDjangoConfig(config);
      default:
        return `// Configuration for ${serverType} is not yet implemented
// Please refer to the official documentation for CORS setup in ${serverType}
// Basic CORS headers to configure:
// Access-Control-Allow-Origin: ${Array.isArray(config.origin) ? config.origin.join(', ') : config.origin}
// Access-Control-Allow-Methods: ${config.methods.join(', ')}
// Access-Control-Allow-Headers: ${config.allowedHeaders.join(', ')}
// Access-Control-Allow-Credentials: ${config.credentials}`;
    }
  }

  analyzeCorsIssues(testResults: any[], frontendUrl?: string, backendUrl?: string): CorsAnalysis {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze test results for common issues
    testResults.forEach(result => {
      if (!result.success) {
        if (result.missingHeaders.includes('access-control-allow-origin')) {
          issues.push(`Missing Access-Control-Allow-Origin header for ${result.url}`);
        }
        if (result.missingHeaders.includes('access-control-allow-methods')) {
          issues.push(`Missing Access-Control-Allow-Methods header for ${result.url}`);
        }
        if (result.missingHeaders.includes('access-control-allow-headers')) {
          issues.push(`Missing Access-Control-Allow-Headers header for ${result.url}`);
        }
      }
    });

    // Generate recommendations based on issues
    if (issues.length > 0) {
      recommendations.push('Configure CORS middleware on your backend server');
      recommendations.push('Ensure your frontend origin is included in allowed origins');
      
      if (frontendUrl && backendUrl) {
        recommendations.push(`Make sure ${frontendUrl} is allowed to access ${backendUrl}`);
      }
    }

    // Suggest default config
    const suggestedConfig = this.generateBasicCorsConfig(
      frontendUrl ? [frontendUrl] : ['http://localhost:3000']
    );

    return {
      frontendUrl,
      backendUrl,
      issues,
      recommendations,
      suggestedConfig
    };
  }

  getServerTypes(): ServerType[] {
    return this.serverTypes;
  }

  detectServerType(directory: string): ServerType[] {
    // This would scan the directory for config files
    // For now, return all types as suggestions
    return this.serverTypes;
  }
}