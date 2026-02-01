import { TestRunnerAgent } from '../agents/agents/testrunner-agent';
import { AgentMessage } from '../agents/types';

describe('TestRunnerAgent', () => {
  let testRunnerAgent: TestRunnerAgent;

  beforeEach(() => {
    testRunnerAgent = new TestRunnerAgent();
  });

  test('should initialize with correct properties', () => {
    expect(testRunnerAgent.id).toBe('testrunner');
    expect(testRunnerAgent.name).toBe('TestRunner Agent');
    expect(testRunnerAgent.type).toBe('tool');
    expect(testRunnerAgent.capabilities).toHaveLength(4);
  });

  test('should handle run-unit-tests command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'testrunner',
      type: 'command',
      payload: { 
        action: 'run-unit-tests',
        target: './src',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await testRunnerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.type).toBe('unit');
    expect(response?.payload.result.projectPath).toBe('./src');
  });

  test('should handle run-e2e-tests command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'testrunner',
      type: 'command',
      payload: {
        action: 'run-e2e-tests',
        target: 'http://localhost:3000',
        options: { browser: 'chrome' }
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await testRunnerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.type).toBe('e2e');
    expect(response?.payload.result.url).toBe('http://localhost:3000');
  }, 10000); // Increase timeout for this test

  test('should handle run-visual-tests command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'testrunner',
      type: 'command',
      payload: { 
        action: 'run-visual-tests',
        target: 'http://localhost:3000',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await testRunnerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.type).toBe('visual');
    expect(response?.payload.result.url).toBe('http://localhost:3000');
  });

  test('should handle run-security-tests command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'testrunner',
      type: 'command',
      payload: { 
        action: 'run-security-tests',
        target: 'http://localhost:3000',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await testRunnerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.type).toBe('security');
    expect(response?.payload.result.url).toBe('http://localhost:3000');
  });

  test('should handle run-all-tests command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'testrunner',
      type: 'command',
      payload: {
        action: 'run-all-tests',
        target: './src',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await testRunnerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.type).toBe('comprehensive');
    expect(response?.payload.result.target).toBe('./src');
  }, 15000); // Increase timeout for this test

  test('should handle status request', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'testrunner',
      type: 'status',
      payload: {},
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await testRunnerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.agent).toBe('TestRunner Agent');
    expect(response?.payload.status).toBeDefined();
    expect(response?.payload.capabilities).toBeDefined();
    expect(response?.payload.metrics).toBeDefined();
  });
});