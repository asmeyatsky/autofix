# Agent Architecture Documentation

## Overview

The AutoFix application has been transformed into an agentic solution with a modular agent architecture. This system enables coordinated automation of frontend debugging, link checking, and testing tasks through specialized agents managed by an orchestrator.

## Core Components

### BaseAgent Class
The foundational class that all agents extend, providing:
- Event emission capabilities
- Message handling framework
- Status management
- Health monitoring
- Metrics collection

### AgentOrchestrator
Manages the coordination of multiple agents:
- Agent registration and lifecycle management
- Message routing between agents
- Health monitoring and recovery
- Workflow execution
- Concurrent operation support

### Agent Types

#### AutoFixAgent
Specialized in frontend debugging and error fixing:
- Error detection and analysis
- Automated code fixing
- Startup monitoring
- Performance metrics collection

#### LinkCheckerAgent
Focuses on website link validation:
- Link discovery and cataloging
- Link validation and accessibility checking
- Deep crawl analysis
- Site structure mapping

#### TestRunnerAgent
Handles comprehensive testing:
- Unit testing execution
- End-to-end browser testing
- Visual regression testing
- Security vulnerability scanning

## Agent Communication

Agents communicate through a standardized message system:
- **Message Format**: Includes ID, sender, receiver, type, payload, timestamp, and priority
- **Message Types**: Commands, responses, data, status updates, heartbeats, and errors
- **Routing**: Messages are routed via the orchestrator to appropriate agents
- **Correlation**: Messages can be correlated to track request-response pairs

## Workflow Execution

The orchestrator supports complex workflows with:
- Sequential and parallel execution steps
- Conditional completion criteria
- Error handling and recovery
- Status tracking and reporting

## Integration Points

### CLI Integration
The `--agentic` flag enables the agent-based workflow in the CLI:
```bash
autofix --url http://localhost:3000 --agentic
```

### Configuration
Agents can be configured through the standard configuration system with additional agentic options.

## Benefits

- **Modularity**: Each agent focuses on specific tasks
- **Scalability**: Easy to add new agents with specific capabilities
- **Coordination**: Agents can work together on complex workflows
- **Reliability**: Built-in health monitoring and error recovery
- **Flexibility**: Both traditional and agentic modes available