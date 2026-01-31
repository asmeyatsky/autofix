"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFixer = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const validation_1 = require("../utils/validation");
class CodeFixer {
    constructor(config) {
        this.config = config;
    }
    async applyFixes(fixes) {
        for (const fix of fixes) {
            await this.applyFix(fix);
        }
    }
    async applyFix(fix) {
        try {
            // Validate file path and existence
            const filePath = (0, path_1.resolve)(this.config.project || '.', fix.filePath);
            try {
                await fs_1.promises.access(filePath);
            }
            catch {
                throw new Error(`File not found: ${filePath}`);
            }
            // Read current file content
            const currentContent = await fs_1.promises.readFile(filePath, 'utf-8');
            // Find and replace the original code
            const updatedContent = this.replaceCode(currentContent, fix);
            // Create backup before modifying
            await this.createBackup(filePath, currentContent);
            // Write the updated content
            await fs_1.promises.writeFile(filePath, updatedContent, 'utf-8');
            console.log(`✅ Fixed: ${fix.filePath} - ${fix.explanation}`);
        }
        catch (error) {
            console.error(`❌ Failed to apply fix to ${fix.filePath}:`, error);
            throw error;
        }
    }
    replaceCode(content, fix) {
        const { originalCode, fixedCode } = fix;
        // Try exact match first
        if (content.includes(originalCode)) {
            return content.replace(originalCode, fixedCode);
        }
        // Try fuzzy matching by normalizing whitespace
        const normalizedOriginal = this.normalizeCode(originalCode);
        const normalizedContent = this.normalizeCode(content);
        if (normalizedContent.includes(normalizedOriginal)) {
            // Find the original code in the normalized content and get its position
            const index = normalizedContent.indexOf(normalizedOriginal);
            // Map back to original content position (approximate)
            const lines = content.split('\n');
            const originalLines = originalCode.split('\n');
            // Try to find the matching lines in the original content
            for (let i = 0; i <= lines.length - originalLines.length; i++) {
                const candidateLines = lines.slice(i, i + originalLines.length);
                const normalizedCandidate = this.normalizeCode(candidateLines.join('\n'));
                if (normalizedCandidate === normalizedOriginal) {
                    // Replace the lines
                    const beforeLines = lines.slice(0, i);
                    const afterLines = lines.slice(i + originalLines.length);
                    const fixedLines = fixedCode.split('\n');
                    return [...beforeLines, ...fixedLines, ...afterLines].join('\n');
                }
            }
        }
        // Try line-by-line partial matching
        const originalLines = originalCode.trim().split('\n');
        const contentLines = content.split('\n');
        // Find the best matching location
        let bestMatchIndex = -1;
        let bestMatchScore = 0;
        for (let i = 0; i <= contentLines.length - originalLines.length; i++) {
            let matchScore = 0;
            for (let j = 0; j < originalLines.length; j++) {
                const contentLine = contentLines[i + j].trim();
                const originalLine = originalLines[j].trim();
                if (contentLine === originalLine) {
                    matchScore += 1;
                }
                else if (contentLine.includes(originalLine) || originalLine.includes(contentLine)) {
                    matchScore += 0.5;
                }
            }
            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                bestMatchIndex = i;
            }
        }
        // If we found a decent match (at least 50% similarity), apply the fix
        if (bestMatchScore >= originalLines.length * 0.5 && bestMatchIndex >= 0) {
            const beforeLines = contentLines.slice(0, bestMatchIndex);
            const afterLines = contentLines.slice(bestMatchIndex + originalLines.length);
            const fixedLines = fixedCode.split('\n');
            return [...beforeLines, ...fixedLines, ...afterLines].join('\n');
        }
        // If no match found, throw an error
        throw new Error(`Could not find matching code to replace in ${fix.filePath}`);
    }
    normalizeCode(code) {
        // Normalize whitespace, comments, and formatting for better matching
        return code
            .split('\n')
            .map(line => {
            // Remove comments and normalize whitespace
            let normalized = line.trim();
            // Remove single-line comments (but preserve URL-like strings)
            if (normalized.includes('//') && !normalized.includes('http')) {
                normalized = normalized.split('//')[0].trim();
            }
            // Normalize multiple spaces to single space
            normalized = normalized.replace(/\s+/g, ' ');
            return normalized;
        })
            .filter(line => line.length > 0) // Remove empty lines
            .join('\n')
            .toLowerCase();
    }
    async createBackup(filePath, content) {
        try {
            const backupPath = `${filePath}.autofix.backup.${Date.now()}`;
            await fs_1.promises.writeFile(backupPath, content, 'utf-8');
        }
        catch (error) {
            // Backup creation should not fail the entire process
            console.warn(`Warning: Could not create backup for ${filePath}:`, error);
        }
    }
    async validateFix(fix) {
        try {
            // Read current file content
            const filePath = (0, path_1.resolve)(this.config.project || '.', fix.filePath);
            const currentContent = await fs_1.promises.readFile(filePath, 'utf-8');
            // Check if original code exists
            if (!currentContent.includes(fix.originalCode)) {
                return false;
            }
            // Basic syntax validation for JavaScript/TypeScript files
            if ((0, validation_1.isJavaScriptFile)(filePath)) {
                return this.validateJavaScriptSyntax(fix.fixedCode);
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async validateJavaScriptSyntax(code) {
        try {
            // Basic syntax validation - this is a simplified check
            // In a production tool, you'd use a proper parser like Babel or TypeScript
            // Check for balanced brackets, parentheses, and braces
            const brackets = { '(': ')', '[': ']', '{': '}' };
            const stack = [];
            for (let i = 0; i < code.length; i++) {
                const char = code[i];
                if (char in brackets) {
                    stack.push(char);
                }
                else if (Object.values(brackets).includes(char)) {
                    if (stack.length === 0)
                        return false;
                    const last = stack.pop();
                    if (brackets[last] !== char)
                        return false;
                }
            }
            return stack.length === 0;
        }
        catch (error) {
            return false;
        }
    }
    async rollbackBackup(filePath) {
        try {
            const backupFiles = await this.findBackupFiles(filePath);
            if (backupFiles.length > 0) {
                // Get the most recent backup
                const latestBackup = backupFiles[backupFiles.length - 1];
                const backupContent = await fs_1.promises.readFile(latestBackup, 'utf-8');
                await fs_1.promises.writeFile(filePath, backupContent, 'utf-8');
                console.log(`🔄 Rolled back ${filePath} to backup`);
                // Clean up old backups
                await this.cleanupBackups(filePath);
            }
        }
        catch (error) {
            console.error(`Failed to rollback ${filePath}:`, error);
            throw error;
        }
    }
    async findBackupFiles(filePath) {
        try {
            const dir = (0, path_1.dirname)(filePath);
            const baseName = filePath.split('/').pop();
            const files = await fs_1.promises.readdir(dir);
            const backupFiles = files
                .filter(file => file.startsWith(`${baseName}.autofix.backup.`))
                .map(file => (0, path_1.resolve)(dir, file))
                .sort();
            return backupFiles;
        }
        catch {
            return [];
        }
    }
    async cleanupBackups(filePath) {
        try {
            const backupFiles = await this.findBackupFiles(filePath);
            // Keep only the last 3 backups
            if (backupFiles.length > 3) {
                const filesToDelete = backupFiles.slice(0, -3);
                for (const file of filesToDelete) {
                    await fs_1.promises.unlink(file);
                }
            }
        }
        catch (error) {
            // Cleanup failures should not be critical
            console.warn(`Warning: Could not cleanup backup files:`, error);
        }
    }
}
exports.CodeFixer = CodeFixer;
//# sourceMappingURL=code-fixer.js.map