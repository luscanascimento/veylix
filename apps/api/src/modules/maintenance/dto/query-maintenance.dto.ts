import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { MaintenancePriority, MaintenanceStatus } from "@veylix/types";

export class QueryMaintenanceDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({
    enum: MaintenanceStatus,
    description: "Filter by ticket status",
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({
    enum: MaintenancePriority,
    description: "Filter by priority level",
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({ description: "Filter by asset CUID2 ID" })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({
    description: "Search query across title, ticket number, and description",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Sort direction (e.g. createdAt:desc, priority:asc)",
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
