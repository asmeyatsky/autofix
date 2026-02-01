import { LinkResult, CrawlerStats } from './linkchecker';
export declare class OutputFormatter {
    private config;
    constructor(config: any);
    printFullResults(results: LinkResult[], stats: CrawlerStats, duration: number): void;
    printSummary(stats: CrawlerStats, duration: number): void;
    printDeadLinks(deadLinks: LinkResult[], stats: CrawlerStats): void;
    saveToFile(results: LinkResult[], stats: CrawlerStats, filePath: string, format: string): Promise<void>;
    private saveAsJson;
    private saveAsCsv;
    private saveAsHtml;
    private saveAsMarkdown;
    private generateHtmlReport;
    private generateMarkdownReport;
}
//# sourceMappingURL=output-formatter.d.ts.map