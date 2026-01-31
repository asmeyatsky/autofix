#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const autofix_engine_1 = require("./core/autofix-engine");
const config_1 = require("./utils/config");
const validation_1 = require("./utils/validation");
const program = new commander_1.Command();
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
        console.log(chalk_1.default.blue.bold('🔧 AutoFix: Automated Frontend Debugger'));
        console.log('');
        // Load configuration
        const config = await (0, config_1.loadConfig)(options);
        // Validate configuration
        if (!config.url || !(0, validation_1.validateUrl)(config.url)) {
            console.error(chalk_1.default.red('❌ Error: Valid URL is required'));
            process.exit(1);
        }
        console.log(chalk_1.default.gray(`📁 Project: ${config.project}`));
        console.log(chalk_1.default.gray(`🌐 URL: ${config.url}`));
        console.log(chalk_1.default.gray(`⏱️  Timeout: ${config.timeout}ms`));
        console.log(chalk_1.default.gray(`🔄 Max Attempts: ${config.maxAttempts}`));
        console.log('');
        // Initialize and run AutoFix
        const autofix = new autofix_engine_1.AutoFixEngine(config);
        console.log(chalk_1.default.yellow('🚀 Starting AutoFix monitoring...'));
        console.log('');
        const result = await autofix.run();
        if (result.success) {
            console.log('');
            console.log(chalk_1.default.green.bold('✨ Frontend started successfully!'));
            console.log(chalk_1.default.green(`📊 Fixed ${result.errorsFixed || 0} errors in ${result.attempt} attempts`));
            console.log(chalk_1.default.green('🎉 AutoFix complete!'));
        }
        else {
            console.log('');
            console.log(chalk_1.default.red.bold('❌ AutoFix failed to resolve issues'));
            console.log(chalk_1.default.red(`⚠️  Maximum attempts (${config.maxAttempts}) reached`));
            if (result.finalError) {
                console.log(chalk_1.default.red(`🔍 Last error: ${result.finalError || 'Unknown error'}`));
            }
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Unexpected error:'), error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map