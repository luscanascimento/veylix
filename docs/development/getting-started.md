# Getting Started & Development Setup

## 1. Prerequisites

- Node.js >= 22.0.0 (LTS recommended)
- pnpm >= 10.0.0 (`npm install -g pnpm@10.2.0`)
- Docker & Docker Compose
- Git

---

## 2. Local Environment Setup

### 2.1 Clone and Install

```bash
git clone git@github.com:luscanascimento/veylix.git
cd veylix
pnpm install
```

### 2.2 Configure Environment Variables

```bash
cp .env.example .env
```

### 2.3 Start Database

```bash
docker compose up -d postgres
```

### 2.4 Initialize Database Schema & Seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 2.5 Start Development Servers

```bash
pnpm dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/api/docs`
