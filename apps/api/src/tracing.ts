import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

export const otelSDK = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "veylix-api",
    [ATTR_SERVICE_VERSION]: "0.1.0",
  }),
  // By default, if no exporter is configured, it will just drop spans or we can use ConsoleSpanExporter in dev.
  // In production, we would configure OTLPTraceExporter.
  instrumentations: [getNodeAutoInstrumentations()],
});

// Initialize the SDK and gracefully shutdown
process.on("SIGTERM", () => {
  otelSDK
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});

// We only start tracing if explicitly enabled or in production, to avoid noise in dev tests
if (process.env["ENABLE_TRACING"] === "true") {
  otelSDK.start();
}
