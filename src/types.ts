export interface AutoFixConfig {
  url: string;
  project?: string;
  llmEndpoint?: string;
  timeout?: number;
  maxAttempts?: number;
  headless?: boolean;
  llmApiKey?: string;
}

export interface ConsoleMessage {
  type: 'error' | 'warn' | 'info' | 'log';
  text: string;
  url?: string;
  line?: number;
  column?: number;
  timestamp: number;
  location?: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
}

export interface NetworkError {
  url: string;
  status: number;
  statusText: string;
  timestamp: number;
}

export interface DetectedError {
  consoleErrors: ConsoleMessage[];
  networkErrors: NetworkError[];
  pageLoadError?: string;
  screenshot?: Buffer;
  timestamp: number;
}

export interface LLMFix {
  filePath: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  confidence: number;
}

export interface FixResult {
  success: boolean;
  fixes: LLMFix[];
  explanation: string;
  attempt: number;
  errorsFixed?: number;
  finalError?: string;
}

export interface MonitoringResult {
  success: boolean;
  error?: DetectedError;
  renderTime?: number;
}

export interface AutoFixSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  attempts: number;
  finalResult?: FixResult;
  errorsFixed: number;
}