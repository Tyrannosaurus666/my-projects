# 财务管理系统 (Financial Management)

Personal finance management system supporting accounts, transactions, budgets, bills, and dashboard analytics.

## Tech Stack

- **Backend**: Java 17 + Spring Boot 3.2 + MyBatis-Plus + MySQL + JWT
- **Frontend**: Vue 3 + Element Plus + Vite

## Quick Start

```bash
# Database
mysql -u root -p < db/init.sql

# Backend
cd backend && mvn spring-boot:run   # http://localhost:8080

# Frontend
cd frontend && pnpm install && pnpm dev  # http://localhost:5173
```

Configure `backend/src/main/resources/application.yml` with your database credentials.
