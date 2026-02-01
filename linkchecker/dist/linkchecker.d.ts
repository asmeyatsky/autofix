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
export declare class LinkChecker {
    private config;
    private browser?;
    private results;
    private crawled;
    private queue;
    private stats;
    constructor(config: CrawlerConfig);
    check(): Promise<LinkResult[]>;
    private crawl;
    private crawlPage;
    private validateLink;
    private shouldCrawl;
    getStats(): CrawlerStats;
    getDeadLinks(): LinkResult[];
    getValidLinks(): LinkResult[];
    getResults(): LinkResult[];
}
//# sourceMappingURL=linkchecker.d.ts.map