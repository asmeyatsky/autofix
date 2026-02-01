import { AgentBasedAutoFix } from '../main-agents';
import { AutoFixConfig } from '../types';

describe('AgentBasedAutoFix', () => {
  let config: AutoFixConfig;

  beforeEach(() => {
    config = {
      url: 'http://localhost:3000',
      project: './src',
      agentic: true,
      timeout: 10000,
      maxAttempts: 5
    };
  });

  test('should initialize with correct properties', () => {
    const agentBasedAutoFix = new AgentBasedAutoFix(config);
    
    expect(agentBasedAutoFix['config']).toBe(config);
    expect(agentBasedAutoFix['session'].id).toBeDefined();
    expect(agentBasedAutoFix['session'].startTime).toBeInstanceOf(Date);
    expect(agentBasedAutoFix['session'].attempts).toBe(0);
    expect(agentBasedAutoFix['session'].errorsFixed).toBe(0);
  });

  test('should have orchestrator and agents initialized', () => {
    const agentBasedAutoFix = new AgentBasedAutoFix(config);
    
    expect(agentBasedAutoFix['orchestrator']).toBeDefined();
    expect(agentBasedAutoFix['autoFixAgent']).toBeDefined();
    expect(agentBasedAutoFix['linkCheckerAgent']).toBeDefined();
    expect(agentBasedAutoFix['testRunnerAgent']).toBeDefined();
  });

  test('should generate session ID', () => {
    const agentBasedAutoFix = new AgentBasedAutoFix(config);
    const sessionId = agentBasedAutoFix['generateSessionId']();
    
    expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
  });

  test('should generate message ID', () => {
    const agentBasedAutoFix = new AgentBasedAutoFix(config);
    const messageId = agentBasedAutoFix['generateMessageId']();
    
    expect(messageId).toMatch(/^msg_\d+_[a-z0-9]+$/);
  });

  test('should return session', () => {
    const agentBasedAutoFix = new AgentBasedAutoFix(config);
    const session = agentBasedAutoFix.getSession();
    
    expect(session).toBe(agentBasedAutoFix['session']);
    expect(session.id).toBeDefined();
  });

  // Note: We can't fully test the run() method without a running server
  // But we can test the initialization aspects
  test('should initialize properly for run', () => {
    const agentBasedAutoFix = new AgentBasedAutoFix(config);
    
    // Just verify the orchestrator and agents are created
    expect(agentBasedAutoFix['orchestrator']).toBeDefined();
    expect(agentBasedAutoFix['autoFixAgent']).toBeDefined();
    expect(agentBasedAutoFix['linkCheckerAgent']).toBeDefined();
    expect(agentBasedAutoFix['testRunnerAgent']).toBeDefined();
  });
});