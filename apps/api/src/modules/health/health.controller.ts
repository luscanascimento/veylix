import { Controller, Get, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { SkipThrottle } from "@nestjs/throttler";
import { HealthService } from "./health.service.js";
import { Public } from "../../common/decorators/public.decorator.js";

@Public()
@SkipThrottle()
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("liveness")
  @ApiOperation({ summary: "Liveness probe: verifies process is alive" })
  @ApiResponse({ status: 200, description: "Process is alive" })
  getLiveness(@Res() res: Response) {
    const result = this.healthService.getLiveness();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get("readiness")
  @ApiOperation({
    summary: "Readiness probe: verifies system dependencies are healthy",
  })
  @ApiResponse({
    status: 200,
    description: "System is ready to receive traffic",
  })
  @ApiResponse({
    status: 503,
    description: "System dependencies are unavailable",
  })
  async getReadiness(@Res() res: Response) {
    const result = await this.healthService.getReadiness();
    const statusCode =
      result.status === "ok" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(result);
  }
}
