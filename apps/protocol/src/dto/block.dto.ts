import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Transformer } from 'src/utils/transformer';

export type RawBlock = {
  readonly version: string;
  readonly height: number;
  readonly timestamp?: number;
  readonly transactions: string[];
  readonly previousHash: string;
  readonly targetHash: string;
  readonly blockHash: string;
  readonly nonce: number;
  readonly merkleRoot: string;
  readonly transactionSize: number;
};

export type RawBlockDb = {
  version: string;
  height: string;
  timestamp: string;
  transactions: string[];
  previousHash: string;
  targetHash: string;
  blockHash: string;
  nonce: string;
  merkleRoot: string;
  transactionSize: number;
};

export class BlockHeightQuery {
  @ApiPropertyOptional({
    description: 'Current page',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({
    description: 'Start height of the block. Defaults to zero',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsNumber()
  start?: number;

  @ApiPropertyOptional({
    description:
      'End height of the block. Defaults to the latest block height.',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsNumber()
  end?: number;

  @ApiPropertyOptional({
    description: 'Set to true if you want to retrieve from latest to oldest',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  reverse?: boolean;

  @ApiPropertyOptional({
    description: 'Total number of rows to . (Defaults to 20)',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsNumber()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Set to true if you want to include the encoded tx in the result',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  includeTx?: boolean;
}

export class BlockTransactionQuery {
  @ApiPropertyOptional({
    description: 'Last block height query',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsNumber()
  lastBlockHeight?: number;

  @ApiPropertyOptional({
    description: 'Last txIndex query',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsNumber()
  nextTxIndex?: number;

  @ApiPropertyOptional({
    description: 'Set to true if you want to retrieve from latest to oldest',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  reverse?: boolean;

  @ApiPropertyOptional({
    description: 'Total number of rows to. (Defaults to 20)',
  })
  @IsOptional()
  @Transform(Transformer.toInt)
  @IsPositive()
  limit?: number;
}
