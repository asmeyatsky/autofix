import { AutoFixConfig, DetectedError, FixResult } from '../types';
export declare class LLMService {
    private config;
    private httpClient;
    constructor(config: AutoFixConfig);
    generateFix(detectedError: DetectedError): Promise<FixResult>;
    private findRelevantFiles;
    private mapUrlToFilePath;
    private prepareContext;
    private buildPrompt;
    private getFileLanguage;
    private callLLM;
    private parseResponse;
}
//# sourceMappingURL=llm-service.d.ts.map