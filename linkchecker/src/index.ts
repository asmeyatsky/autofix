// Main entry point for LinkChecker CLI
// This file just re-exports the CLI

export { LinkChecker, CrawlerConfig, LinkResult, CrawlerStats } from './linkchecker';

// Run CLI if this file is executed directly
if (require.main === module) {
  require('./cli');
}