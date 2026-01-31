"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserMonitor = void 0;
class BrowserMonitor {
    constructor(browser, config) {
        this.browser = browser;
        this.config = config;
    }
    async monitorFrontend() {
        const page = await this.browser.newPage();
        try {
            // Set up error and log capture
            const consoleMessages = [];
            const networkErrors = [];
            let pageLoadError;
            // Capture console messages
            page.on('console', (msg) => {
                const message = {
                    type: msg.type(),
                    text: msg.text(),
                    timestamp: Date.now(),
                };
                if (message.type === 'error' || message.type === 'warn') {
                    consoleMessages.push(message);
                }
            });
            // Capture network errors
            page.on('requestfailed', (request) => {
                const failure = request.failure();
                if (failure) {
                    networkErrors.push({
                        url: request.url(),
                        status: 0,
                        statusText: failure.errorText,
                        timestamp: Date.now(),
                    });
                }
            });
            // Capture response errors
            page.on('response', (response) => {
                const status = response.status();
                if (status >= 400) {
                    networkErrors.push({
                        url: response.url(),
                        status: status,
                        statusText: response.statusText(),
                        timestamp: Date.now(),
                    });
                }
            });
            const startTime = Date.now();
            // Navigate to the URL with timeout
            await page.goto(this.config.url, {
                waitUntil: ['networkidle2', 'domcontentloaded'],
                timeout: this.config.timeout || 10000,
            });
            // Wait for additional time to detect runtime errors
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Check if page loaded successfully by looking for common success indicators
            const isSuccess = await this.checkPageSuccess(page);
            if (!isSuccess && consoleMessages.length === 0 && networkErrors.length === 0) {
                // If no clear errors detected but page isn't successful, try to detect issues
                const hasErrorElements = await page.evaluate(() => {
                    const errorSelectors = [
                        '[class*="error"]',
                        '[id*="error"]',
                        '.error-boundary',
                        '.error-message',
                        '[data-testid*="error"]'
                    ];
                    return errorSelectors.some(selector => {
                        const element = document.querySelector(selector);
                        if (element && element.textContent) {
                            const text = element.textContent.trim();
                            return text.length > 0 && !text.match(/^\s*$/);
                        }
                        return false;
                    });
                });
                if (hasErrorElements) {
                    const errorTexts = await page.evaluate(() => {
                        const errorSelectors = [
                            '[class*="error"]',
                            '[id*="error"]',
                            '.error-boundary',
                            '.error-message',
                            '[data-testid*="error"]'
                        ];
                        return errorSelectors.map(selector => {
                            const element = document.querySelector(selector);
                            return element ? element.textContent?.trim() : '';
                        }).filter(text => text && text.length > 0);
                    });
                    errorTexts.forEach(text => {
                        consoleMessages.push({
                            type: 'error',
                            text: text || '',
                            timestamp: Date.now(),
                        });
                    });
                }
            }
            const endTime = Date.now();
            if (isSuccess && consoleMessages.length === 0 && networkErrors.length === 0) {
                return {
                    success: true,
                    renderTime: endTime - startTime,
                };
            }
            // Take screenshot for debugging
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: true,
            });
            const detectedError = {
                consoleErrors: consoleMessages,
                networkErrors: networkErrors,
                pageLoadError,
                screenshot,
                timestamp: endTime,
            };
            return {
                success: false,
                error: detectedError,
                renderTime: endTime - startTime,
            };
        }
        catch (error) {
            const detectedError = {
                consoleErrors: [],
                networkErrors: [],
                pageLoadError: error instanceof Error ? error.message : 'Unknown error',
                screenshot: await page.screenshot().catch(() => Buffer.from('')),
                timestamp: Date.now(),
            };
            return {
                success: false,
                error: detectedError,
            };
        }
        finally {
            await page.close();
        }
    }
    async checkPageSuccess(page) {
        try {
            // Check for common success indicators
            const successChecks = await Promise.allSettled([
                // Check if body is not empty
                page.evaluate(() => document.body && document.body.children.length > 0),
                // Check for loading indicators to be gone
                page.evaluate(() => {
                    const loadingSelectors = [
                        '.loading',
                        '.spinner',
                        '[class*="loading"]',
                        '[class*="spinner"]',
                        '[data-testid*="loading"]'
                    ];
                    return !loadingSelectors.some(selector => {
                        const element = document.querySelector(selector);
                        return element && element.offsetParent !== null;
                    });
                }),
                // Check for React root
                page.evaluate(() => {
                    const reactRoot = document.querySelector('#root, #app, [data-reactroot]');
                    return reactRoot !== null;
                }),
                // Check for no console errors
                page.evaluate(() => {
                    return !window.console || !window.console.error;
                }),
                // Check for specific framework success patterns
                page.evaluate(() => {
                    // React development tools
                    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
                        return true;
                    // Vue devtools
                    if (window.__VUE__)
                        return true;
                    // Angular
                    if (window.ng)
                        return true;
                    // Check if there's any meaningful content
                    const body = document.body;
                    if (!body)
                        return false;
                    const text = body.textContent || '';
                    const cleanText = text.replace(/\s+/g, '').trim();
                    return cleanText.length > 50; // Some meaningful content
                }),
            ]);
            // Consider it successful if at least 3 checks pass
            const passedChecks = successChecks.filter(result => result.status === 'fulfilled' && result.value === true).length;
            return passedChecks >= 3;
        }
        catch (error) {
            // If any check throws, consider it failed
            return false;
        }
    }
}
exports.BrowserMonitor = BrowserMonitor;
//# sourceMappingURL=browser-monitor.js.map