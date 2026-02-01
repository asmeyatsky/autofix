import { BaseAgent } from '../agents/base-agent';
import { AgentMessage, AgentCapability, Agent, AgentStatus } from '../agents/types';

// Mock implementation for testing
export class MockAgent extends BaseAgent {
  receivedMessages: AgentMessage[] = [];
  processedActions: string[] = [];

  constructor() {
    super(
      'mock',
      'Mock Agent',
      'tool',
      [
        {
          name: 'mock-capability',
          description: 'Mock capability for testing',
          dependencies: [],
          provides: ['mock-data']
        }
      ] as AgentCapability[]
    );

    this.registerMessageHandler('command', this.handleCommand.bind(this));
    this.registerMessageHandler('status', this.handleStatusRequest.bind(this));
  }

  async handleMessage(message: AgentMessage): Promise<AgentMessage | null> {
    return this.processMessage(message);
  }

  private async handleCommand(message: AgentMessage): Promise<AgentMessage | null> {
    this.receivedMessages.push(message);
    this.updateStatus({ status: 'busy' });

    const { action } = message.payload;
    this.processedActions.push(action);

    this.updateStatus({ status: 'idle' });
    return this.createResponse(message, { success: true, action, result: 'processed' });
  }

  private async handleStatusRequest(message: AgentMessage): Promise<AgentMessage | null> {
    return this.createResponse(message, {
      agent: this.name,
      status: this.status,
      capabilities: this.capabilities,
      metrics: this.getMetrics()
    });
  }
}