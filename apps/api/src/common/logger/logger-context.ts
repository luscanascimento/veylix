import { AsyncLocalStorage } from "node:async_hooks";

export interface LoggerContext {
  requestId?: string;
  traceId?: string;
  userId?: string;
}

export const loggerAsyncLocalStorage = new AsyncLocalStorage<LoggerContext>();
