import puppeteer, { Browser, Page } from 'puppeteer';
import { URL } from 'url';

export interface LinkResult {
  url: string;
  statusCode?: number;
  statusText?: string;
  error?: string;
  sourceUrl: string;
  linkText?: string;
  responseTime?: number;
  contentType?: string;
  redirectChain?: string[];
}

export interface CrawlerConfig {
  baseUrl: string;
  maxDepth?: number;
  maxPages?: number;
  concurrency?: number;
  delay?: number;
  userAgent?: string;
  timeout?: number;
  retries?: number;
  followRedirects?: boolean;
  allowedDomains?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
  outputFile?: string;
  format?: 'json' | 'csv' | 'html' | 'markdown';
}

export interface CrawlerStats {
  totalPages: number;
  checkedLinks: number;
  deadLinks: number;
  validLinks: number;
  redirectedLinks: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class LinkChecker {
  private config: CrawlerConfig;
  private browser?: Browser;
  private results: LinkResult[] = [];
  private crawled: Set<string> = new Set();
  private queue: string[] = [];
  private stats: CrawlerStats;

  constructor(config: CrawlerConfig) {
    this.config = {
      maxDepth: 3,
      maxPages: 100,
      concurrency: 5,
      delay: 100,
      timeout: 30000,
      retries: 3,
      followRedirects: true,
      userAgent: 'LinkChecker/1.0 (+https://github.com/asmeyatsky/autofix)',
      format: 'json',
      ...config
    };

    this.stats = {
      totalPages: 0,
      checkedLinks: 0,
      deadLinks: 0,
      validLinks: 0,
      redirectedLinks: 0,
      errors: 0,
      startTime: new Date()
    };
  }

  async check(): Promise<LinkResult[]> {
    try {
      // Initialize browser with more robust settings
      this.browser = await puppeteer.launch({
        headless: true,
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      // Start crawling
      this.queue.push(this.config.baseUrl);
      await this.crawl();

      this.stats.endTime = new Date();
      this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();

      return this.results;
    } catch (error) {
      console.error('Browser error:', error);
      // Return results collected so far even if browser fails
      this.stats.endTime = new Date();
      this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
      return this.results;
    } finally {
      try {
        if (this.browser) {
          await this.browser.close();
        }
      } catch (closeError) {
        // Ignore close errors
        console.warn('Browser close warning:', closeError.message);
      }
    }
  }

  private async crawl(): Promise<void> {
    while (this.queue.length > 0 && this.stats.totalPages < (this.config.maxPages || 100)) {
      const batch = this.queue.splice(0, this.config.concurrency || 5);
      
      await Promise.allSettled(
        batch.map(url => this.crawlPage(url))
      );

      // Rate limiting
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.delay || 100));
      }
    }
  }

  private async crawlPage(url: string): Promise<void> {
    if (this.crawled.has(url) || this.stats.totalPages >= (this.config.maxPages || 100)) {
      return;
    }

    this.crawled.add(url);
    this.stats.totalPages++;

    const page = await this.browser!.newPage();
    
    try {
      // Set user agent
      await page.setUserAgent(this.config.userAgent || 'LinkChecker/1.0');

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });

      // Extract links
      const links = await page.evaluate(() => {
        const linkElements = document.querySelectorAll('a[href]');
        return Array.from(linkElements).map(link => ({
          url: (link as HTMLAnchorElement).href,
          text: (link as HTMLAnchorElement).textContent?.trim() || '',
          src: window.location.href
        }));
      });

      // Process each link
      for (const link of links) {
        const result = await this.validateLink(link.url, link.src, link.text);
        this.results.push(result);
        this.stats.checkedLinks++;

        // Update stats
        if (result.statusCode && result.statusCode >= 400) {
          this.stats.deadLinks++;
        } else if (result.statusCode && result.statusCode >= 300 && result.statusCode < 400) {
          this.stats.redirectedLinks++;
        } else if (result.statusCode && result.statusCode >= 200 && result.statusCode < 300) {
          this.stats.validLinks++;
        } else if (result.error) {
          this.stats.errors++;
        }

        // Add to queue if it's a valid internal link
        if (this.shouldCrawl(link.url, link.src)) {
          this.queue.push(link.url);
        }
      }

    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    } finally {
      await page.close();
    }
  }

  private async validateLink(url: string, sourceUrl: string, linkText?: string): Promise<LinkResult> {
    const result: LinkResult = {
      url,
      sourceUrl,
      linkText,
      responseTime: 0,
      contentType: ''
    };

    try {
      const startTime = Date.now();
      
      // Validate URL format
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        result.error = 'Invalid URL format';
        return result;
      }

      // Skip non-HTTP protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return result; // Skip mailto, tel, javascript, etc.
      }

      // Make HTTP request
      const axios = require('axios');
      
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true, // Don't throw on HTTP errors
        maxRedirects: this.config.followRedirects ? 5 : 0,
        headers: {
          'User-Agent': this.config.userAgent || 'LinkChecker/1.0'
        }
      });

      result.responseTime = Date.now() - startTime;
      result.statusCode = response.status;
      result.statusText = response.statusText;
      result.contentType = response.headers['content-type'] || '';

      // Track redirect chain
      if (response.request && response.request.res && response.request.res.responseUrl) {
        result.redirectChain = [url, response.request.res.responseUrl];
      }

    } catch (error: any) {
      result.error = error.message || 'Unknown error';
      result.responseTime = Date.now() - (result.responseTime || Date.now());

      if (error.response) {
        result.statusCode = error.response.status;
        result.statusText = error.response.statusText;
      }
    }

    return result;
  }

  private shouldCrawl(url: string, sourceUrl: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const parsedSource = new URL(sourceUrl);

      // Same domain check
      if (parsedUrl.hostname !== parsedSource.hostname) {
        return false;
      }

      // Depth check
      const urlPath = parsedUrl.pathname;
      const sourcePath = parsedSource.pathname;
      
      // Simple depth calculation (can be improved)
      const depth = urlPath.split('/').length - 1;
      if (depth > (this.config.maxDepth || 3)) {
        return false;
      }

      // Exclude patterns
      if (this.config.excludePatterns) {
        for (const pattern of this.config.excludePatterns) {
          if (url.match(pattern)) {
            return false;
          }
        }
      }

      // Include patterns (if specified)
      if (this.config.includePatterns) {
        for (const pattern of this.config.includePatterns) {
          if (url.match(pattern)) {
            return true;
          }
        }
        return false; // No match if include patterns are specified
      }

      return true;

    } catch {
      return false;
    }
  }

  getStats(): CrawlerStats {
    return { ...this.stats };
  }

  getDeadLinks(): LinkResult[] {
    return this.results.filter(link => 
      (link.statusCode && link.statusCode >= 400) || link.error
    );
  }

  getValidLinks(): LinkResult[] {
    return this.results.filter(link => 
      link.statusCode && link.statusCode >= 200 && link.statusCode < 400
    );
  }

  getResults(): LinkResult[] {
    return [...this.results];
  }
}