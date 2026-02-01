export declare class CorsUtils {
    private corsTester;
    private configGenerator;
    private outputFormatter;
    constructor();
    testUrl(url: string, methods?: string[]): Promise<void>;
    testMultipleUrls(urls: string[], methods?: string[]): Promise<void>;
    testPreflight(url: string): Promise<void>;
    analyzeCors(frontendUrl: string, backendUrl: string): Promise<void>;
    generateConfig(serverType: string, origins?: string[]): Promise<void>;
    listServerTypes(): Promise<void>;
    diagnoseCorsIssues(urls: string[]): Promise<void>;
    runCorsTestSuite(urls: string[]): Promise<void>;
}
//# sourceMappingURL=corsutils.d.ts.map