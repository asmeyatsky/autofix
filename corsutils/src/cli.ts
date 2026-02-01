#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CorsUtils } from './corsutils';

const program = new Command();
const corsUtils = new CorsUtils();

// CLI Setup
program
  .name('corsutils')
  .description('CORS troubleshooting and configuration utility')
  .version('1.0.0');

// Test command
program
  .command('test')
  .description('Test CORS for a specific URL')
  .argument('<url>', 'URL to test CORS')
  .option('-m, --methods <methods>', 'HTTP methods to test (comma-separated)', 'GET,POST')
  .action(async (url, options) => {
    try {
      const methods = options.methods.split(',').map((m: string) => m.trim().toUpperCase());
      await corsUtils.testUrl(url, methods);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Test multiple URLs
program
  .command('test-multiple')
  .description('Test CORS for multiple URLs')
  .argument('<urls...>', 'URLs to test CORS')
  .option('-m, --methods <methods>', 'HTTP methods to test (comma-separated)', 'GET,POST')
  .action(async (urls, options) => {
    try {
      const methods = options.methods.split(',').map((m: string) => m.trim().toUpperCase());
      await corsUtils.testMultipleUrls(urls, methods);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Test preflight
program
  .command('preflight')
  .description('Test CORS preflight request (OPTIONS)')
  .argument('<url>', 'URL to test preflight')
  .action(async (url) => {
    try {
      await corsUtils.testPreflight(url);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Analyze CORS
program
  .command('analyze')
  .description('Analyze CORS between frontend and backend')
  .argument('<frontend-url>', 'Frontend URL (e.g., http://localhost:3000)')
  .argument('<backend-url>', 'Backend API URL (e.g., http://localhost:8000)')
  .action(async (frontendUrl, backendUrl) => {
    try {
      await corsUtils.analyzeCors(frontendUrl, backendUrl);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Generate configuration
program
  .command('config')
  .description('Generate CORS configuration for a specific server type')
  .argument('<server-type>', 'Server type (express, fastify, next, nginx, django, etc.)')
  .option('-o, --origins <origins>', 'Allowed origins (comma-separated)', 'http://localhost:3000')
  .action(async (serverType, options) => {
    try {
      const origins = options.origins.split(',').map((o: string) => o.trim());
      await corsUtils.generateConfig(serverType, origins);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// List server types
program
  .command('list')
  .description('List supported server types')
  .action(async () => {
    try {
      await corsUtils.listServerTypes();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Diagnose issues
program
  .command('diagnose')
  .description('Diagnose CORS issues and provide solutions')
  .argument('<urls...>', 'URLs to diagnose')
  .action(async (urls) => {
    try {
      await corsUtils.diagnoseCorsIssues(urls);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Test suite
program
  .command('suite')
  .description('Run comprehensive CORS test suite')
  .argument('<urls...>', 'URLs to test')
  .action(async (urls) => {
    try {
      await corsUtils.runCorsTestSuite(urls);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.blue('🔧 CORS Utils - Cross-Origin Resource Sharing Troubleshooting Tool\n'));
  program.outputHelp();
  console.log(chalk.gray('\nQuick examples:'));
  console.log(chalk.gray('  corsutils test http://localhost:8000/api'));
  console.log(chalk.gray('  corsutils analyze http://localhost:3000 http://localhost:8000'));
  console.log(chalk.gray('  corsutils config express --origins "http://localhost:3000,https://myapp.com"'));
}