# AutoFix - Agentic Solution User Guide

## Introduction

AutoFix now features an advanced agentic solution that leverages coordinated AI agents to automate frontend debugging, link checking, and testing. This guide explains how to use the new agentic features.

## Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager
- Access to an LLM API (for traditional mode)
- A frontend application to debug

### Installation
```bash
npm install -g autofix-cli
```

## Agentic Mode

### Enabling Agentic Mode
To use the new agent-based workflow, add the `--agentic` flag:

```bash
autofix --url http://localhost:3000 --agentic
```

### Available Agents

#### AutoFix Agent
Automatically detects and fixes frontend errors:
- Monitors startup processes
- Analyzes console and network errors
- Applies automated fixes to source code

#### LinkChecker Agent
Validates website links and structure:
- Crawls website to discover links
- Checks for broken or inaccessible links
- Generates site structure reports

#### TestRunner Agent
Executes comprehensive tests:
- Runs unit tests
- Performs E2E browser tests
- Conducts visual regression tests
- Executes security scans

## Usage Examples

### Basic Agentic Debugging
```bash
autofix --url http://localhost:3000 --project ./src --agentic
```

### Agentic Mode with Custom Settings
```bash
autofix --url http://localhost:3000 --project ./src --agentic --timeout 30000 --max-attempts 5
```

### Using Configuration File
Create `.autofix.json`:
```json
{
  "url": "http://localhost:3000",
  "project": "./src",
  "agentic": true,
  "timeout": 10000,
  "maxAttempts": 5,
  "headless": true
}
```

Then run:
```bash
autofix
```

## Agent Capabilities

### AutoFix Agent Capabilities
- Error detection and analysis
- Automated code fixing
- Startup monitoring
- Performance metrics

### LinkChecker Agent Capabilities
- Link discovery
- Link validation
- Site crawling
- Broken link identification

### TestRunner Agent Capabilities
- Unit testing
- E2E testing
- Visual testing
- Security testing

## Workflow Execution

When using agentic mode, the system executes a coordinated workflow:
1. LinkChecker agent performs initial site validation
2. AutoFix agent monitors and analyzes startup errors
3. AutoFix agent applies necessary fixes
4. TestRunner agent validates the fixes

## Comparison: Traditional vs Agentic Mode

| Feature | Traditional Mode | Agentic Mode |
|---------|------------------|--------------|
| Error Detection | Single agent | Coordinated agents |
| Link Checking | Manual | Automated |
| Testing | Manual | Automated |
| Scalability | Limited | Highly scalable |
| Flexibility | Fixed workflow | Customizable workflows |

## Troubleshooting

### Common Issues
- **Module Resolution**: Ensure you're using the latest build after the agentic transformation
- **Agent Registration**: Verify all agents are properly registered with the orchestrator
- **Communication**: Check that agents can communicate through the message system

### Debugging
Enable verbose logging to troubleshoot agent communication:
```bash
DEBUG=autofix:* autofix --url http://localhost:3000 --agentic
```

## Best Practices

- Use agentic mode for complex debugging scenarios
- Combine with traditional mode for comprehensive coverage
- Regularly update agent configurations
- Monitor agent health and performance metrics