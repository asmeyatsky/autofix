export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateProjectPath(path: string): boolean {
  const fs = require('fs');
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export function isJavaScriptFile(filePath: string): boolean {
  return /\.(js|jsx|ts|tsx|vue)$/.test(filePath);
}

export function generateSessionId(): string {
  return `autofix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDuration(ms: number): string {
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