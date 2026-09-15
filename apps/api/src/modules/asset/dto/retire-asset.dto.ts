import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RetireAssetDto {
  @ApiProperty({
    description: "Official justification for asset retirement",
    example: "End of economic lifecycle",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;

  @ApiPropertyOptional({
    description: "Optional storage or decommission location CUID2 ID",
  })
  @IsOptional()
  @IsString()
  toLocationId?: string;
}
