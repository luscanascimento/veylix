# Coding Standards & Best Practices

All developers and AI agents must adhere to the following coding standards.

---

## 1. TypeScript Strictness

- `"strict": true` is enforced across the entire repository.
- Never use `any`. Use `unknown` when a type is truly dynamic, and narrow it with type guards.
- Avoid indiscriminate type assertions (`as Type`). Prefer Zod / class-transformer parsing.
- Use discriminated unions for distinct domain states or events.

---

## 2. Clean Layering & SOLID

- **Single Responsibility**: Each class/function has one reason to change.
- **No Logic in Controllers**: Controllers handle HTTP transport only.
- **Domain Autonomy**: Domain logic must not import Prisma or NestJS HTTP artifacts.

---

## 3. Linting & Formatting

- ESLint and Prettier are strictly enforced.
- Code must pass `pnpm lint` and `pnpm format:check` before every commit.
- Do not disable lint or type checks using `eslint-disable` or `@ts-ignore` without explicit lead engineer approval.
