import { BaseAgent } from './base-agent';
import { AgentMessage } from './types';
export declare class LinkCheckerAgent extends BaseAgent {
    constructor();
    handleMessage(message: AgentMessage): Promise<AgentMessage | null>;
    private handleCommand;
    private handleStatusRequest;
    private checkLinks;
    private crawlSite;
    private validateLinks;
}
//# sourceMappingURL=linkchecker-agent.d.ts.map