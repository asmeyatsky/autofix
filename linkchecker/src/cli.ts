#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { LinkChecker, CrawlerConfig, LinkResult, CrawlerStats } from './linkchecker';
import { OutputFormatter } from './output-formatter';
import { validateUrl, generateReportName } from './utils/validation';

const program = new Command();

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
      if (!validateUrl(url)) {
        console.error(chalk.red('❌ Error: Invalid URL format'));
        process.exit(1);
      }

      console.log(chalk.blue.bold('🔗 LinkChecker: Dead Link Finder'));
      console.log(chalk.gray(`🌐 Starting from: ${url}`));
      console.log('');

      // Build configuration
      const config: CrawlerConfig = {
        baseUrl: url,
        maxDepth: parseInt(options.maxDepth as string) || 3,
        maxPages: parseInt(options.maxPages as string) || 100,
        concurrency: parseInt(options.concurrency as string) || 5,
        delay: parseInt(options.delay as string) || 100,
        timeout: parseInt(options.timeout as string) || 30000,
        retries: parseInt(options.retries as string) || 3,
        followRedirects: !options.noFollow,
        userAgent: options.userAgent as string || undefined,
        outputFile: options.output as string,
        format: (options.format as string) as any || 'json',
        allowedDomains: options.domains as string[] || [],
        excludePatterns: options.exclude as string[] || [],
        includePatterns: options.include as string[] || []
      };

      // Show configuration
      console.log(chalk.gray('⚙️  Configuration:'));
      console.log(chalk.gray(`   Max depth: ${config.maxDepth}`));
      console.log(chalk.gray(`   Max pages: ${config.maxPages}`));
      console.log(chalk.gray(`   Concurrency: ${config.concurrency}`));
      console.log(chalk.gray(`   Delay: ${config.delay}ms`));
      console.log(chalk.gray(`   Follow redirects: ${config.followRedirects}`));
      if (config.allowedDomains?.length) {
        console.log(chalk.gray(`   Allowed domains: ${config.allowedDomains.join(', ')}`));
      }
      console.log('');

      // Initialize link checker
      const linkChecker = new LinkChecker(config);
      
      // Start crawling
      console.log(chalk.yellow('🚀 Starting link crawl...'));
      const startTime = Date.now();

      const results = await linkChecker.check();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const stats = linkChecker.getStats();

      // Generate output
      const formatter = new OutputFormatter(config);
      
      if (options.summary) {
        formatter.printSummary(stats, duration);
      } else if (options.deadOnly) {
        const deadLinks = linkChecker.getDeadLinks();
        formatter.printDeadLinks(deadLinks, stats);
      } else {
        formatter.printFullResults(results, stats, duration);
      }

      // Save to file if specified
      if (config.outputFile) {
        await formatter.saveToFile(results, stats, config.outputFile, config.format || 'json');
      }

      // Exit with appropriate code
      const hasErrors = stats.deadLinks > 0 || stats.errors > 0;
      process.exit(hasErrors ? 1 : 0);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();