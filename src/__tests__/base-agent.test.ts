import { BaseAgent } from '../agents/base-agent';
import { AgentMessage, AgentCapability } from '../agents/types';

describe('BaseAgent', () => {
  let baseAgent: BaseAgent;

  beforeEach(() => {
    baseAgent = new (class extends BaseAgent {
      constructor() {
        super(
          'test',
          'Test Agent',
          'tool',
          [
            {
              name: 'test-capability',
              description: 'Test capability',
              dependencies: [],
              provides: ['test-data']
            }
          ] as AgentCapability[]
        );
      }

      async handleMessage(message: AgentMessage): Promise<AgentMessage | null> {
        return null;
      }
    })();
  });

  test('should initialize with correct properties', () => {
    expect(baseAgent.id).toBe('test');
    expect(baseAgent.name).toBe('Test Agent');
    expect(baseAgent.type).toBe('tool');
    expect(baseAgent.capabilities).toHaveLength(1);
    expect(baseAgent.status.id).toBe('test');
    expect(baseAgent.status.status).toBe('idle');
  });

  test('should start and update status', async () => {
    await baseAgent.start();
    expect(baseAgent.status.status).toBe('running');
    // Note: 'running' is protected, so we can't directly access it in tests
    // We can infer the state from the status
    expect(baseAgent.status.status).not.toBe('idle');
  });

  test('should stop and update status', async () => {
    await baseAgent.start();
    await baseAgent.stop();
    expect(baseAgent.status.status).toBe('idle');
  });

  test('should perform health check', async () => {
    await baseAgent.start();
    const healthy = await baseAgent.healthCheck();
    expect(healthy).toBe(true);
    expect(baseAgent.status.health).toBe('healthy');
  });

  test('should get metrics', () => {
    const metrics = baseAgent.getMetrics();
    expect(metrics).toHaveProperty('uptime');
    expect(metrics).toHaveProperty('messageCount');
    expect(metrics).toHaveProperty('taskCount');
    expect(metrics).toHaveProperty('errorCount');
  });

  test('should register and handle messages', async () => {
    const mockHandler = jest.fn().mockResolvedValue({ handled: true });

    // Register the handler for the 'command' message type
    baseAgent['registerMessageHandler']('command', mockHandler);

    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'test',
      type: 'command',
      payload: { action: 'test-action' },
      timestamp: new Date(),
      priority: 'medium'
    };

    const result = await baseAgent['processMessage'](message);
    expect(mockHandler).toHaveBeenCalledWith(message);
    expect(result).toEqual({ handled: true });
  });
});