import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { AutoFixConfig } from '../types';

export async function loadConfig(cliOptions: any): Promise<AutoFixConfig> {
  // Start with CLI options
  let config: AutoFixConfig = {
    url: cliOptions.url,
    project: cliOptions.project,
    llmEndpoint: cliOptions.llmEndpoint,
    timeout: parseInt(cliOptions.timeout) || 10000,
    maxAttempts: parseInt(cliOptions.maxAttempts) || 5,
    headless: cliOptions.headless,
  };

  // Load from config file if it exists
  const configPath = resolve(cliOptions.config);
  try {
    const configFile = await fs.readFile(configPath, 'utf-8');
    const fileConfig = JSON.parse(configFile);
    config = { ...fileConfig, ...config }; // CLI options override file config
  } catch (error) {
    // Config file doesn't exist or is invalid, continue with defaults
  }

  // Load from environment variables
  const envConfig: Partial<AutoFixConfig> = {
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
  config.project = resolve(config.project);

  return config;
}

export async function saveConfig(config: AutoFixConfig, configPath: string = '.autofix.json'): Promise<void> {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}