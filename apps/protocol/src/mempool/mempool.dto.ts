import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MempoolDto {
  @ApiProperty({
    description: 'Signed transaction to be added in the mempool',
  })
  @IsNotEmpty()
  @IsString()
  transaction: string;
}
