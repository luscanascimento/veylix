import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAssetDto {
  @ApiProperty({
    description:
      "Current asset version for optimistic concurrency control (INV-007)",
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  version!: number;

  @ApiPropertyOptional({
    description: "Asset descriptive name",
    example: "MacBook Pro 16 M3 Max",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: "Category CUID2 ID" })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Manufacturer brand", example: "Apple" })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  brand?: string;

  @ApiPropertyOptional({
    description: "Hardware model",
    example: "MacBook Pro 16",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  model?: string;

  @ApiPropertyOptional({
    description: "Manufacturer serial number",
    example: "C02G1234MD6R",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  serialNumber?: string;

  @ApiPropertyOptional({
    description: "Date of purchase (YYYY-MM-DD)",
    example: "2024-01-15",
  })
  @IsOptional()
  @IsISO8601()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: "Acquisition value", example: 3499.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchaseValue?: number;

  @ApiPropertyOptional({
    description: "Additional asset details or specifications",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
