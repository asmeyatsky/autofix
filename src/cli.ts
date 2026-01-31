#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { AutoFixConfig } from './types';
import { AutoFixEngine } from './core/autofix-engine';
import { loadConfig } from './utils/config';
import { validateUrl } from './utils/validation';

const program = new Command();

program
  .name('autofix')
  .description('Automated Frontend Debugger - CLI tool that monitors frontend startup and fixes errors automatically')
  .version('1.0.0');

program
  .option('-u, --url <url>', 'Frontend URL to monitor')
  .option('-p, --project <path>', 'Project directory containing source code', './')
  .option('-l, --llm-endpoint <url>', 'Custom LLM API endpoint')
  .option('-t, --timeout <ms>', 'Startup timeout in milliseconds', '10000')
  .option('-m, --max-attempts <number>', 'Maximum fix attempts', '5')
  .option('--headless', 'Run in headless mode', false)
  .option('--config <path>', 'Path to config file', '.autofix.json')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🔧 AutoFix: Automated Frontend Debugger'));
      console.log('');

      // Load configuration
      const config = await loadConfig(options);
      
      // Validate configuration
      if (!config.url || !validateUrl(config.url)) {
        console.error(chalk.red('❌ Error: Valid URL is required'));
        process.exit(1);
      }

      console.log(chalk.gray(`📁 Project: ${config.project}`));
      console.log(chalk.gray(`🌐 URL: ${config.url}`));
      console.log(chalk.gray(`⏱️  Timeout: ${config.timeout}ms`));
      console.log(chalk.gray(`🔄 Max Attempts: ${config.maxAttempts}`));
      console.log('');

      // Initialize and run AutoFix
      const autofix = new AutoFixEngine(config);
      
      console.log(chalk.yellow('🚀 Starting AutoFix monitoring...'));
      console.log('');

      const result = await autofix.run();

      if (result.success) {
        console.log('');
        console.log(chalk.green.bold('✨ Frontend started successfully!'));
        console.log(chalk.green(`📊 Fixed ${result.errorsFixed || 0} errors in ${result.attempt} attempts`));
        console.log(chalk.green('🎉 AutoFix complete!'));
      } else {
        console.log('');
        console.log(chalk.red.bold('❌ AutoFix failed to resolve issues'));
        console.log(chalk.red(`⚠️  Maximum attempts (${config.maxAttempts}) reached`));
        if (result.finalError) {
          console.log(chalk.red(`🔍 Last error: ${result.finalError || 'Unknown error'}`));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), error);
      process.exit(1);
    }
  });

program.parse();