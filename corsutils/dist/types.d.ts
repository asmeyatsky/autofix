export interface CorsConfig {
    origin: string | string[];
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
    maxAge: number;
}
export interface CorsTestResult {
    url: string;
    success: boolean;
    statusCode?: number;
    error?: string;
    corsHeaders: Record<string, string>;
    missingHeaders: string[];
    recommendations: string[];
}
export interface CorsAnalysis {
    frontendUrl?: string;
    backendUrl?: string;
    issues: string[];
    recommendations: string[];
    suggestedConfig: CorsConfig;
}
export interface ServerType {
    name: string;
    frameworks: string[];
    configFiles: string[];
}
//# sourceMappingURL=types.d.ts.map