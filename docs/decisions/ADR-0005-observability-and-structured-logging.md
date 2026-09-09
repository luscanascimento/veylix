# ADR-0005: Observability and Structured Logging

## Status

Accepted

## Context

To operate Veylix reliably in near-production environments, we need structured logging, distributed tracing, error diagnostics, and metrics correlation without performance degradation or sensitive secret leakage.

## Decision

1. Use **Pino** for high-performance structured JSON logging on standard output.
2. Use **OpenTelemetry Node SDK** for distributed tracing and metrics collection.
3. Propagate correlation identifiers across all layers: `request_id`, `trace_id`, `span_id`.
4. Implement automated secret redaction serializers in Pino to prevent logging passwords, session tokens, or authorization headers.
5. Maintain a strictly cataloged event taxonomy (`docs/observability/log-events.md`).

## Alternatives Considered

- _Standard `console.log`_: Unstructured, difficult to query, lacks log levels and contextual metadata.
- _Winston_: Popular, but significantly slower than Pino in high-throughput JSON serialization.

## Consequences

- **Positive**: Machine-parseable logs, instant correlation between logs, traces, and audit entries, zero secret leakage, low runtime overhead.
- **Negative**: Requires consistent use of structured logging interfaces rather than ad-hoc logging.
