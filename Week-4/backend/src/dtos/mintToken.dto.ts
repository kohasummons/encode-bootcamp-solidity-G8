import { ApiProperty } from '@nestjs/swagger';
import { parseEther } from 'viem';

export class MintTokenDto {
  @ApiProperty({ type: String, required: true, default: 'My Address' })
  address: `0x${string}`;

  @ApiProperty({ type: Number, required: true, default: parseEther('100') })
  amountToMint: bigint;
}
