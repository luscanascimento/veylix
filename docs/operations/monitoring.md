# Monitoring & Metrics Guide

## 1. Golden Signals

| Signal         | Metric                                     | Target SLA                                 |
| -------------- | ------------------------------------------ | ------------------------------------------ |
| **Latency**    | `http_request_duration_seconds` (p95, p99) | p95 $< 100\text{ms}$, p99 $< 250\text{ms}$ |
| **Traffic**    | `http_requests_total`                      | Monitored per route and method             |
| **Errors**     | `http_requests_5xx_total`                  | Error rate $< 0.05\%$                      |
| **Saturation** | Database pool utilization, CPU, Memory     | Pool $< 70\%$, Memory $< 80\%$             |

---

## 2. Alerting Rules

- High 5xx Error Rate ($> 1\%$ over 5 minutes) $\to$ SEV-1 Alert.
- Database Connection Pool Exhaustion ($> 90\%$ for 2 minutes) $\to$ SEV-2 Alert.
- Repeated Login Failures ($> 50$ failures/min) $\to$ Security Warning.
