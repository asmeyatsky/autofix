import { AutoFixConfig, LLMFix } from '../types';
export declare class CodeFixer {
    private config;
    constructor(config: AutoFixConfig);
    applyFixes(fixes: LLMFix[]): Promise<void>;
    private applyFix;
    private replaceCode;
    private normalizeCode;
    private createBackup;
    validateFix(fix: LLMFix): Promise<boolean>;
    private validateJavaScriptSyntax;
    rollbackBackup(filePath: string): Promise<void>;
    private findBackupFiles;
    private cleanupBackups;
}
//# sourceMappingURL=code-fixer.d.ts.map