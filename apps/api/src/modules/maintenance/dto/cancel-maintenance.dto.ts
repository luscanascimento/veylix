import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CancelMaintenanceDto {
  @ApiProperty({
    description: "Justification for cancelling the maintenance work order",
    example:
      "Duplicate ticket created by mistake; issue resolved by user restart.",
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
