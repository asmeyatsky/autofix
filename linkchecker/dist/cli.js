#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const linkchecker_1 = require("./linkchecker");
const output_formatter_1 = require("./output-formatter");
const validation_1 = require("./utils/validation");
const program = new commander_1.Command();
program
    .name('linkchecker')
    .description('CLI tool that crawls websites and identifies dead or broken links')
    .version('1.0.0');
program
    .argument('<url>', 'Base URL to start crawling from')
    .option('-d, --max-depth <number>', 'Maximum crawl depth', '3')
    .option('-p, --max-pages <number>', 'Maximum pages to crawl', '100')
    .option('-c, --concurrency <number>', 'Concurrent requests', '5')
    .option('--delay <ms>', 'Delay between requests (ms)', '100')
    .option('-t, --timeout <ms>', 'Request timeout (ms)', '30000')
    .option('-r, --retries <number>', 'Max retries per link', '3')
    .option('--no-follow', 'Don\'t follow redirects', false)
    .option('--user-agent <agent>', 'Custom user agent')
    .option('--output <file>', 'Output file path')
    .option('-f, --format <format>', 'Output format (json|csv|html|markdown)', 'json')
    .option('--include <patterns...>', 'Include URL patterns')
    .option('--exclude <patterns...>', 'Exclude URL patterns')
    .option('--domains <domains...>', 'Limit to specific domains')
    .option('--no-color', 'Disable colored output')
    .option('--summary', 'Show only summary statistics')
    .option('--dead-only', 'Show only dead/broken links')
    .action(async (url, options, command) => {
    try {
        // Validate URL
        if (!(0, validation_1.validateUrl)(url)) {
            console.error(chalk_1.default.red('❌ Error: Invalid URL format'));
            process.exit(1);
        }
        console.log(chalk_1.default.blue.bold('🔗 LinkChecker: Dead Link Finder'));
        console.log(chalk_1.default.gray(`🌐 Starting from: ${url}`));
        console.log('');
        // Build configuration
        const config = {
            baseUrl: url,
            maxDepth: parseInt(options.maxDepth) || 3,
            maxPages: parseInt(options.maxPages) || 100,
            concurrency: parseInt(options.concurrency) || 5,
            delay: parseInt(options.delay) || 100,
            timeout: parseInt(options.timeout) || 30000,
            retries: parseInt(options.retries) || 3,
            followRedirects: !options.noFollow,
            userAgent: options.userAgent || undefined,
            outputFile: options.output,
            format: options.format || 'json',
            allowedDomains: options.domains || [],
            excludePatterns: options.exclude || [],
            includePatterns: options.include || []
        };
        // Show configuration
        console.log(chalk_1.default.gray('⚙️  Configuration:'));
        console.log(chalk_1.default.gray(`   Max depth: ${config.maxDepth}`));
        console.log(chalk_1.default.gray(`   Max pages: ${config.maxPages}`));
        console.log(chalk_1.default.gray(`   Concurrency: ${config.concurrency}`));
        console.log(chalk_1.default.gray(`   Delay: ${config.delay}ms`));
        console.log(chalk_1.default.gray(`   Follow redirects: ${config.followRedirects}`));
        if (config.allowedDomains?.length) {
            console.log(chalk_1.default.gray(`   Allowed domains: ${config.allowedDomains.join(', ')}`));
        }
        console.log('');
        // Initialize link checker
        const linkChecker = new linkchecker_1.LinkChecker(config);
        // Start crawling
        console.log(chalk_1.default.yellow('🚀 Starting link crawl...'));
        const startTime = Date.now();
        const results = await linkChecker.check();
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const stats = linkChecker.getStats();
        // Generate output
        const formatter = new output_formatter_1.OutputFormatter(config);
        if (options.summary) {
            formatter.printSummary(stats, duration);
        }
        else if (options.deadOnly) {
            const deadLinks = linkChecker.getDeadLinks();
            formatter.printDeadLinks(deadLinks, stats);
        }
        else {
            formatter.printFullResults(results, stats, duration);
        }
        // Save to file if specified
        if (config.outputFile) {
            await formatter.saveToFile(results, stats, config.outputFile, config.format || 'json');
        }
        // Exit with appropriate code
        const hasErrors = stats.deadLinks > 0 || stats.errors > 0;
        process.exit(hasErrors ? 1 : 0);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error:'), error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map