# Debugging Guide

## 1. API Backend Debugging

- Enable verbose debug logs: Set `LOG_LEVEL=debug` in `.env`.
- View formatted pretty logs in local terminal:
  ```bash
  pnpm --filter api dev | npx pino-pretty
  ```

## 2. Database Query Debugging

- Enable Prisma query logging: Set `DEBUG="prisma:query"` in your environment.
- Inspect database directly via Prisma Studio:
  ```bash
  pnpm db:studio
  ```

## 3. Test Debugging

- Run specific test with Vitest UI:
  ```bash
  pnpm vitest --ui
  ```
