# AI Agent 自动化工作流 (AI Agent Workflow)

An extensible AI Agent system with OpenAI Function Calling, tool orchestration, and real-time chat interface.

## Features

- Multi-agent management with configurable system prompts
- Built-in tools: web search, calculator, web scraping, time/date
- OpenAI Function Calling for intelligent tool selection
- Async workflow execution with polling status updates
- Real-time chat interface with tool call visualization

## Tech Stack

- **Backend**: Java 17 + Spring Boot 3.2 + MyBatis-Plus + MySQL + WebSocket
- **Frontend**: Vue 3 + Element Plus + highlight.js + Vite

## Quick Start

```bash
# Database
mysql -u root -p < db/init.sql

# Backend
cd backend && mvn spring-boot:run   # http://localhost:8080

# Frontend
cd frontend && pnpm install && pnpm dev  # http://localhost:5173
```

Set your OpenAI API key in `backend/src/main/resources/application.yml`.
