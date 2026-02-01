"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormatter = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const csv_writer_1 = require("csv-writer");
class OutputFormatter {
    constructor(config) {
        this.config = config;
    }
    printFullResults(results, stats, duration) {
        this.printSummary(stats, duration);
        console.log('');
        console.log(chalk_1.default.blue.bold('📊 Link Results:'));
        console.log('');
        const deadLinks = results.filter(r => (r.statusCode && r.statusCode >= 400) || r.error);
        const validLinks = results.filter(r => r.statusCode && r.statusCode >= 200 && r.statusCode < 400);
        const redirectedLinks = results.filter(r => r.statusCode && r.statusCode >= 300 && r.statusCode < 400);
        // Print dead links first
        if (deadLinks.length > 0) {
            console.log(chalk_1.default.red.bold(`❌ Dead/Broken Links (${deadLinks.length}):`));
            deadLinks.forEach((link, index) => {
                console.log(chalk_1.default.red(`  ${index + 1}. ${link.url}`));
                console.log(chalk_1.default.red(`     Status: ${link.statusCode || 'Error'} ${link.statusText || link.error}`));
                console.log(chalk_1.default.red(`     Source: ${link.sourceUrl}`));
                if (link.linkText) {
                    console.log(chalk_1.default.red(`     Text: "${link.linkText}"`));
                }
                if (link.responseTime) {
                    console.log(chalk_1.default.red(`     Time: ${link.responseTime}ms`));
                }
                console.log('');
            });
        }
        // Print redirected links
        if (redirectedLinks.length > 0) {
            console.log(chalk_1.default.yellow.bold(`🔀 Redirected Links (${redirectedLinks.length}):`));
            redirectedLinks.slice(0, 10).forEach((link, index) => {
                console.log(chalk_1.default.yellow(`  ${index + 1}. ${link.url}`));
                console.log(chalk_1.default.yellow(`     Status: ${link.statusCode} ${link.statusText}`));
                if (link.redirectChain?.length) {
                    console.log(chalk_1.default.yellow(`     Chain: ${link.redirectChain.join(' → ')}`));
                }
            });
            if (redirectedLinks.length > 10) {
                console.log(chalk_1.default.yellow(`     ... and ${redirectedLinks.length - 10} more`));
            }
            console.log('');
        }
        // Show sample of valid links
        if (validLinks.length > 0) {
            console.log(chalk_1.default.green.bold(`✅ Valid Links (${validLinks.length}):`));
            validLinks.slice(0, 5).forEach((link, index) => {
                console.log(chalk_1.default.green(`  ${index + 1}. ${link.url}`));
                console.log(chalk_1.default.green(`     Status: ${link.statusCode} ${link.statusText}`));
                if (link.contentType) {
                    console.log(chalk_1.default.green(`     Type: ${link.contentType}`));
                }
            });
            if (validLinks.length > 5) {
                console.log(chalk_1.default.green(`     ... and ${validLinks.length - 5} more`));
            }
            console.log('');
        }
    }
    printSummary(stats, duration) {
        console.log(chalk_1.default.blue.bold('📈 Crawling Summary:'));
        console.log(chalk_1.default.gray(`   Total pages crawled: ${stats.totalPages}`));
        console.log(chalk_1.default.gray(`   Total links checked: ${stats.checkedLinks}`));
        console.log(chalk_1.default.green(`   ✅ Valid links: ${stats.validLinks}`));
        console.log(chalk_1.default.red(`   ❌ Dead/broken links: ${stats.deadLinks}`));
        console.log(chalk_1.default.yellow(`   🔀 Redirected links: ${stats.redirectedLinks}`));
        console.log(chalk_1.default.red(`   🚨 Errors: ${stats.errors}`));
        console.log(chalk_1.default.gray(`   ⏱️  Duration: ${duration?.toFixed(2) || 'N/A'}s`));
        const errorRate = stats.checkedLinks > 0 ? parseFloat(((stats.deadLinks + stats.errors) / stats.checkedLinks * 100).toFixed(1)) : 0;
        if (errorRate > 10) {
            console.log(chalk_1.default.red(`   📉 Error rate: ${errorRate}% ⚠️`));
        }
        else if (errorRate > 5) {
            console.log(chalk_1.default.yellow(`   📉 Error rate: ${errorRate}%`));
        }
        else {
            console.log(chalk_1.default.green(`   📉 Error rate: ${errorRate}%`));
        }
    }
    printDeadLinks(deadLinks, stats) {
        console.log(chalk_1.default.red.bold(`💀 Dead/Broken Links Found: ${deadLinks.length}`));
        console.log('');
        deadLinks.forEach((link, index) => {
            console.log(chalk_1.default.red(`${index + 1}. ${link.url}`));
            console.log(chalk_1.default.red(`   Status: ${link.statusCode || 'Error'} ${link.statusText || link.error}`));
            console.log(chalk_1.default.red(`   Source: ${link.sourceUrl}`));
            if (link.linkText) {
                console.log(chalk_1.default.red(`   Text: "${link.linkText}"`));
            }
            console.log('');
        });
        console.log(chalk_1.default.red.bold(`📊 Summary: ${deadLinks.length}/${stats.checkedLinks} links are broken`));
    }
    async saveToFile(results, stats, filePath, format) {
        const absolutePath = path_1.default.resolve(filePath);
        try {
            switch (format) {
                case 'json':
                    await this.saveAsJson(results, stats, absolutePath);
                    break;
                case 'csv':
                    await this.saveAsCsv(results, absolutePath);
                    break;
                case 'html':
                    await this.saveAsHtml(results, stats, absolutePath);
                    break;
                case 'markdown':
                    await this.saveAsMarkdown(results, stats, absolutePath);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            console.log(chalk_1.default.green(`💾 Results saved to: ${absolutePath}`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Failed to save results: ${error}`));
            throw error;
        }
    }
    async saveAsJson(results, stats, filePath) {
        const data = {
            timestamp: new Date().toISOString(),
            stats: {
                totalPages: stats.totalPages,
                checkedLinks: stats.checkedLinks,
                deadLinks: stats.deadLinks,
                validLinks: stats.validLinks,
                redirectedLinks: stats.redirectedLinks,
                errors: stats.errors,
                duration: stats.duration,
                startTime: stats.startTime,
                endTime: stats.endTime
            },
            results: results
        };
        await fs_1.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    async saveAsCsv(results, filePath) {
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: filePath,
            header: [
                { id: 'url', title: 'URL' },
                { id: 'statusCode', title: 'Status Code' },
                { id: 'statusText', title: 'Status Text' },
                { id: 'error', title: 'Error' },
                { id: 'sourceUrl', title: 'Source URL' },
                { id: 'linkText', title: 'Link Text' },
                { id: 'responseTime', title: 'Response Time (ms)' },
                { id: 'contentType', title: 'Content Type' },
                { id: 'redirectChain', title: 'Redirect Chain' }
            ]
        });
        const records = results.map(link => ({
            url: link.url,
            statusCode: link.statusCode || '',
            statusText: link.statusText || '',
            error: link.error || '',
            sourceUrl: link.sourceUrl,
            linkText: link.linkText || '',
            responseTime: link.responseTime || 0,
            contentType: link.contentType || '',
            redirectChain: link.redirectChain?.join(' → ') || ''
        }));
        await csvWriter.writeRecords(records);
    }
    async saveAsHtml(results, stats, filePath) {
        const html = this.generateHtmlReport(results, stats);
        await fs_1.promises.writeFile(filePath, html, 'utf-8');
    }
    async saveAsMarkdown(results, stats, filePath) {
        const markdown = this.generateMarkdownReport(results, stats);
        await fs_1.promises.writeFile(filePath, markdown, 'utf-8');
    }
    generateHtmlReport(results, stats) {
        const deadLinks = results.filter(r => (r.statusCode && r.statusCode >= 400) || r.error);
        const validLinks = results.filter(r => r.statusCode && r.statusCode >= 200 && r.statusCode < 400);
        const redirectedLinks = results.filter(r => r.statusCode && r.statusCode >= 300 && r.statusCode < 400);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Checker Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 24px; font-weight: bold; }
        .stat-label { color: #666; font-size: 14px; }
        .valid { color: #28a745; }
        .dead { color: #dc3545; }
        .redirected { color: #ffc107; }
        .section { margin-bottom: 30px; }
        .link-table { width: 100%; border-collapse: collapse; }
        .link-table th, .link-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .link-table th { background: #f8f9fa; font-weight: bold; }
        .link-table tr:hover { background: #f8f9fa; }
        .status-200 { color: #28a745; }
        .status-300 { color: #ffc107; }
        .status-400, .status-500 { color: #dc3545; }
        .url { max-width: 400px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔗 Link Checker Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${stats.totalPages}</div>
            <div class="stat-label">Pages Crawled</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.checkedLinks}</div>
            <div class="stat-label">Links Checked</div>
        </div>
        <div class="stat-card">
            <div class="stat-number valid">${validLinks.length}</div>
            <div class="stat-label">Valid Links</div>
        </div>
        <div class="stat-card">
            <div class="stat-number dead">${deadLinks.length}</div>
            <div class="stat-label">Dead Links</div>
        </div>
        <div class="stat-card">
            <div class="stat-number redirected">${redirectedLinks.length}</div>
            <div class="stat-label">Redirects</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.duration ? (stats.duration / 1000).toFixed(1) : 'N/A'}s</div>
            <div class="stat-label">Duration</div>
        </div>
    </div>

    ${deadLinks.length > 0 ? `
    <div class="section">
        <h2>❌ Dead/Broken Links (${deadLinks.length})</h2>
        <table class="link-table">
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Link Text</th>
                    <th>Response Time</th>
                </tr>
            </thead>
            <tbody>
                ${deadLinks.map(link => `
                <tr>
                    <td class="url">${link.url}</td>
                    <td class="status-${Math.floor((link.statusCode || 0) / 100) * 100}">${link.statusCode || 'Error'} ${link.statusText || link.error}</td>
                    <td><a href="${link.sourceUrl}">${link.sourceUrl}</a></td>
                    <td>${link.linkText || ''}</td>
                    <td>${link.responseTime || ''}ms</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${redirectedLinks.length > 0 ? `
    <div class="section">
        <h2>🔀 Redirected Links (${redirectedLinks.length})</h2>
        <table class="link-table">
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Redirect Chain</th>
                    <th>Response Time</th>
                </tr>
            </thead>
            <tbody>
                ${redirectedLinks.slice(0, 20).map(link => `
                <tr>
                    <td class="url">${link.url}</td>
                    <td class="status-${Math.floor((link.statusCode || 0) / 100) * 100}">${link.statusCode} ${link.statusText}</td>
                    <td>${link.redirectChain?.join(' → ') || ''}</td>
                    <td>${link.responseTime || ''}ms</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

</body>
</html>`;
    }
    generateMarkdownReport(results, stats) {
        const deadLinks = results.filter(r => (r.statusCode && r.statusCode >= 400) || r.error);
        const validLinks = results.filter(r => r.statusCode && r.statusCode >= 200 && r.statusCode < 400);
        const redirectedLinks = results.filter(r => r.statusCode && r.statusCode >= 300 && r.statusCode < 400);
        return `
# 🔗 Link Checker Report

Generated on ${new Date().toLocaleString()}

## 📊 Summary

| Metric | Count |
|--------|-------|
| Pages Crawled | ${stats.totalPages} |
| Links Checked | ${stats.checkedLinks} |
| ✅ Valid Links | ${validLinks.length} |
| ❌ Dead Links | ${deadLinks.length} |
| 🔀 Redirects | ${redirectedLinks.length} |
| ⏱️ Duration | ${stats.duration ? (stats.duration / 1000).toFixed(1) : 'N/A'}s |

${deadLinks.length > 0 ? `
## ❌ Dead/Broken Links (${deadLinks.length})

| # | URL | Status | Source | Link Text |
|---|-----|--------|--------|-----------|
${deadLinks.map((link, index) => `| ${index + 1} | [${link.url}](${link.url}) | ${link.statusCode || 'Error'} ${link.statusText || link.error} | [${link.sourceUrl}](${link.sourceUrl}) | "${link.linkText || ''}" |`).join('\n')}
` : ''}

${redirectedLinks.length > 0 ? `
## 🔀 Redirected Links (${redirectedLinks.length})

| # | URL | Status | Redirect Chain |
|---|-----|--------|--------------|
${redirectedLinks.slice(0, 20).map((link, index) => `| ${index + 1} | [${link.url}](${link.url}) | ${link.statusCode} ${link.statusText} | ${link.redirectChain?.join(' → ') || ''} |`).join('\n')}
` : ''}

---
*Report generated by LinkChecker CLI tool*
`;
    }
}
exports.OutputFormatter = OutputFormatter;
//# sourceMappingURL=output-formatter.js.map