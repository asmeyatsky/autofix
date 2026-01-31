import { AutoFixConfig, AutoFixSession, FixResult } from '../types';
export declare class AutoFixEngine {
    private config;
    private browser?;
    private session;
    constructor(config: AutoFixConfig);
    run(): Promise<FixResult>;
    private cleanup;
    getSession(): AutoFixSession;
}
//# sourceMappingURL=autofix-engine.d.ts.map