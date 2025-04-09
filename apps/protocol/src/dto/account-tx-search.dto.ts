import { ApiPropertyOptional } from '@nestjs/swagger';

import { AppHash } from '@ph-blockchain/hash';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Length,
  Matches,
} from 'class-validator';
import { Transformer } from '../utils/transformer';
import { IsExistingOnly } from 'src/decorators/is-valid';

export class AccountTransactionSearchDto {
  @ApiPropertyOptional({
    description: 'Current page',
  })
  @IsOptional()
  @IsExistingOnly<AccountTransactionSearchDto>((ctx) => !ctx.from && !ctx.to, {
    message: 'Pagination with `from` or `to` is currently not supported',
  })
  @Transform(Transformer.toInt)
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({
    description: 'Start row of the transaction',
  })
  @IsOptional()
  @IsExistingOnly<AccountTransactionSearchDto>((ctx) => !ctx.from && !ctx.to, {
    message: 'Custom start row with `from` or `to` is currently not supported.',
  })
  @Transform(Transformer.toInt)
  @IsInt()
  start?: number;

  @ApiPropertyOptional({
    description: 'End row of the transaction',
  })
  @IsOptional()
  @IsExistingOnly<AccountTransactionSearchDto>((ctx) => !ctx.from && !ctx.to, {
    message: 'Custom end row with `from` or `to` is currently not supported.',
  })
  @IsExistingOnly<AccountTransactionSearchDto>((ctx) => !ctx.from && !ctx.to, {
    message: 'Pagination with `from` or `to` is currently not supported',
  })
  @Transform(Transformer.toInt)
  @IsInt()
  end?: number;

  @ApiPropertyOptional({
    description: 'Total number of rows to return',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Set to true if you want to retrieve from latest to oldest',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  reverse?: boolean;

  @ApiPropertyOptional({
    description: 'Search for sender',
  })
  @IsOptional()
  @Matches(AppHash.HASH_REGEX, {
    message: 'Not a valid from address',
  })
  @Length(40, 40, {
    message: 'From address should be in 20 bytes',
  })
  from?: string;

  @ApiPropertyOptional({
    description: 'Search for recipient',
  })
  @IsOptional()
  @Matches(AppHash.HASH_REGEX, {
    message: 'Not a valid to address',
  })
  @Length(40, 40, {
    message: 'To address should be in 20 bytes',
  })
  to?: string;
}
