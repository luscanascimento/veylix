import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { DashboardService, DashboardStats } from "./dashboard.service.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UserRole } from "@veylix/types";

@ApiTags("Dashboard")
@ApiBearerAuth("session-cookie")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "Get aggregated dashboard statistics" })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics retrieved successfully",
  })
  async getStats(): Promise<DashboardStats> {
    return this.dashboardService.getStats();
  }
}
