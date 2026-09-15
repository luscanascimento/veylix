import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AssignAssetDto {
  @ApiProperty({ description: "Target employee CUID2 ID to assign custody to" })
  @IsString()
  @IsNotEmpty()
  toEmployeeId!: string;

  @ApiProperty({
    description: "Target location CUID2 ID where asset is physically stationed",
  })
  @IsString()
  @IsNotEmpty()
  toLocationId!: string;

  @ApiProperty({
    description: "Operational reason for initial assignment",
    example: "New hire equipment provisioning",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;
}
