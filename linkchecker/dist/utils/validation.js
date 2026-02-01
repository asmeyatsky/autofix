"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUrl = validateUrl;
exports.generateReportName = generateReportName;
exports.formatDuration = formatDuration;
exports.sanitizeUrl = sanitizeUrl;
exports.isValidStatusCode = isValidStatusCode;
exports.isErrorStatusCode = isErrorStatusCode;
exports.isRedirectStatusCode = isRedirectStatusCode;
exports.isOkStatusCode = isOkStatusCode;
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function generateReportName(baseUrl, format) {
    const domain = new URL(baseUrl).hostname.replace(/[.]/g, '-');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `linkcheck-${domain}-${timestamp}.${format}`;
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
function sanitizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // Remove query parameters and fragments for display
        return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    }
    catch {
        return url;
    }
}
function isValidStatusCode(status) {
    return status >= 200 && status < 600;
}
function isErrorStatusCode(status) {
    return status >= 400;
}
function isRedirectStatusCode(status) {
    return status >= 300 && status < 400;
}
function isOkStatusCode(status) {
    return status >= 200 && status < 300;
}
//# sourceMappingURL=validation.js.map