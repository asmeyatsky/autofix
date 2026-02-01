export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function generateReportName(baseUrl: string, format: string): string {
  const domain = new URL(baseUrl).hostname.replace(/[.]/g, '-');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  return `linkcheck-${domain}-${timestamp}.${format}`;
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

export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query parameters and fragments for display
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

export function isValidStatusCode(status: number): boolean {
  return status >= 200 && status < 600;
}

export function isErrorStatusCode(status: number): boolean {
  return status >= 400;
}

export function isRedirectStatusCode(status: number): boolean {
  return status >= 300 && status < 400;
}

export function isOkStatusCode(status: number): boolean {
  return status >= 200 && status < 300;
}