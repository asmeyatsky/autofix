"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class OutputFormatter {
    formatTestResult(result) {
        const status = result.success ? chalk_1.default.green('✅ PASS') : chalk_1.default.red('❌ FAIL');
        const url = chalk_1.default.blue(result.url);
        let output = `\n${status} ${url}`;
        if (result.statusCode) {
            output += ` (${result.statusCode})`;
        }
        if (result.error) {
            output += `\n   ${chalk_1.default.red('Error:')} ${result.error}`;
        }
        if (Object.keys(result.corsHeaders).length > 0) {
            output += `\n   ${chalk_1.default.yellow('CORS Headers:')}`;
            Object.entries(result.corsHeaders).forEach(([key, value]) => {
                output += `\n     ${chalk_1.default.cyan(key)}: ${value}`;
            });
        }
        if (result.missingHeaders.length > 0) {
            output += `\n   ${chalk_1.default.red('Missing Headers:')}`;
            result.missingHeaders.forEach(header => {
                output += `\n     • ${header}`;
            });
        }
        if (result.recommendations.length > 0) {
            output += `\n   ${chalk_1.default.blue('Recommendations:')}`;
            result.recommendations.forEach(rec => {
                output += `\n     💡 ${rec}`;
            });
        }
        return output;
    }
    formatAnalysis(analysis) {
        let output = `\n${chalk_1.default.bold.underline('CORS Analysis Report')}\n`;
        if (analysis.frontendUrl && analysis.backendUrl) {
            output += `\n${chalk_1.default.yellow('Testing:')}`;
            output += `\n   Frontend: ${chalk_1.default.blue(analysis.frontendUrl)}`;
            output += `\n   Backend:  ${chalk_1.default.blue(analysis.backendUrl)}`;
        }
        if (analysis.issues.length > 0) {
            output += `\n${chalk_1.default.red('Issues Found:')}`;
            analysis.issues.forEach(issue => {
                output += `\n   ❌ ${issue}`;
            });
        }
        else {
            output += `\n${chalk_1.default.green('✅ No CORS issues detected!')}`;
        }
        if (analysis.recommendations.length > 0) {
            output += `\n${chalk_1.default.blue('Recommendations:')}`;
            analysis.recommendations.forEach(rec => {
                output += `\n   💡 ${rec}`;
            });
        }
        output += `\n${chalk_1.default.yellow('Suggested Configuration:')}`;
        output += `\n   Origin: ${chalk_1.default.cyan(Array.isArray(analysis.suggestedConfig.origin) ? analysis.suggestedConfig.origin.join(', ') : analysis.suggestedConfig.origin)}`;
        output += `\n   Methods: ${chalk_1.default.cyan(analysis.suggestedConfig.methods.join(', '))}`;
        output += `\n   Allowed Headers: ${chalk_1.default.cyan(analysis.suggestedConfig.allowedHeaders.join(', '))}`;
        output += `\n   Credentials: ${chalk_1.default.cyan(analysis.suggestedConfig.credentials.toString())}`;
        output += `\n   Max Age: ${chalk_1.default.cyan(analysis.suggestedConfig.maxAge.toString())}`;
        return output;
    }
    formatConfig(config, serverType) {
        let output = `\n${chalk_1.default.bold.underline(`${serverType} CORS Configuration`)}\n`;
        output += chalk_1.default.gray('```');
        output += `\n${config}`;
        output += chalk_1.default.gray('\n```\n');
        return output;
    }
    formatSummary(results) {
        const total = results.length;
        const passed = results.filter(r => r.success).length;
        const failed = total - passed;
        let output = `\n${chalk_1.default.bold('Test Summary:')}\n`;
        output += `   Total Tests: ${chalk_1.default.cyan(total.toString())}\n`;
        output += `   ${chalk_1.default.green('Passed:')} ${passed.toString()}\n`;
        output += `   ${chalk_1.default.red('Failed:')} ${failed.toString()}\n`;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        output += `   Success Rate: ${successRate >= 80 ? chalk_1.default.green : successRate >= 50 ? chalk_1.default.yellow : chalk_1.default.red}(${successRate}%)\n`;
        // Common issues summary
        const commonIssues = this.getCommonIssues(results);
        if (commonIssues.length > 0) {
            output += `\n${chalk_1.default.yellow('Most Common Issues:')}\n`;
            commonIssues.forEach(([issue, count]) => {
                output += `   • ${issue} (${count} occurrences)\n`;
            });
        }
        return output;
    }
    getCommonIssues(results) {
        const issueCount = new Map();
        results.forEach(result => {
            result.missingHeaders.forEach(header => {
                const count = issueCount.get(header) || 0;
                issueCount.set(header, count + 1);
            });
        });
        return Array.from(issueCount.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([issue, count]) => [this.formatHeaderName(issue), count]);
    }
    formatHeaderName(header) {
        return header
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    formatServerTypes(serverTypes) {
        let output = `\n${chalk_1.default.bold('Supported Server Types:')}\n`;
        serverTypes.forEach((server, index) => {
            output += `\n${chalk_1.default.cyan(`${index + 1}. ${server.name}`)}`;
            if (server.frameworks.length > 0) {
                output += `\n   Frameworks: ${server.frameworks.join(', ')}`;
            }
            if (server.configFiles.length > 0) {
                output += `\n   Config Files: ${server.configFiles.join(', ')}`;
            }
        });
        return output;
    }
}
exports.OutputFormatter = OutputFormatter;
//# sourceMappingURL=output-formatter.js.map