"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUrl = validateUrl;
exports.validateProjectPath = validateProjectPath;
exports.isJavaScriptFile = isJavaScriptFile;
exports.generateSessionId = generateSessionId;
exports.formatDuration = formatDuration;
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function validateProjectPath(path) {
    const fs = require('fs');
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    }
    catch {
        return false;
    }
}
function isJavaScriptFile(filePath) {
    return /\.(js|jsx|ts|tsx|vue)$/.test(filePath);
}
function generateSessionId() {
    return `autofix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}
//# sourceMappingURL=validation.js.map