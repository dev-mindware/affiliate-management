import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class WithdrawalBodyDto {
  @ApiProperty({ example: 25000, minimum: 25000 })
  @IsNumber()
  @Min(25000)
  valor!: number;

  @ApiProperty({ example: "AO06000600000000000000000" })
  @IsString()
  conta_bancaria!: string;

  @ApiProperty({ example: "BAI" })
  @IsString()
  banco!: string;
}
