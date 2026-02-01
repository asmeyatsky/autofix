import { CorsConfig, CorsAnalysis, ServerType } from './types';
export declare class CorsConfigGenerator {
    private serverTypes;
    generateBasicCorsConfig(allowedOrigins?: string[]): CorsConfig;
    generateExpressConfig(config: CorsConfig): string;
    generateFastifyConfig(config: CorsConfig): string;
    generateNextConfig(config: CorsConfig): string;
    generateNginxConfig(config: CorsConfig): string;
    generateDjangoConfig(config: CorsConfig): string;
    generateConfig(serverType: string, config: CorsConfig): string;
    analyzeCorsIssues(testResults: any[], frontendUrl?: string, backendUrl?: string): CorsAnalysis;
    getServerTypes(): ServerType[];
    detectServerType(directory: string): ServerType[];
}
//# sourceMappingURL=config-generator.d.ts.map