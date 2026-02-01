import { EventEmitter } from 'events';

export interface AgentMessage {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: 'command' | 'response' | 'data' | 'status' | 'error' | 'heartbeat';
  payload: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  correlationId?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  dependencies: string[];
  provides: string[];
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'busy' | 'error' | 'paused';
  lastActivity: Date;
  health: 'healthy' | 'degraded' | 'critical';
  metrics: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  type: 'tool' | 'orchestrator' | 'monitor' | 'processor';
  capabilities: AgentCapability[];
  status: AgentStatus;
  handleMessage(message: AgentMessage): Promise<AgentMessage | null>;
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<boolean>;
  getMetrics(): Record<string, any>;
}

export interface OrchestrationConfig {
  maxConcurrentAgents: number;
  heartbeatInterval: number;
  messageTimeout: number;
  retryAttempts: number;
  enableMonitoring: boolean;
  enableLogging: boolean;
  agents: string[];
  orchestratorId?: string;
}