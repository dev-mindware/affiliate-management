import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class WithdrawalBodyDto {
  @ApiProperty({ example: 8000, minimum: 8000 })
  @IsNumber()
  @Min(8000)
  valor!: number;

  @ApiProperty({ example: "AO06000600000000000000000" })
  @IsString()
  conta_bancaria!: string;

  @ApiProperty({ example: "BAI" })
  @IsString()
  banco!: string;
}
