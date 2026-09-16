import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { AuditService } from "./audit.service.js";
import { QueryAuditLogDto } from "./dto/query-audit-log.dto.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UserRole } from "@veylix/types";

@ApiTags("Audit")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary:
      "Retrieve paginated, immutable audit trail of system events (INV-005)",
  })
  @ApiResponse({ status: 200, description: "Paginated audit logs" })
  async listAuditLogs(@Query() query: QueryAuditLogDto) {
    return this.auditService.listAuditLogs(query);
  }
}
