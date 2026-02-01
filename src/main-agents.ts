import { AgentOrchestrator } from './agents/orchestrator';
import { AutoFixAgent } from './agents/agents/autofix-agent';
import { LinkCheckerAgent } from './agents/agents/linkchecker-agent';
import { TestRunnerAgent } from './agents/agents/testrunner-agent';
import { AutoFixConfig } from './types';
import { AutoFixSession, FixResult } from './types';

export class AgentBasedAutoFix {
  private config: AutoFixConfig;
  private orchestrator: AgentOrchestrator;
  private autoFixAgent: AutoFixAgent;
  private linkCheckerAgent: LinkCheckerAgent;
  private testRunnerAgent: TestRunnerAgent;
  private session: AutoFixSession;

  constructor(config: AutoFixConfig) {
    this.config = config;
    this.session = {
      id: this.generateSessionId(),
      startTime: new Date(),
      attempts: 0,
      errorsFixed: 0,
    };

    // Initialize orchestrator with configuration
    this.orchestrator = new AgentOrchestrator({
      maxConcurrentAgents: 5,
      heartbeatInterval: 5000,
      messageTimeout: 30000,
      retryAttempts: 3,
      enableMonitoring: true,
      enableLogging: true,
      agents: ['autofix', 'linkchecker', 'testrunner'],
      orchestratorId: 'orchestrator'
    });

    // Initialize agents
    this.autoFixAgent = new AutoFixAgent();
    this.linkCheckerAgent = new LinkCheckerAgent();
    this.testRunnerAgent = new TestRunnerAgent();
  }

  async run(): Promise<FixResult> {
    console.log('🤖 Starting Agent-Based AutoFix...');
    
    try {
      // Register agents with orchestrator
      this.orchestrator.registerAgent(this.autoFixAgent);
      this.orchestrator.registerAgent(this.linkCheckerAgent);
      this.orchestrator.registerAgent(this.testRunnerAgent);

      // Start orchestrator
      await this.orchestrator.start();

      // Execute coordinated workflow
      const result = await this.executeCoordinatedWorkflow();

      // Stop orchestrator
      await this.orchestrator.stop();

      return result;
    } catch (error: any) {
      console.error('❌ Agent-based AutoFix failed:', error);
      return {
        success: false,
        fixes: [],
        explanation: `Agent-based AutoFix failed: ${error.message}`,
        attempt: this.session.attempts,
      };
    }
  }

  private async executeCoordinatedWorkflow(): Promise<FixResult> {
    console.log('🔄 Executing coordinated agent workflow...');

    try {
      // First, run link checker to identify any broken links
      console.log('🔗 Running LinkChecker agent...');
      const linkCheckResult = await this.linkCheckerAgent.handleMessage({
        id: this.generateMessageId(),
        from: 'main',
        to: 'linkchecker',
        type: 'command',
        payload: {
          action: 'check-links',
          target: this.config.url,
          options: { depth: 2, timeout: this.config.timeout }
        },
        timestamp: new Date(),
        priority: 'medium'
      });

      if (linkCheckResult && linkCheckResult.payload && linkCheckResult.payload.result) {
        const linkResults = linkCheckResult.payload.result;
        console.log(`🔗 Found ${linkResults.totalLinks} total links, ${linkResults.brokenLinks} broken links`);

        if (linkResults.brokenLinks > 0) {
          console.log(`⚠️  Found ${linkResults.brokenLinks} broken links that may affect the application`);
        }
      }

      // Monitor the startup process with AutoFix agent
      console.log('🔍 Running AutoFix monitoring...');
      const monitorResult = await this.autoFixAgent.handleMessage({
        id: this.generateMessageId(),
        from: 'main',
        to: 'autofix',
        type: 'command',
        payload: {
          action: 'monitor-startup',
          target: this.config.url,
          options: { timeout: this.config.timeout }
        },
        timestamp: new Date(),
        priority: 'medium'
      });

      // Analyze errors if any were detected
      if (monitorResult && monitorResult.payload && monitorResult.payload.result) {
        const monitorData = monitorResult.payload.result;
        console.log(`📊 Startup monitoring completed in ${monitorData.startupTime}ms`);

        if (monitorData.errors && monitorData.errors.length > 0) {
          console.log(`⚠️  Found ${monitorData.errors.length} errors during startup`);
        }
      }

      // Perform detailed error analysis
      console.log('🔍 Running detailed error analysis...');
      const analysisResult = await this.autoFixAgent.handleMessage({
        id: this.generateMessageId(),
        from: 'main',
        to: 'autofix',
        type: 'command',
        payload: {
          action: 'analyze-errors',
          target: this.config.project,
          options: { url: this.config.url }
        },
        timestamp: new Date(),
        priority: 'medium'
      });

      let fixes: any[] = [];

      if (analysisResult && analysisResult.payload && analysisResult.payload.result) {
        const analysisData = analysisResult.payload.result;
        console.log(`🔍 Found ${analysisData.totalErrors} errors and ${analysisData.totalWarnings} warnings`);

        // Apply fixes if any errors were found
        if (analysisData.totalErrors > 0) {
          console.log('🔧 Applying fixes...');
          const fixResult = await this.autoFixAgent.handleMessage({
            id: this.generateMessageId(),
            from: 'main',
            to: 'autofix',
            type: 'command',
            payload: {
              action: 'fix-errors',
              target: this.config.project,
              options: { url: this.config.url, maxAttempts: this.config.maxAttempts }
            },
            timestamp: new Date(),
            priority: 'medium'
          });

          if (fixResult && fixResult.payload && fixResult.payload.result) {
            const fixData = fixResult.payload.result;
            console.log(`🔧 Applied ${fixData.fixesApplied} fixes`);

            // Extract fixes from the result
            if (fixData.fixes && Array.isArray(fixData.fixes)) {
              fixes = fixData.fixes.map((fix: any) => ({
                filePath: fix.file,
                originalCode: '', // Would come from actual file content
                fixedCode: '', // Would come from actual fix
                explanation: fix.issue + ': ' + fix.fix,
                confidence: 0.9
              }));
            }
          }
        }
      }

      // Run tests to validate the fixes
      console.log('🧪 Running post-fix validation tests...');
      const testResult = await this.testRunnerAgent.handleMessage({
        id: this.generateMessageId(),
        from: 'main',
        to: 'testrunner',
        type: 'command',
        payload: {
          action: 'run-unit-tests',
          target: this.config.project,
          options: { headless: this.config.headless }
        },
        timestamp: new Date(),
        priority: 'medium'
      });

      let testSuccess = true;
      if (testResult && testResult.payload && testResult.payload.result) {
        const testData = testResult.payload.result;
        testSuccess = testData.success;
        console.log(`🧪 Tests: ${testData.passed} passed, ${testData.failed} failed`);
      }

      // Determine overall success based on whether fixes were applied successfully and tests pass
      const success = testSuccess;

      return {
        success,
        fixes,
        explanation: success
          ? 'Agent-based workflow completed successfully with fixes applied'
          : 'Agent-based workflow completed but tests are failing',
        attempt: ++this.session.attempts,
      };
    } catch (error: any) {
      console.error('❌ Workflow execution failed:', error);
      return {
        success: false,
        fixes: [],
        explanation: `Workflow execution failed: ${error.message}`,
        attempt: this.session.attempts,
      };
    }
  }

  private extractFixesFromWorkflow(workflowResult: any): any[] {
    // Extract fixes from the workflow results
    const fixes: any[] = [];

    for (const stepResult of workflowResult.results) {
      for (const agentResult of stepResult.results) {
        if (agentResult.status === 'fulfilled' && agentResult.value?.payload?.result) {
          const result = agentResult.value.payload.result;

          // Extract fixes if they exist in the result
          if (result.fixes && Array.isArray(result.fixes)) {
            fixes.push(...result.fixes);
          } else if (result.fixesApplied) {
            // Handle the case where fixes are reported differently
            fixes.push({
              filePath: result.target,
              explanation: `Applied ${result.fixesApplied} fixes`,
              confidence: 1.0
            });
          }
        }
      }
    }

    return fixes;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSession(): AutoFixSession {
    return this.session;
  }
}