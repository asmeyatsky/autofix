import { BaseAgent } from './base-agent';
import { AgentMessage } from './types';
export declare class TestRunnerAgent extends BaseAgent {
    constructor();
    handleMessage(message: AgentMessage): Promise<AgentMessage | null>;
    private handleCommand;
    private handleStatusRequest;
    private runUnitTests;
    private runE2ETests;
    private runVisualTests;
    private runSecurityTests;
    private runAllTests;
}
//# sourceMappingURL=testrunner-agent.d.ts.map