import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { MaintenanceService, RequestAuditMeta } from "./maintenance.service.js";
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CloseMaintenanceDto,
  CancelMaintenanceDto,
  QueryMaintenanceDto,
} from "./dto/index.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { UserRole } from "@veylix/types";
import { VeylixRequest } from "../../common/middleware/request-id.middleware.js";

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

@ApiTags("Maintenance")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("maintenance")
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  private extractAuditMeta(req: VeylixRequest): RequestAuditMeta {
    return {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      requestId: req.requestId,
      traceId: req.traceId,
    };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      "Open a new maintenance work order and transition asset to MAINTENANCE (INV-006)",
  })
  @ApiResponse({ status: 201, description: "Maintenance opened successfully" })
  @ApiResponse({ status: 400, description: "Invalid asset state or data" })
  @ApiResponse({
    status: 409,
    description: "Asset already in active maintenance",
  })
  async openMaintenance(
    @Body() dto: CreateMaintenanceDto,
    @CurrentUser() user: RequestUser,
    @Req() req: VeylixRequest,
  ) {
    return this.maintenanceService.openMaintenance(
      dto,
      user.id,
      this.extractAuditMeta(req),
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({
    summary:
      "List maintenance tickets with status, priority, and asset filters",
  })
  @ApiResponse({ status: 200, description: "Paginated list of tickets" })
  async listMaintenance(@Query() query: QueryMaintenanceDto) {
    return this.maintenanceService.listMaintenance(query);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "Get maintenance ticket details by ID" })
  @ApiResponse({ status: 200, description: "Ticket details" })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async getMaintenanceById(@Param("id") id: string) {
    return this.maintenanceService.getMaintenanceById(id);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: "Update an open or in-progress maintenance ticket" })
  @ApiResponse({ status: 200, description: "Ticket updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Cannot update completed or cancelled ticket",
  })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async updateMaintenance(
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: RequestUser,
    @Req() req: VeylixRequest,
  ) {
    return this.maintenanceService.updateMaintenance(
      id,
      dto,
      user.id,
      this.extractAuditMeta(req),
    );
  }

  @Post(":id/close")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Close maintenance ticket upon completion and restore asset state (INV-006)",
  })
  @ApiResponse({ status: 200, description: "Ticket closed and asset restored" })
  @ApiResponse({ status: 400, description: "Invalid ticket or asset state" })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async closeMaintenance(
    @Param("id") id: string,
    @Body() dto: CloseMaintenanceDto,
    @CurrentUser() user: RequestUser,
    @Req() req: VeylixRequest,
  ) {
    return this.maintenanceService.closeMaintenance(
      id,
      dto,
      user.id,
      this.extractAuditMeta(req),
    );
  }

  @Post(":id/cancel")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Cancel a maintenance ticket and restore asset state (INV-006)",
  })
  @ApiResponse({
    status: 200,
    description: "Ticket cancelled and asset restored",
  })
  @ApiResponse({ status: 400, description: "Invalid ticket or asset state" })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async cancelMaintenance(
    @Param("id") id: string,
    @Body() dto: CancelMaintenanceDto,
    @CurrentUser() user: RequestUser,
    @Req() req: VeylixRequest,
  ) {
    return this.maintenanceService.cancelMaintenance(
      id,
      dto,
      user.id,
      this.extractAuditMeta(req),
    );
  }
}
