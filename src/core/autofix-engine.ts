import puppeteer, { Browser, Page } from 'puppeteer';
import chalk from 'chalk';
import ora from 'ora';
import { AutoFixConfig, AutoFixSession, FixResult, DetectedError, MonitoringResult } from '../types';
import { BrowserMonitor } from './browser-monitor';
import { LLMService } from './llm-service';
import { CodeFixer } from './code-fixer';
import { generateSessionId, formatDuration } from '../utils/validation';

export class AutoFixEngine {
  private config: AutoFixConfig;
  private browser?: Browser;
  private session: AutoFixSession;

  constructor(config: AutoFixConfig) {
    this.config = config;
    this.session = {
      id: generateSessionId(),
      startTime: new Date(),
      attempts: 0,
      errorsFixed: 0,
    };
  }

  async run(): Promise<FixResult> {
    const spinner = ora('Initializing AutoFix...').start();

    try {
      // Initialize browser
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        devtools: !this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Initialize services
      const monitor = new BrowserMonitor(this.browser, this.config);
      const llmService = new LLMService(this.config);
      const codeFixer = new CodeFixer(this.config);

      spinner.succeed('AutoFix initialized');
      console.log(chalk.gray(`🆔 Session: ${this.session.id}`));

      let lastError: DetectedError | undefined;
      let finalResult: FixResult | undefined;

      // Main monitoring loop
      for (let attempt = 1; attempt <= (this.config.maxAttempts || 5); attempt++) {
        this.session.attempts = attempt;
        
        console.log(chalk.yellow(`\n🔄 Attempt ${attempt}/${this.config.maxAttempts}`));
        
        const attemptSpinner = ora('Monitoring frontend startup...').start();

        try {
          // Monitor the frontend
          const result = await monitor.monitorFrontend();
          
          if (result.success) {
            this.session.endTime = new Date();
            const duration = this.session.endTime.getTime() - this.session.startTime.getTime();
            
            attemptSpinner.succeed(chalk.green('Frontend started successfully!'));
            console.log(chalk.gray(`⏱️  Startup time: ${formatDuration(result.renderTime || 0)}`));
            
            return {
              success: true,
              fixes: [],
              explanation: 'Frontend started successfully without errors.',
              attempt,
            };
          }

          // Error detected
          if (result.error) {
            lastError = result.error;
            attemptSpinner.fail(chalk.red('Error detected'));
            
            console.log(chalk.red(`❌ ${result.error.consoleErrors.length} console errors, ${result.error.networkErrors.length} network errors`));
            
            // Get fix from LLM
            const fixSpinner = ora('🤖 Analyzing errors with LLM...').start();
            
            try {
              const fixResult = await llmService.generateFix(result.error);
              
              if (fixResult.fixes.length > 0) {
                fixSpinner.succeed(chalk.green('Fix generated'));
                console.log(chalk.green(`💡 Found ${fixResult.fixes.length} potential fix(es)`));
                
                // Apply fixes
                const applySpinner = ora('🔧 Applying fixes...').start();
                
                try {
                  await codeFixer.applyFixes(fixResult.fixes);
                  this.session.errorsFixed += fixResult.fixes.length;
                  applySpinner.succeed(chalk.green('Fixes applied'));
                  
                  console.log(chalk.blue('🔄 Refreshing page to verify fix...'));
                  finalResult = fixResult;
                  
                } catch (applyError) {
                  applySpinner.fail(chalk.red('Failed to apply fixes'));
                  console.log(chalk.red('⚠️  Continuing to next attempt...'));
                }
              } else {
                fixSpinner.warn(chalk.yellow('No fixes generated'));
                console.log(chalk.yellow('⚠️  No suitable fixes found, continuing...'));
              }
            } catch (llmError) {
              fixSpinner.fail(chalk.red('LLM analysis failed'));
              console.log(chalk.red('⚠️  Continuing to next attempt...'));
            }
          }

        } catch (monitorError) {
          attemptSpinner.fail(chalk.red('Monitoring failed'));
          console.log(chalk.red(`⚠️  Error: ${monitorError}`));
        }

        // Wait a bit before next attempt
        if (attempt < (this.config.maxAttempts || 5)) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // All attempts failed
      this.session.endTime = new Date();
      const duration = this.session.endTime.getTime() - this.session.startTime.getTime();
      
      console.log(chalk.red(`\n❌ AutoFix failed after ${this.config.maxAttempts} attempts`));
      console.log(chalk.gray(`⏱️  Total time: ${formatDuration(duration)}`));
      
      if (lastError) {
        console.log(chalk.red(`🔍 Last error: ${lastError.consoleErrors[0]?.text || 'Unknown error'}`));
      }

      return {
        success: false,
        fixes: finalResult?.fixes || [],
        explanation: finalResult?.explanation || 'Failed to fix frontend errors after maximum attempts.',
        attempt: this.session.attempts,
      };

    } catch (error) {
      spinner.fail('AutoFix failed to initialize');
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  getSession(): AutoFixSession {
    return this.session;
  }
}