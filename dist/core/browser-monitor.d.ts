import { Browser } from 'puppeteer';
import { AutoFixConfig, MonitoringResult } from '../types';
export declare class BrowserMonitor {
    private browser;
    private config;
    constructor(browser: Browser, config: AutoFixConfig);
    monitorFrontend(): Promise<MonitoringResult>;
    private checkPageSuccess;
}
//# sourceMappingURL=browser-monitor.d.ts.map