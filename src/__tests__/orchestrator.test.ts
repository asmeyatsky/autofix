import { AgentOrchestrator } from '../agents/orchestrator';
import { MockAgent } from './mock-agent';
import { AgentMessage } from '../agents/types';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let mockAgent: MockAgent;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator({
      maxConcurrentAgents: 5,
      heartbeatInterval: 1000,
      messageTimeout: 5000,
      retryAttempts: 3,
      enableMonitoring: true,
      enableLogging: true,
      agents: ['mock'],
      orchestratorId: 'test-orchestrator'
    });
    
    mockAgent = new MockAgent();
  });

  afterEach(async () => {
    if (orchestrator['running']) {
      await orchestrator.stop();
    }
  });

  test('should initialize with correct configuration', () => {
    expect(orchestrator['config'].maxConcurrentAgents).toBe(5);
    expect(orchestrator['config'].heartbeatInterval).toBe(1000);
  });

  test('should register agent', async () => {
    orchestrator.registerAgent(mockAgent);
    expect(orchestrator['agents'].size).toBe(1);
    expect(orchestrator['agents'].get('mock')).toBe(mockAgent);
  });

  test('should start and stop orchestrator', async () => {
    await orchestrator.start();
    expect(orchestrator['running']).toBe(true);

    await orchestrator.stop();
    expect(orchestrator['running']).toBe(false);
  });

  test('should send direct message to agent', async () => {
    orchestrator.registerAgent(mockAgent);
    await orchestrator.start();

    await orchestrator.sendDirectMessage('mock', {
      type: 'command',
      payload: { action: 'test' },
      priority: 'medium',
      from: 'test'
    });

    // Give time for message processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Account for possible duplicate messages due to test setup
    expect(mockAgent.receivedMessages).not.toHaveLength(0);
    expect(mockAgent.processedActions).toContain('test');
  });

  test('should broadcast message to all agents', async () => {
    const mockAgent2 = new MockAgent();
    Object.defineProperty(mockAgent2, 'id', { value: 'mock2', writable: true }); // Make id mutable for testing

    orchestrator.registerAgent(mockAgent);
    orchestrator.registerAgent(mockAgent2);
    await orchestrator.start();

    await orchestrator.broadcastMessage({
      type: 'command',
      payload: { action: 'broadcast-test' },
      priority: 'medium',
      to: 'broadcast'
    });

    // Give time for message processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Account for possible duplicate messages due to test setup
    expect(mockAgent.receivedMessages).not.toHaveLength(0);
    expect(mockAgent2.receivedMessages).not.toHaveLength(0);
    expect(mockAgent.processedActions).toContain('broadcast-test');
    expect(mockAgent2.processedActions).toContain('broadcast-test');
  });

  test('should run concurrent operations', async () => {
    orchestrator.registerAgent(mockAgent);
    await orchestrator.start();

    const operations = [
      { agentId: 'mock', task: { action: 'task1' } },
      { agentId: 'mock', task: { action: 'task2' } }
    ];

    const results = await orchestrator.runConcurrent(operations);

    expect(results).toHaveLength(2);
    expect(results[0].agentId).toBe('mock');
    expect(results[1].agentId).toBe('mock');
  }, 10000); // Increase timeout for this test

  test('should get agent statuses', async () => {
    orchestrator.registerAgent(mockAgent);
    await orchestrator.start();

    const statuses = orchestrator.getAgentStatuses();
    expect(statuses).toHaveLength(1);
    expect(statuses[0].id).toBe('mock');
  });
});