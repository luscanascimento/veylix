import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AssetStatus } from "@veylix/types";

export class CreateAssetDto {
  @ApiProperty({
    description: "Unique patrimony code (format AST-YYYY-NNNN)",
    example: "AST-2024-0001",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^AST-\d{4}-\d{4,}$/, {
    message: "patrimonyNumber must match format AST-YYYY-NNNN",
  })
  patrimonyNumber!: string;

  @ApiProperty({
    description: "Asset descriptive name",
    example: "MacBook Pro 16 M3",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ description: "Category CUID2 ID" })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ description: "Location CUID2 ID" })
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiPropertyOptional({ description: "Initial custodian Employee CUID2 ID" })
  @IsOptional()
  @IsString()
  assignedEmployeeId?: string;

  @ApiProperty({ description: "Manufacturer brand", example: "Apple" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  brand!: string;

  @ApiProperty({ description: "Hardware model", example: "MacBook Pro 16" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  model!: string;

  @ApiPropertyOptional({
    description: "Manufacturer serial number",
    example: "C02G1234MD6R",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  serialNumber?: string;

  @ApiPropertyOptional({
    enum: AssetStatus,
    description:
      "Initial status (defaults to AVAILABLE or IN_USE if employee assigned)",
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiProperty({
    description: "Date of purchase (YYYY-MM-DD)",
    example: "2024-01-15",
  })
  @IsISO8601()
  @IsNotEmpty()
  purchaseDate!: string;

  @ApiProperty({ description: "Acquisition value", example: 3499.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchaseValue!: number;

  @ApiPropertyOptional({
    description: "Additional asset details or specifications",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
