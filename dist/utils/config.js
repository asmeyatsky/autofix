"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
const fs_1 = require("fs");
const path_1 = require("path");
async function loadConfig(cliOptions) {
    // Start with CLI options
    let config = {
        url: cliOptions.url,
        project: cliOptions.project,
        llmEndpoint: cliOptions.llmEndpoint,
        timeout: parseInt(cliOptions.timeout) || 10000,
        maxAttempts: parseInt(cliOptions.maxAttempts) || 5,
        headless: cliOptions.headless,
    };
    // Load from config file if it exists
    const configPath = (0, path_1.resolve)(cliOptions.config);
    try {
        const configFile = await fs_1.promises.readFile(configPath, 'utf-8');
        const fileConfig = JSON.parse(configFile);
        config = { ...fileConfig, ...config }; // CLI options override file config
    }
    catch (error) {
        // Config file doesn't exist or is invalid, continue with defaults
    }
    // Load from environment variables
    const envConfig = {
        llmEndpoint: process.env.AUTOFIX_LLM_ENDPOINT,
        llmApiKey: process.env.AUTOFIX_LLM_API_KEY,
        project: process.env.AUTOFIX_PROJECT,
    };
    config = { ...config, ...envConfig };
    // Set defaults for missing values
    if (!config.project) {
        config.project = './';
    }
    if (!config.timeout) {
        config.timeout = 10000;
    }
    if (!config.maxAttempts) {
        config.maxAttempts = 5;
    }
    if (config.headless === undefined) {
        config.headless = false;
    }
    // Make project path absolute
    config.project = (0, path_1.resolve)(config.project);
    return config;
}
async function saveConfig(config, configPath = '.autofix.json') {
    await fs_1.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
//# sourceMappingURL=config.js.map