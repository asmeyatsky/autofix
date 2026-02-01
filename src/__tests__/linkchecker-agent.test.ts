import { LinkCheckerAgent } from '../agents/agents/linkchecker-agent';
import { AgentMessage } from '../agents/types';

describe('LinkCheckerAgent', () => {
  let linkCheckerAgent: LinkCheckerAgent;

  beforeEach(() => {
    linkCheckerAgent = new LinkCheckerAgent();
  });

  test('should initialize with correct properties', () => {
    expect(linkCheckerAgent.id).toBe('linkchecker');
    expect(linkCheckerAgent.name).toBe('LinkChecker Agent');
    expect(linkCheckerAgent.type).toBe('tool');
    expect(linkCheckerAgent.capabilities).toHaveLength(3);
  });

  test('should handle check-links command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'linkchecker',
      type: 'command',
      payload: { 
        action: 'check-links',
        target: 'http://localhost:3000',
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await linkCheckerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.url).toBe('http://localhost:3000');
    expect(response?.payload.result.totalLinks).toBeGreaterThanOrEqual(0);
  });

  test('should handle crawl-site command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'linkchecker',
      type: 'command',
      payload: { 
        action: 'crawl-site',
        target: 'http://localhost:3000',
        options: { depth: 3 }
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await linkCheckerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.url).toBe('http://localhost:3000');
    expect(response?.payload.result.pagesVisited).toBeGreaterThanOrEqual(0);
  });

  test('should handle validate-links command', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'linkchecker',
      type: 'command',
      payload: { 
        action: 'validate-links',
        target: ['http://localhost:3000/page1', 'http://localhost:3000/page2'],
        options: {}
      },
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await linkCheckerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.success).toBe(true);
    expect(response?.payload.result.totalLinks).toBeGreaterThanOrEqual(0);
  });

  test('should handle status request', async () => {
    const message: AgentMessage = {
      id: 'test-msg',
      from: 'sender',
      to: 'linkchecker',
      type: 'status',
      payload: {},
      timestamp: new Date(),
      priority: 'medium'
    };

    const response = await linkCheckerAgent.handleMessage(message);

    expect(response).not.toBeNull();
    expect(response?.payload.agent).toBe('LinkChecker Agent');
    expect(response?.payload.status).toBeDefined();
    expect(response?.payload.capabilities).toBeDefined();
    expect(response?.payload.metrics).toBeDefined();
  });
});