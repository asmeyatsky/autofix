import { CorsTestResult } from './types';
export declare class CorsTester {
    private makeRequest;
    private extractCorsHeaders;
    private getRequiredCorsHeaders;
    testUrl(url: string, method?: string): Promise<CorsTestResult>;
    private generateRecommendations;
    testMultipleUrls(urls: string[], methods?: string[]): Promise<CorsTestResult[]>;
    testPreflight(url: string): Promise<CorsTestResult>;
}
//# sourceMappingURL=cors-tester.d.ts.map