import { Controller, Get, Res } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { Response } from "express";

@Controller()
export class MetricsController extends PrometheusController {
  @Get()
  override async index(@Res() response: Response) {
    return super.index(response);
  }
}
