import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReturnAssetDto {
  @ApiProperty({
    description: "Target storage location CUID2 ID where asset will be held",
  })
  @IsString()
  @IsNotEmpty()
  toLocationId!: string;

  @ApiProperty({
    description: "Reason for returning asset to inventory",
    example: "Employee offboarding",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;
}
