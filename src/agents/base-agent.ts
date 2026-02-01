import { EventEmitter } from 'events';
import { Agent, AgentMessage, AgentStatus, AgentCapability } from './types';

export abstract class BaseAgent extends EventEmitter implements Agent {
  public id: string;
  public name: string;
  public type: 'tool' | 'orchestrator' | 'monitor' | 'processor';
  public capabilities: AgentCapability[];
  public status: AgentStatus;
  protected running = false;
  protected messageHandlers: Map<string, Function[]> = new Map();

  constructor(
    id: string,
    name: string,
    type: Agent['type'],
    capabilities: AgentCapability[]
  ) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
    
    this.status = {
      id,
      name,
      status: 'idle',
      lastActivity: new Date(),
      health: 'healthy',
      metrics: {}
    };
  }

  abstract handleMessage(message: AgentMessage): Promise<AgentMessage | null>;

  async start(): Promise<void> {
    console.log(`🚀 Starting agent: ${this.name} (${this.id})`);
    this.running = true;
    this.status.status = 'running';
    this.status.lastActivity = new Date();
    this.emit('started');
  }

  async stop(): Promise<void> {
    console.log(`🛑 Stopping agent: ${this.name} (${this.id})`);
    this.running = false;
    this.status.status = 'idle';
    this.status.lastActivity = new Date();
    this.emit('stopped');
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Basic health check - override in subclasses for specific checks
      const metrics = this.getMetrics();
      const isHealthy = this.running && this.status.status !== 'error';
      
      this.status.health = isHealthy ? 'healthy' : 'critical';
      this.status.lastActivity = new Date();
      
      return isHealthy;
    } catch (error) {
      console.error(`❌ Health check failed for agent ${this.id}:`, error);
      this.status.health = 'critical';
      return false;
    }
  }

  getMetrics(): Record<string, any> {
    return {
      ...this.status.metrics,
      uptime: this.running ? Date.now() - this.status.lastActivity.getTime() : 0,
      messageCount: this.status.metrics.messageCount || 0,
      taskCount: this.status.metrics.taskCount || 0,
      errorCount: this.status.metrics.errorCount || 0
    };
  }

  protected registerMessageHandler(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  protected async processMessage(message: AgentMessage): Promise<any> {
    const handlers = this.messageHandlers.get(message.type) || [];
    this.status.metrics.messageCount = (this.status.metrics.messageCount || 0) + 1;
    
    for (const handler of handlers) {
      try {
        const result = await handler(message);
        if (result) return result;
      } catch (error) {
        console.error(`❌ Message handler error in ${this.id}:`, error);
        this.status.metrics.errorCount = (this.status.metrics.errorCount || 0) + 1;
      }
    }
    
    return null;
  }

  protected updateStatus(status: Partial<AgentStatus>): void {
    this.status = { ...this.status, ...status, lastActivity: new Date() };
    this.emit('statusChange', this.status);
  }

  protected createResponse(originalMessage: AgentMessage, payload: any, type: 'response' | 'data' | 'error' = 'response'): AgentMessage {
    return {
      id: this.generateMessageId(),
      from: this.id,
      to: originalMessage.from,
      type,
      payload,
      timestamp: new Date(),
      priority: originalMessage.priority,
      correlationId: originalMessage.id
    };
  }

  private generateMessageId(): string {
    return `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}