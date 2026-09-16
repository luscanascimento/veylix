import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { MaintenancePriority, MaintenanceStatus } from "@veylix/types";

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ description: "Work order summary title" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: "Detailed description or diagnostic updates",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: MaintenancePriority,
    description: "Updated priority",
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({
    enum: MaintenanceStatus,
    description: "Status transition (e.g. IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ description: "Current accumulated repair cost" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: "Progress notes or technician remarks" })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
