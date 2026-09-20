import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsController } from "./metrics.controller.js";

@Module({
  imports: [
    PrometheusModule.register({
      controller: MetricsController,
      path: "/metrics",
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class ObservabilityModule {}
