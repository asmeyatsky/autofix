import { EventEmitter } from 'events';
import { Agent, AgentMessage, AgentStatus, OrchestrationConfig } from './types';

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private running = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private config: OrchestrationConfig;

  constructor(config: OrchestrationConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    console.log('🤖 Starting Agent Orchestrator...');
    this.running = true;
    
    // Start heartbeat monitoring
    this.startHeartbeat();
    
    // Start message processing
    this.startMessageProcessor();
    
    console.log(`✅ Orchestrator started with ${this.agents.size} agents`);
    this.emit('started');
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Agent Orchestrator...');
    this.running = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Stop all agents
    const stopPromises = Array.from(this.agents.values()).map(agent => 
      agent.stop().catch(err => console.error(`Error stopping agent ${agent.id}:`, err))
    );
    
    await Promise.all(stopPromises);
    
    console.log('✅ Orchestrator stopped');
    this.emit('stopped');
  }

  registerAgent(agent: Agent): void {
    console.log(`📝 Registering agent: ${agent.name} (${agent.id})`);
    this.agents.set(agent.id, agent);
    
    // Forward agent events to orchestrator
    if (agent instanceof EventEmitter) {
      agent.on('message', (message: AgentMessage) => {
        this.routeMessage(message);
      });

      agent.on('statusChange', (status: AgentStatus) => {
        this.emit('agentStatusChange', { agentId: agent.id, status });
      });
    }
    
    this.emit('agentRegistered', agent);
  }

  async broadcastMessage(message: Omit<AgentMessage, 'id' | 'timestamp' | 'from'>): Promise<void> {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
      from: 'orchestrator'
    };

    this.agents.forEach(agent => {
      if (agent.id !== this.config.orchestratorId) {
        this.deliverMessage(agent.id, fullMessage);
      }
    });
  }

  async sendDirectMessage(to: string, message: Omit<AgentMessage, 'id' | 'timestamp' | 'to'>): Promise<void> {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
      to
    };

    this.deliverMessage(to, fullMessage);
  }

  async runConcurrent(operations: Array<{ agentId: string; task: any }>): Promise<any[]> {
    console.log(`🚀 Running ${operations.length} concurrent operations...`);
    
    const results = await Promise.allSettled(
      operations.map(({ agentId, task }) => {
        const agent = this.agents.get(agentId);
        if (!agent) {
          throw new Error(`Agent ${agentId} not found`);
        }
        
        return this.executeAgentTask(agent, task);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`📊 Concurrent execution complete: ${successful} successful, ${failed} failed`);
    
    return results.map((result, index) => ({
      agentId: operations[index].agentId,
      status: result.status,
      value: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  async runWorkflow(workflow: AgentWorkflow): Promise<any> {
    console.log(`🔄 Starting workflow: ${workflow.name}`);
    
    try {
      const results = [];
      
      for (const step of workflow.steps) {
        console.log(`  📋 Executing step: ${step.name}`);
        
        const stepResults = await this.runConcurrent(
          step.agents.map(agentId => ({
            agentId,
            task: step.task
          }))
        );
        
        results.push({
          step: step.name,
          results: stepResults
        });
        
        // Check if step has completion condition
        if (step.completionCondition) {
          const shouldContinue = await step.completionCondition(stepResults);
          if (!shouldContinue) {
            console.log(`⏹️ Workflow stopped at step: ${step.name}`);
            break;
          }
        }
      }
      
      console.log(`✅ Workflow completed: ${workflow.name}`);
      return { workflow: workflow.name, results };
      
    } catch (error) {
      console.error(`❌ Workflow failed: ${workflow.name}`, error);
      throw error;
    }
  }

  getAgentStatuses(): AgentStatus[] {
    return Array.from(this.agents.values()).map(agent => agent.status);
  }

  private deliverMessage(to: string, message: AgentMessage): void {
    const agent = this.agents.get(to);
    if (agent) {
      // Add to queue for reliable delivery
      this.messageQueue.push(message);
      
      // Process immediately if agent is available
      this.processMessageForAgent(agent, message);
    } else {
      console.warn(`⚠️ Agent ${to} not found for message delivery`);
    }
  }

  private async processMessageForAgent(agent: Agent, message: AgentMessage): Promise<void> {
    try {
      const response = await agent.handleMessage(message);
      if (response) {
        this.routeMessage(response);
      }
    } catch (error) {
      console.error(`❌ Error processing message for agent ${agent.id}:`, error);
    }
  }

  private routeMessage(message: AgentMessage): void {
    if (message.to === 'broadcast') {
      this.agents.forEach(agent => {
        if (agent.id !== message.from && agent.id !== this.config.orchestratorId) {
          this.processMessageForAgent(agent, message);
        }
      });
    } else {
      this.deliverMessage(message.to, message);
    }
  }

  private async executeAgentTask(agent: Agent, task: any): Promise<any> {
    const taskMessage = {
      to: agent.id,
      type: 'command' as const,
      payload: task,
      priority: 'medium' as const
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Task timeout for agent ${agent.id}`));
      }, this.config.messageTimeout);

      const taskId = this.generateMessageId();
      const responseHandler = (message: AgentMessage) => {
        if (message.correlationId === taskId) {
          clearTimeout(timeout);
          this.off('message', responseHandler);

          if (message.type === 'error') {
            reject(new Error(message.payload));
          } else {
            resolve(message.payload);
          }
        }
      };

      this.on('message', responseHandler);
      this.processMessageForAgent(agent, { ...taskMessage, id: taskId } as AgentMessage);
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      const healthChecks = Array.from(this.agents.values()).map(async (agent) => {
        try {
          const healthy = await agent.healthCheck();
          if (!healthy && agent.status.health !== 'critical') {
            console.warn(`⚠️ Agent ${agent.name} (${agent.id}) is unhealthy`);
            agent.status.health = 'critical';
            this.emit('agentUnhealthy', agent);
          } else if (healthy && agent.status.health === 'critical') {
            console.log(`✅ Agent ${agent.name} (${agent.id}) recovered`);
            agent.status.health = 'healthy';
            this.emit('agentRecovered', agent);
          }
        } catch (error) {
          console.error(`❌ Health check failed for agent ${agent.id}:`, error);
        }
      });

      await Promise.all(healthChecks);
    }, this.config.heartbeatInterval);
  }

  private startMessageProcessor(): void {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const messages = this.messageQueue.splice(0, this.config.maxConcurrentAgents);
        messages.forEach(message => {
          this.routeMessage(message);
        });
      }
    }, 100);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface AgentWorkflow {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    agents: string[];
    task: any;
    completionCondition?: (results: any[]) => Promise<boolean>;
  }>;
}