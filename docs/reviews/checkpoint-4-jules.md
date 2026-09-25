# CHECKPOINT 4: Auditoria de Observabilidade por Jules

## Visão Geral

Este documento relata as descobertas da auditoria de observabilidade no checkpoint 4, focando na implementação de métricas, traces e logs no Veylix.

## Alterações Realizadas

1. **OpenTelemetry (Traces):**
   - Instalado e configurado o Node SDK para o OpenTelemetry (`@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/semantic-conventions`, `@opentelemetry/resources`).
   - Criado o arquivo `apps/api/src/tracing.ts` e exportada a função `setupTracing()`.
   - Modificado o `main.ts` para inicializar a instrumentação do OpenTelemetry (carregando o SDK antes do `NestFactory`) com `ATTR_SERVICE_NAME` igual a `veylix-api`.

2. **Métricas Prometheus:**
   - Adicionada a dependência `@willsoto/nestjs-prometheus` e `prom-client`.
   - Criado um módulo `MetricsModule` e um `MetricsController` herdando as rotas da biblioteca para exportar o endpoint público `/metrics`.
   - O controlador foi exposto globalmente pelo `AppModule`.

3. **Injeção de Contexto no Pino (Logs):**
   - Implementado o uso da API `AsyncLocalStorage` (`node:async_hooks`) no `apps/api/src/common/logger/logger-context.ts` contendo `requestId`, `traceId` e `userId`.
   - O `RequestIdMiddleware` foi atualizado para englobar a chamada a `next()` no `loggerAsyncLocalStorage.run()`, populando as informações de trace e request ID no contexto global assíncrono de cada requisição.
   - O `AppLogger` (`pino.logger.ts`) foi modificado usando o campo `mixin` para injetar os dados armazenados na `AsyncLocalStorage` nos logs automaticamente.

## Testes e Validações

- Todos os pacotes internos foram verificados via Typecheck (`pnpm run typecheck`), sem erros de tipos.
- A suíte de testes existente (`pnpm run test`) completou com sucesso (163 testes).
- A compilação do monorepo completou com sucesso (`pnpm run build`), garantindo conformidade com a 'Definition of Done'.

## Conclusões Arquiteturais

A introdução do padrão de observabilidade usando o trio OpenTelemetry (Traces), Prometheus (Metricas) e Pino (Logs estruturados com mixin baseado em ALS) confere ao Veylix um alto grau de confiabilidade para produção. A implementação segue os princípios SOLID e as restrições da arquitetura (ADRs). As fronteiras de aplicação estão mantidas.

**Status:** APROVADO.
