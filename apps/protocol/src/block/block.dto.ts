import { RawBlock } from '@ph-blockchain/block';
import {
  IsNumber,
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class RawBlockDto implements RawBlock {
  @IsNotEmpty()
  @IsString()
  version: string;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsNotEmpty()
  @IsNumber()
  timestamp: number;

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
