import { AsyncLocalStorage } from "async_hooks";

export interface RequestContextData {
  requestId: string;
  traceId: string;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextData>();
