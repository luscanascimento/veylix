import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
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
import { AssetService } from "./services/AssetService.js";
import {
  CreateAssetDto,
  UpdateAssetDto,
  QueryAssetDto,
  AssignAssetDto,
  TransferAssetDto,
  ReturnAssetDto,
  RetireAssetDto,
} from "./dto/index.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { UserRole } from "@veylix/types";

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

@ApiTags("Assets")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("assets")
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({
    summary:
      "List assets with pagination, multi-criteria filtering, and text search",
  })
  @ApiResponse({ status: 200, description: "Paginated list of assets" })
  async listAssets(@Query() query: QueryAssetDto) {
    return this.assetService.listAssets(query);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "Get asset details by ID with relations" })
  @ApiResponse({ status: 200, description: "Asset details" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async getAssetById(@Param("id") id: string) {
    return this.assetService.getAssetById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new physical asset" })
  @ApiResponse({ status: 201, description: "Asset created successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid input or inactive relation",
  })
  @ApiResponse({ status: 409, description: "Patrimony number already exists" })
  async createAsset(
    @Body() dto: CreateAssetDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.assetService.createAsset(dto, user.id);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary:
      "Update asset descriptive fields protected by optimistic concurrency locking (INV-007)",
  })
  @ApiResponse({ status: 200, description: "Asset updated successfully" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  @ApiResponse({ status: 409, description: "Optimistic concurrency conflict" })
  async updateAsset(@Param("id") id: string, @Body() dto: UpdateAssetDto) {
    return this.assetService.updateAsset(id, dto);
  }

  @Post(":id/assign")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Assign an unassigned asset to an employee custodian (INV-001, INV-004, INV-007)",
  })
  @ApiResponse({ status: 200, description: "Asset assigned successfully" })
  @ApiResponse({
    status: 400,
    description: "Domain invariant violation or invalid employee",
  })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async assignAsset(
    @Param("id") id: string,
    @Body() dto: AssignAssetDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.assetService.assignAsset(id, dto, user.id);
  }

  @Post(":id/transfers")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Transfer asset custody between employees (INV-002, INV-003, INV-004, INV-007)",
  })
  @ApiResponse({ status: 200, description: "Asset transferred successfully" })
  @ApiResponse({
    status: 400,
    description: "Domain invariant violation or invalid employee",
  })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async transferAsset(
    @Param("id") id: string,
    @Body() dto: TransferAssetDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.assetService.transferAsset(id, dto, user.id);
  }

  @Post(":id/return")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Return asset from employee custody back into available inventory (INV-002, INV-003, INV-004)",
  })
  @ApiResponse({ status: 200, description: "Asset returned successfully" })
  @ApiResponse({ status: 400, description: "Domain invariant violation" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async returnAsset(
    @Param("id") id: string,
    @Body() dto: ReturnAssetDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.assetService.returnAsset(id, dto, user.id);
  }

  @Post(":id/retire")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Retire an asset permanently from active lifecycle (INV-002, INV-003, INV-004)",
  })
  @ApiResponse({ status: 200, description: "Asset retired successfully" })
  @ApiResponse({ status: 400, description: "Domain invariant violation" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async retireAsset(
    @Param("id") id: string,
    @Body() dto: RetireAssetDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.assetService.retireAsset(id, dto, user.id);
  }

  @Get(":id/movements")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({
    summary:
      "Retrieve immutable chain-of-custody movement history for an asset",
  })
  @ApiResponse({ status: 200, description: "List of asset movements" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async getAssetMovements(@Param("id") id: string) {
    return this.assetService.getAssetMovements(id);
  }
}
