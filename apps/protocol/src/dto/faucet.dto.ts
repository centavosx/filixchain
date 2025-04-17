import { ApiProperty } from '@nestjs/swagger';
import { AppHash } from '@ph-blockchain/hash';
import { IsString, Length, Matches } from 'class-validator';

export class FaucetDto {
  @ApiProperty()
  @IsString()
  @Matches(AppHash.HASH_REGEX, {
    message: 'Not a valid to address',
  })
  @Length(40, 40, {
    message: 'To address should be in 20 bytes',
  })
  address: string;
}
