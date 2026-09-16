import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CloseMaintenanceDto {
  @ApiPropertyOptional({
    description: "Total final cost of repair/maintenance",
    example: 180.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiProperty({
    description:
      "Detailed resolution summary of actions performed to fix the issue",
    example:
      "Replaced battery module with OEM part and calibrated power controller.",
  })
  @IsString()
  @IsNotEmpty()
  resolutionNotes!: string;
}
