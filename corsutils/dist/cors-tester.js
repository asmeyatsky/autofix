"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsTester = void 0;
const axios_1 = __importDefault(require("axios"));
class CorsTester {
    async makeRequest(url, method = 'GET', headers = {}) {
        try {
            return await (0, axios_1.default)({
                method,
                url,
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Access-Control-Request-Method': method,
                    'Access-Control-Request-Headers': 'Content-Type',
                    ...headers
                },
                timeout: 10000,
                validateStatus: () => true // Don't throw on any status code
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Network error: ${error.message}`);
            }
            throw error;
        }
    }
    extractCorsHeaders(response) {
        const corsHeaders = {};
        const corsHeaderNames = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers',
            'access-control-expose-headers',
            'access-control-allow-credentials',
            'access-control-max-age'
        ];
        corsHeaderNames.forEach(headerName => {
            const value = response.headers[headerName];
            if (value) {
                corsHeaders[headerName] = Array.isArray(value) ? value.join(', ') : value;
            }
        });
        return corsHeaders;
    }
    getRequiredCorsHeaders(method = 'GET') {
        const required = ['access-control-allow-origin'];
        if (method !== 'GET' && method !== 'HEAD') {
            required.push('access-control-allow-methods', 'access-control-allow-headers');
        }
        return required;
    }
    async testUrl(url, method = 'GET') {
        try {
            // Test actual request
            const response = await this.makeRequest(url, method);
            const corsHeaders = this.extractCorsHeaders(response);
            const requiredHeaders = this.getRequiredCorsHeaders(method);
            const missingHeaders = requiredHeaders.filter(header => !corsHeaders[header]);
            // Test preflight request for non-simple methods
            if (method !== 'GET' && method !== 'HEAD' && method !== 'POST') {
                try {
                    const preflightResponse = await this.makeRequest(url, 'OPTIONS');
                    const preflightHeaders = this.extractCorsHeaders(preflightResponse);
                    // Merge preflight headers
                    Object.assign(corsHeaders, preflightHeaders);
                    missingHeaders.push(...requiredHeaders.filter(header => !corsHeaders[header]));
                }
                catch (preflightError) {
                    missingHeaders.push('access-control-allow-methods', 'access-control-allow-headers');
                }
            }
            const recommendations = this.generateRecommendations(corsHeaders, missingHeaders, method);
            return {
                url,
                success: missingHeaders.length === 0 && response.status < 400,
                statusCode: response.status,
                corsHeaders,
                missingHeaders,
                recommendations
            };
        }
        catch (error) {
            return {
                url,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                corsHeaders: {},
                missingHeaders: ['access-control-allow-origin'],
                recommendations: ['Server may be down or not reachable']
            };
        }
    }
    generateRecommendations(corsHeaders, missingHeaders, method) {
        const recommendations = [];
        if (missingHeaders.includes('access-control-allow-origin')) {
            recommendations.push('Add Access-Control-Allow-Origin header to allow cross-origin requests');
            if (!corsHeaders['access-control-allow-origin']) {
                recommendations.push('Consider setting Access-Control-Allow-Origin to * for development');
                recommendations.push('For production, specify exact domains instead of *');
            }
        }
        if (missingHeaders.includes('access-control-allow-methods')) {
            recommendations.push(`Add Access-Control-Allow-Methods header to include ${method}`);
            recommendations.push('Include GET, POST, PUT, DELETE, OPTIONS for full REST API support');
        }
        if (missingHeaders.includes('access-control-allow-headers')) {
            recommendations.push('Add Access-Control-Allow-Headers header for custom headers');
            recommendations.push('Include Content-Type, Authorization, and other custom headers');
        }
        if (corsHeaders['access-control-allow-origin'] === '*') {
            recommendations.push('⚠️  Using wildcard (*) allows any origin - consider restricting to specific domains in production');
        }
        if (!corsHeaders['access-control-max-age']) {
            recommendations.push('Consider adding Access-Control-Max-Age to cache preflight responses');
        }
        // Check for common misconfigurations
        if (corsHeaders['access-control-allow-origin'] && !corsHeaders['access-control-allow-credentials'] && method === 'POST') {
            recommendations.push('If you need to send cookies/authentication, add Access-Control-Allow-Credentials: true');
        }
        return recommendations;
    }
    async testMultipleUrls(urls, methods = ['GET', 'POST']) {
        const results = [];
        for (const url of urls) {
            for (const method of methods) {
                const result = await this.testUrl(url, method);
                results.push(result);
                // Add small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return results;
    }
    async testPreflight(url) {
        try {
            const response = await this.makeRequest(url, 'OPTIONS');
            const corsHeaders = this.extractCorsHeaders(response);
            const requiredHeaders = ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'];
            const missingHeaders = requiredHeaders.filter(header => !corsHeaders[header]);
            return {
                url,
                success: missingHeaders.length === 0,
                statusCode: response.status,
                corsHeaders,
                missingHeaders,
                recommendations: this.generateRecommendations(corsHeaders, missingHeaders, 'OPTIONS')
            };
        }
        catch (error) {
            return {
                url,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                corsHeaders: {},
                missingHeaders: ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'],
                recommendations: ['Server may not support OPTIONS requests or CORS is not configured']
            };
        }
    }
}
exports.CorsTester = CorsTester;
//# sourceMappingURL=cors-tester.js.map