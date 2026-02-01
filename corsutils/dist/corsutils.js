"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsUtils = void 0;
const cors_tester_1 = require("./cors-tester");
const config_generator_1 = require("./config-generator");
const output_formatter_1 = require("./output-formatter");
class CorsUtils {
    constructor() {
        this.corsTester = new cors_tester_1.CorsTester();
        this.configGenerator = new config_generator_1.CorsConfigGenerator();
        this.outputFormatter = new output_formatter_1.OutputFormatter();
    }
    async testUrl(url, methods = ['GET', 'POST']) {
        console.log(`🔍 Testing CORS for: ${url}`);
        for (const method of methods) {
            const result = await this.corsTester.testUrl(url, method);
            console.log(this.outputFormatter.formatTestResult(result));
        }
    }
    async testMultipleUrls(urls, methods = ['GET', 'POST']) {
        console.log(`🔍 Testing CORS for ${urls.length} URLs...`);
        const results = await this.corsTester.testMultipleUrls(urls, methods);
        results.forEach(result => {
            console.log(this.outputFormatter.formatTestResult(result));
        });
        console.log(this.outputFormatter.formatSummary(results));
    }
    async testPreflight(url) {
        console.log(`🛩️ Testing CORS preflight for: ${url}`);
        const result = await this.corsTester.testPreflight(url);
        console.log(this.outputFormatter.formatTestResult(result));
    }
    async analyzeCors(frontendUrl, backendUrl) {
        console.log(`🔍 Analyzing CORS setup...`);
        console.log(`   Frontend: ${frontendUrl}`);
        console.log(`   Backend:  ${backendUrl}`);
        const testResults = await this.corsTester.testMultipleUrls([backendUrl], ['GET', 'POST', 'PUT', 'DELETE']);
        const analysis = this.configGenerator.analyzeCorsIssues(testResults, frontendUrl, backendUrl);
        console.log(this.outputFormatter.formatAnalysis(analysis));
        return;
    }
    async generateConfig(serverType, origins = ['http://localhost:3000']) {
        console.log(`⚙️  Generating CORS configuration for ${serverType}...`);
        const config = this.configGenerator.generateBasicCorsConfig(origins);
        const generatedConfig = this.configGenerator.generateConfig(serverType, config);
        console.log(this.outputFormatter.formatConfig(generatedConfig, serverType));
        return;
    }
    async listServerTypes() {
        console.log(`📋 Supported server types:`);
        const serverTypes = this.configGenerator.getServerTypes();
        console.log(this.outputFormatter.formatServerTypes(serverTypes));
        return;
    }
    async diagnoseCorsIssues(urls) {
        console.log(`🩺 Diagnosing CORS issues...`);
        const allResults = [];
        // Test basic requests
        for (const url of urls) {
            console.log(`\n🔍 Testing ${url}...`);
            // Test different methods
            const methods = ['GET', 'POST', 'PUT', 'DELETE'];
            for (const method of methods) {
                const result = await this.corsTester.testUrl(url, method);
                allResults.push(result);
                if (!result.success) {
                    console.log(this.outputFormatter.formatTestResult(result));
                }
            }
            // Test preflight
            const preflightResult = await this.corsTester.testPreflight(url);
            allResults.push(preflightResult);
            if (!preflightResult.success) {
                console.log(this.outputFormatter.formatTestResult(preflightResult));
            }
        }
        // Generate analysis
        const analysis = this.configGenerator.analyzeCorsIssues(allResults);
        console.log(this.outputFormatter.formatAnalysis(analysis));
        // Suggest configurations
        console.log(`\n💡 Suggested next steps:`);
        console.log(`   1. Choose your server type:`);
        const serverTypes = this.configGenerator.getServerTypes();
        serverTypes.slice(0, 5).forEach((server, index) => {
            console.log(`      ${index + 1}. ${server.name}`);
        });
        console.log(`   2. Generate configuration: corsutils --config <server-type> --origins "http://localhost:3000"`);
        console.log(`   3. Apply the configuration to your server`);
    }
    async runCorsTestSuite(urls) {
        console.log(`🧪 Running comprehensive CORS test suite...`);
        const testMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        const allResults = [];
        for (const url of urls) {
            console.log(`\n🌐 Testing URL: ${url}`);
            // Test each method
            for (const method of testMethods) {
                const result = await this.corsTester.testUrl(url, method);
                allResults.push(result);
                const status = result.success ? '✅' : '❌';
                console.log(`   ${status} ${method}: ${result.statusCode || 'ERROR'}`);
                if (!result.success && result.missingHeaders.length > 0) {
                    console.log(`      Missing: ${result.missingHeaders.join(', ')}`);
                }
            }
            // Test preflight
            const preflightResult = await this.corsTester.testPreflight(url);
            allResults.push(preflightResult);
            const preflightStatus = preflightResult.success ? '✅' : '❌';
            console.log(`   ${preflightStatus} OPTIONS (preflight): ${preflightResult.statusCode || 'ERROR'}`);
        }
        // Summary
        console.log(this.outputFormatter.formatSummary(allResults));
        // Recommendations
        const failedResults = allResults.filter(r => !r.success);
        if (failedResults.length > 0) {
            console.log(`\n🔧 Common fixes for detected issues:`);
            const hasOriginIssues = failedResults.some(r => r.missingHeaders.includes('access-control-allow-origin'));
            const hasMethodIssues = failedResults.some(r => r.missingHeaders.includes('access-control-allow-methods'));
            const hasHeaderIssues = failedResults.some(r => r.missingHeaders.includes('access-control-allow-headers'));
            if (hasOriginIssues) {
                console.log(`   • Add 'Access-Control-Allow-Origin' header to your server`);
            }
            if (hasMethodIssues) {
                console.log(`   • Add 'Access-Control-Allow-Methods' with allowed HTTP methods`);
            }
            if (hasHeaderIssues) {
                console.log(`   • Add 'Access-Control-Allow-Headers' for custom headers`);
            }
            console.log(`\n📖 Generate server configuration:`);
            console.log(`   corsutils --config express --origins "http://localhost:3000,https://yourdomain.com"`);
        }
    }
}
exports.CorsUtils = CorsUtils;
//# sourceMappingURL=corsutils.js.map