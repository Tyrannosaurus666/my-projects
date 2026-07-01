# AI 知识库问答系统 (AI Knowledge Base)

RAG-based document Q&A system. Upload documents, ask questions in natural language, and get answers grounded in your knowledge base.

## Architecture

```
User Question → Embedding → Vector Search → Retrieve Chunks → LLM → Answer
                         Document Processing Pipeline:
              Upload → Parse → Chunk → Embedding → Store in Vector DB
```

## Tech Stack

- **Backend**: Java 17 + Spring Boot 3.2 + MyBatis-Plus + MySQL
- **Frontend**: Vue 3 + Element Plus + Vite
- **LLM**: OpenAI API (text-embedding-ada-002 + gpt-3.5-turbo)

## Quick Start

```bash
# Database
mysql -u root -p < db/init.sql

# Backend
cd backend && mvn spring-boot:run   # http://localhost:8080

# Frontend
cd frontend && pnpm install && pnpm dev  # http://localhost:5174
```

Set your OpenAI API key in `backend/src/main/resources/application.yml`.
