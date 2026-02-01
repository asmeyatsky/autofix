import { AutoFixAgent } from '../agents/agents/autofix-agent';
import { AgentMessage } from '../agents/types';

describe('AutoFixAgent', () => {
  let autoFixAgent: AutoFixAgent;

  beforeEach(() => {
    autoFixAgent = new AutoFixAgent();
  });

  test('should initialize with correct properties', () => {
    expect(autoFixAgent.id).toBe('autofix');
    expect(autoFixAgent.name).toBe('AutoFix Agent');
    expect(autoFixAgent.type).toBe('tool');
    expect(autoFixAgent.capabilities).toHaveLength(3);
  });

  test('should handle monitor-startup command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'autofix',
      type: 'command',
      payload: { 
        action: 'monitor-startup',
        target: 'http://localhost:3000',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await autoFixAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.url).toBe('http://localhost:3000');
  });

  test('should handle fix-errors command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'autofix',
      type: 'command',
      payload: { 
        action: 'fix-errors',
        target: './src',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await autoFixAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.target).toBe('./src');
    expect(response?.payload.result.fixesApplied).toBeGreaterThanOrEqual(0);
  });

  test('should handle analyze-errors command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'autofix',
      type: 'command',
      payload: { 
        action: 'analyze-errors',
        target: './src',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await autoFixAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.target).toBe('./src');
    expect(response?.payload.result.totalErrors).toBeGreaterThanOrEqual(0);
  });

  test('should handle status request', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'autofix',
      type: 'status',
      payload: {},
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await autoFixAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.agent).toBe('AutoFix Agent');
    expect(response?.payload.status).toBeDefined();
    expect(response?.payload.capabilities).toBeDefined();
    expect(response?.payload.metrics).toBeDefined();
  });
});