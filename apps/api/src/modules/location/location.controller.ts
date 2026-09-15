import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { LocationService } from "./location.service.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UserRole } from "@veylix/types";

@ApiTags("Locations")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("locations")
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "List all active physical locations" })
  @ApiResponse({ status: 200, description: "List of active locations" })
  async listLocations() {
    return this.locationService.listLocations();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "Get location details by ID" })
  @ApiResponse({ status: 200, description: "Location details" })
  @ApiResponse({ status: 404, description: "Location not found" })
  async getLocationById(@Param("id") id: string) {
    return this.locationService.getLocationById(id);
  }
}
