import { RawBlock, Transaction } from '@ph-blockchain/block';
import { AppHash } from '@ph-blockchain/hash';
import {
  IsNumber,
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';

export class RawBlockDto implements RawBlock {
  @IsNotEmpty()
  @IsString()
  mintAddress: string;

  @IsNotEmpty()
  @IsString()
  version: string;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  transactions: string[];

  @IsNotEmpty()
  @IsString()
  previousHash: string;

  @IsNotEmpty()
  @IsString()
  targetHash: string;

  @IsNotEmpty()
  @IsString()
  blockHash: string;

  @IsNotEmpty()
  @IsNumber()
  nonce: number;

  @IsOptional()
  @IsString()
  merkleRoot: string;

  @IsNotEmpty()
  @IsNumber()
  transactionSize: number;
}

export class InitAccountDto {
  @IsNotEmpty()
  @IsString()
  @Matches(AppHash.HASH_REGEX, {
    message: 'Not a valid address',
  })
  @Length(40, 40, {
    message: 'Address should be in 20 bytes',
  })
  address: string;
}
