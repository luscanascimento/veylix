import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryAuditLogDto {
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
    description: "Filter by resource type (e.g. Asset, Maintenance)",
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ description: "Filter by resource ID" })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: "Filter by actor user ID" })
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @ApiPropertyOptional({
    description:
      "Filter by event name (e.g. ASSET_CREATED, MAINTENANCE_OPENED)",
  })
  @IsOptional()
  @IsString()
  eventName?: string;

  @ApiPropertyOptional({ description: "Filter events from date (ISO 8601)" })
  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @ApiPropertyOptional({ description: "Filter events to date (ISO 8601)" })
  @IsOptional()
  @IsISO8601()
  toDate?: string;
}
