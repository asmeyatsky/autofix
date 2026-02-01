import { BaseAgent } from '../base-agent';
import { AgentMessage, AgentCapability } from '../types';

export class LinkCheckerAgent extends BaseAgent {
  constructor() {
    super(
      'linkchecker',
      'LinkChecker Agent',
      'tool',
      [
        {
          name: 'link-discovery',
          description: 'Discover and catalog all links in a website',
          dependencies: [],
          provides: ['link-list', 'site-map']
        },
        {
          name: 'link-validation',
          description: 'Check links for accessibility and validity',
          dependencies: ['link-discovery'],
          provides: ['link-status', 'broken-links']
        },
        {
          name: 'crawl-analysis',
          description: 'Perform deep crawl analysis',
          dependencies: ['link-discovery', 'link-validation'],
          provides: ['crawl-report', 'site-structure']
        }
      ]
    );

    this.registerMessageHandler('command', this.handleCommand.bind(this));
    this.registerMessageHandler('status', this.handleStatusRequest.bind(this));
  }

  async handleMessage(message: AgentMessage): Promise<AgentMessage | null> {
    return this.processMessage(message);
  }

  private async handleCommand(message: AgentMessage): Promise<AgentMessage | null> {
    const { action, target, options } = message.payload;
    
    this.updateStatus({ status: 'busy' });
    this.status.metrics.taskCount = (this.status.metrics.taskCount || 0) + 1;

    try {
      let result;
      
      switch (action) {
        case 'check-links':
          result = await this.checkLinks(target, options);
          break;
          
        case 'crawl-site':
          result = await this.crawlSite(target, options);
          break;
          
        case 'validate-links':
          result = await this.validateLinks(target, options);
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.updateStatus({ status: 'idle' });
      return this.createResponse(message, { success: true, result });

    } catch (error: any) {
      this.updateStatus({ status: 'error' });
      return this.createResponse(message, { success: false, error: error.message }, 'error');
    }
  }

  private async handleStatusRequest(message: AgentMessage): Promise<AgentMessage | null> {
    return this.createResponse(message, {
      agent: this.name,
      status: this.status,
      capabilities: this.capabilities,
      metrics: this.getMetrics()
    });
  }

  private async checkLinks(url: string, options: any): Promise<any> {
    console.log(`🔗 LinkChecker checking links for: ${url}`);
    
    // Simulate link checking
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const links = [
      { url: `${url}/home`, status: 200, accessible: true },
      { url: `${url}/about`, status: 200, accessible: true },
      { url: `${url}/products`, status: 200, accessible: true },
      { url: `${url}/broken-link`, status: 404, accessible: false },
      { url: `${url}/external`, status: 200, accessible: true, external: true }
    ];

    const brokenLinks = links.filter(link => !link.accessible);
    
    return {
      url,
      totalLinks: links.length,
      validLinks: links.filter(l => l.accessible).length,
      brokenLinks: brokenLinks.length,
      links,
      issues: brokenLinks.map(link => ({
        url: link.url,
        error: link.status === 404 ? 'Not Found' : 'Other',
        severity: 'high'
      }))
    };
  }

  private async crawlSite(url: string, options: any): Promise<any> {
    console.log(`🕷️ LinkChecker crawling site: ${url}`);
    
    // Simulate site crawling
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    return {
      url,
      crawlDepth: options.depth || 3,
      pagesVisited: 25,
      totalPages: 30,
      crawlTime: 4000,
      structure: {
        pages: [
          { path: '/', level: 0, links: 8 },
          { path: '/about', level: 1, links: 4 },
          { path: '/products', level: 1, links: 12 },
          { path: '/contact', level: 1, links: 3 }
        ],
        assets: {
          images: 45,
          scripts: 12,
          stylesheets: 8,
          documents: 6
        },
        issues: [
          {
            type: 'orphaned-page',
            path: '/old-page',
            severity: 'medium',
            description: 'No internal links to this page'
          }
        ]
      }
    };
  }

  private async validateLinks(links: string[], options: any): Promise<any> {
    console.log(`✅ LinkChecker validating ${links.length} links`);
    
    // Simulate link validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = links.map(link => ({
      url: link,
      status: Math.random() > 0.2 ? 200 : 404,
      responseTime: Math.random() * 1000 + 100,
      accessible: Math.random() > 0.2,
      lastChecked: new Date()
    }));

    return {
      totalLinks: links.length,
      validLinks: results.filter(r => r.accessible).length,
      brokenLinks: results.filter(r => !r.accessible).length,
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      results
    };
  }
}