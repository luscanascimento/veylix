import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AssetStatus } from "@veylix/types";

export class QueryAssetDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Number of items per page", default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({
    enum: AssetStatus,
    description: "Filter by asset status",
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ description: "Filter by category ID" })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Filter by location ID" })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: "Filter by assigned employee ID" })
  @IsOptional()
  @IsString()
  assignedEmployeeId?: string;

  @ApiPropertyOptional({
    description: "Text search (patrimony, name, serial number, brand, model)",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Sorting field and direction (e.g. createdAt:desc, name:asc)",
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
