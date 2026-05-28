import { ApiProperty } from "@nestjs/swagger";

export class WithdrawalBodyDto {
  @ApiProperty({ example: 25000, minimum: 25000 })
  valor!: number;

  @ApiProperty({ example: "AO06000600000000000000000" })
  conta_bancaria!: string;

  @ApiProperty({ example: "BAI" })
  banco!: string;
}
