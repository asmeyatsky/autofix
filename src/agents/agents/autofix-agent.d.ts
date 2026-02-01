import { BaseAgent } from './base-agent';
import { AgentMessage } from './types';
export declare class AutoFixAgent extends BaseAgent {
    constructor();
    handleMessage(message: AgentMessage): Promise<AgentMessage | null>;
    private handleCommand;
    private handleStatusRequest;
    private monitorStartup;
    private fixErrors;
    private analyzeErrors;
}
//# sourceMappingURL=autofix-agent.d.ts.map