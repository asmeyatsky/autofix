import { CorsTestResult, CorsAnalysis } from './types';
export declare class OutputFormatter {
    formatTestResult(result: CorsTestResult): string;
    formatAnalysis(analysis: CorsAnalysis): string;
    formatConfig(config: string, serverType: string): string;
    formatSummary(results: CorsTestResult[]): string;
    private getCommonIssues;
    private formatHeaderName;
    formatServerTypes(serverTypes: any[]): string;
}
//# sourceMappingURL=output-formatter.d.ts.map