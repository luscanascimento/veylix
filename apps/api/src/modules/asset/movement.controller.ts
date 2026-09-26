import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { AssetService } from "./services/AssetService.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UserRole } from "@veylix/types";

@ApiTags("Movements")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("movements")
export class MovementController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({
    summary:
      "Retrieve paginated list of all asset movements and custody transfers",
  })
  @ApiResponse({ status: 200, description: "Paginated list of movements" })
  async listMovements(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
  ) {
    return this.assetService.listAllMovements(
      page ? Number(page) : 1,
      limit ? Number(limit) : 25,
      search,
    );
  }
}
