"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoFixEngine = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const browser_monitor_1 = require("./browser-monitor");
const llm_service_1 = require("./llm-service");
const code_fixer_1 = require("./code-fixer");
const validation_1 = require("../utils/validation");
class AutoFixEngine {
    constructor(config) {
        this.config = config;
        this.session = {
            id: (0, validation_1.generateSessionId)(),
            startTime: new Date(),
            attempts: 0,
            errorsFixed: 0,
        };
    }
    async run() {
        const spinner = (0, ora_1.default)('Initializing AutoFix...').start();
        try {
            // Initialize browser
            this.browser = await puppeteer_1.default.launch({
                headless: this.config.headless,
                devtools: !this.config.headless,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            // Initialize services
            const monitor = new browser_monitor_1.BrowserMonitor(this.browser, this.config);
            const llmService = new llm_service_1.LLMService(this.config);
            const codeFixer = new code_fixer_1.CodeFixer(this.config);
            spinner.succeed('AutoFix initialized');
            console.log(chalk_1.default.gray(`🆔 Session: ${this.session.id}`));
            let lastError;
            let finalResult;
            // Main monitoring loop
            for (let attempt = 1; attempt <= (this.config.maxAttempts || 5); attempt++) {
                this.session.attempts = attempt;
                console.log(chalk_1.default.yellow(`\n🔄 Attempt ${attempt}/${this.config.maxAttempts}`));
                const attemptSpinner = (0, ora_1.default)('Monitoring frontend startup...').start();
                try {
                    // Monitor the frontend
                    const result = await monitor.monitorFrontend();
                    if (result.success) {
                        this.session.endTime = new Date();
                        const duration = this.session.endTime.getTime() - this.session.startTime.getTime();
                        attemptSpinner.succeed(chalk_1.default.green('Frontend started successfully!'));
                        console.log(chalk_1.default.gray(`⏱️  Startup time: ${(0, validation_1.formatDuration)(result.renderTime || 0)}`));
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
                        attemptSpinner.fail(chalk_1.default.red('Error detected'));
                        console.log(chalk_1.default.red(`❌ ${result.error.consoleErrors.length} console errors, ${result.error.networkErrors.length} network errors`));
                        // Get fix from LLM
                        const fixSpinner = (0, ora_1.default)('🤖 Analyzing errors with LLM...').start();
                        try {
                            const fixResult = await llmService.generateFix(result.error);
                            if (fixResult.fixes.length > 0) {
                                fixSpinner.succeed(chalk_1.default.green('Fix generated'));
                                console.log(chalk_1.default.green(`💡 Found ${fixResult.fixes.length} potential fix(es)`));
                                // Apply fixes
                                const applySpinner = (0, ora_1.default)('🔧 Applying fixes...').start();
                                try {
                                    await codeFixer.applyFixes(fixResult.fixes);
                                    this.session.errorsFixed += fixResult.fixes.length;
                                    applySpinner.succeed(chalk_1.default.green('Fixes applied'));
                                    console.log(chalk_1.default.blue('🔄 Refreshing page to verify fix...'));
                                    finalResult = fixResult;
                                }
                                catch (applyError) {
                                    applySpinner.fail(chalk_1.default.red('Failed to apply fixes'));
                                    console.log(chalk_1.default.red('⚠️  Continuing to next attempt...'));
                                }
                            }
                            else {
                                fixSpinner.warn(chalk_1.default.yellow('No fixes generated'));
                                console.log(chalk_1.default.yellow('⚠️  No suitable fixes found, continuing...'));
                            }
                        }
                        catch (llmError) {
                            fixSpinner.fail(chalk_1.default.red('LLM analysis failed'));
                            console.log(chalk_1.default.red('⚠️  Continuing to next attempt...'));
                        }
                    }
                }
                catch (monitorError) {
                    attemptSpinner.fail(chalk_1.default.red('Monitoring failed'));
                    console.log(chalk_1.default.red(`⚠️  Error: ${monitorError}`));
                }
                // Wait a bit before next attempt
                if (attempt < (this.config.maxAttempts || 5)) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            // All attempts failed
            this.session.endTime = new Date();
            const duration = this.session.endTime.getTime() - this.session.startTime.getTime();
            console.log(chalk_1.default.red(`\n❌ AutoFix failed after ${this.config.maxAttempts} attempts`));
            console.log(chalk_1.default.gray(`⏱️  Total time: ${(0, validation_1.formatDuration)(duration)}`));
            if (lastError) {
                console.log(chalk_1.default.red(`🔍 Last error: ${lastError.consoleErrors[0]?.text || 'Unknown error'}`));
            }
            return {
                success: false,
                fixes: finalResult?.fixes || [],
                explanation: finalResult?.explanation || 'Failed to fix frontend errors after maximum attempts.',
                attempt: this.session.attempts,
            };
        }
        catch (error) {
            spinner.fail('AutoFix failed to initialize');
            throw error;
        }
        finally {
            await this.cleanup();
        }
    }
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
    getSession() {
        return this.session;
    }
}
exports.AutoFixEngine = AutoFixEngine;
//# sourceMappingURL=autofix-engine.js.map