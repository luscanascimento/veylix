import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TransferAssetDto {
  @ApiPropertyOptional({
    description: "Optional current employee CUID2 ID to verify transfer origin",
  })
  @IsOptional()
  @IsString()
  fromEmployeeId?: string;

  @ApiProperty({ description: "Target employee CUID2 ID receiving custody" })
  @IsString()
  @IsNotEmpty()
  toEmployeeId!: string;

  @ApiProperty({ description: "Target location CUID2 ID" })
  @IsString()
  @IsNotEmpty()
  toLocationId!: string;

  @ApiProperty({
    description: "Business reason for transfer",
    example: "Department change to Engineering",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;
}
