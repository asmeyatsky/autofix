import { CorsTestResult, CorsAnalysis } from './types';
import chalk from 'chalk';

export class OutputFormatter {
  formatTestResult(result: CorsTestResult): string {
    const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    const url = chalk.blue(result.url);
    
    let output = `\n${status} ${url}`;
    
    if (result.statusCode) {
      output += ` (${result.statusCode})`;
    }
    
    if (result.error) {
      output += `\n   ${chalk.red('Error:')} ${result.error}`;
    }
    
    if (Object.keys(result.corsHeaders).length > 0) {
      output += `\n   ${chalk.yellow('CORS Headers:')}`;
      Object.entries(result.corsHeaders).forEach(([key, value]) => {
        output += `\n     ${chalk.cyan(key)}: ${value}`;
      });
    }
    
    if (result.missingHeaders.length > 0) {
      output += `\n   ${chalk.red('Missing Headers:')}`;
      result.missingHeaders.forEach(header => {
        output += `\n     • ${header}`;
      });
    }
    
    if (result.recommendations.length > 0) {
      output += `\n   ${chalk.blue('Recommendations:')}`;
      result.recommendations.forEach(rec => {
        output += `\n     💡 ${rec}`;
      });
    }
    
    return output;
  }

  formatAnalysis(analysis: CorsAnalysis): string {
    let output = `\n${chalk.bold.underline('CORS Analysis Report')}\n`;
    
    if (analysis.frontendUrl && analysis.backendUrl) {
      output += `\n${chalk.yellow('Testing:')}`;
      output += `\n   Frontend: ${chalk.blue(analysis.frontendUrl)}`;
      output += `\n   Backend:  ${chalk.blue(analysis.backendUrl)}`;
    }
    
    if (analysis.issues.length > 0) {
      output += `\n${chalk.red('Issues Found:')}`;
      analysis.issues.forEach(issue => {
        output += `\n   ❌ ${issue}`;
      });
    } else {
      output += `\n${chalk.green('✅ No CORS issues detected!')}`;
    }
    
    if (analysis.recommendations.length > 0) {
      output += `\n${chalk.blue('Recommendations:')}`;
      analysis.recommendations.forEach(rec => {
        output += `\n   💡 ${rec}`;
      });
    }
    
    output += `\n${chalk.yellow('Suggested Configuration:')}`;
    output += `\n   Origin: ${chalk.cyan(Array.isArray(analysis.suggestedConfig.origin) ? analysis.suggestedConfig.origin.join(', ') : analysis.suggestedConfig.origin)}`;
    output += `\n   Methods: ${chalk.cyan(analysis.suggestedConfig.methods.join(', '))}`;
    output += `\n   Allowed Headers: ${chalk.cyan(analysis.suggestedConfig.allowedHeaders.join(', '))}`;
    output += `\n   Credentials: ${chalk.cyan(analysis.suggestedConfig.credentials.toString())}`;
    output += `\n   Max Age: ${chalk.cyan(analysis.suggestedConfig.maxAge.toString())}`;
    
    return output;
  }

  formatConfig(config: string, serverType: string): string {
    let output = `\n${chalk.bold.underline(`${serverType} CORS Configuration`)}\n`;
    output += chalk.gray('```');
    output += `\n${config}`;
    output += chalk.gray('\n```\n');
    return output;
  }

  formatSummary(results: CorsTestResult[]): string {
    const total = results.length;
    const passed = results.filter(r => r.success).length;
    const failed = total - passed;
    
    let output = `\n${chalk.bold('Test Summary:')}\n`;
    output += `   Total Tests: ${chalk.cyan(total.toString())}\n`;
    output += `   ${chalk.green('Passed:')} ${passed.toString()}\n`;
    output += `   ${chalk.red('Failed:')} ${failed.toString()}\n`;
    
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    output += `   Success Rate: ${successRate >= 80 ? chalk.green : successRate >= 50 ? chalk.yellow : chalk.red}(${successRate}%)\n`;
    
    // Common issues summary
    const commonIssues = this.getCommonIssues(results);
    if (commonIssues.length > 0) {
      output += `\n${chalk.yellow('Most Common Issues:')}\n`;
      commonIssues.forEach(([issue, count]) => {
        output += `   • ${issue} (${count} occurrences)\n`;
      });
    }
    
    return output;
  }

  private getCommonIssues(results: CorsTestResult[]): Array<[string, number]> {
    const issueCount = new Map<string, number>();
    
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

  private formatHeaderName(header: string): string {
    return header
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatServerTypes(serverTypes: any[]): string {
    let output = `\n${chalk.bold('Supported Server Types:')}\n`;
    
    serverTypes.forEach((server, index) => {
      output += `\n${chalk.cyan(`${index + 1}. ${server.name}`)}`;
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