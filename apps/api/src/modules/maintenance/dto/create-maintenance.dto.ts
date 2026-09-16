import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MaintenancePriority } from "@veylix/types";

export class CreateMaintenanceDto {
  @ApiProperty({ description: "Target asset CUID2 ID to send to maintenance" })
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @ApiProperty({
    description: "Brief summary of the issue or maintenance work order",
    example: "Battery replacement and screen repair",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description:
      "Detailed description of symptoms, diagnostics, or work needed",
    example:
      "Device battery swelling detected; display flickering periodically.",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    enum: MaintenancePriority,
    description: "Ticket urgency level",
    default: MaintenancePriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority = MaintenancePriority.MEDIUM;
}
